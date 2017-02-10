/* StoPlay Content JS */

var StoPlay = {
    injectScript: function (scriptText) {
        var script   = document.createElement('script');
        script.type  = "text/javascript";
        script.text  = scriptText;

        var target = document.getElementsByTagName('script')[0];
        target.parentNode.insertBefore(script, target);
        return script;
    }
}

var Provider = function () {
    var _this = this;

    this.allowed = [];

    this.status = 'paused';
    this.playingTitle = '';
    this.interval = null;
    this.checkTitleInterval = null;
    this.events = {};

    this.isInstalled();

    // check if not disabled globally or this very service
    chrome.storage.sync.get({
        enabled: true,
        providers: []
    }, function(items) {
        if (items.enabled === true) {
            _this._parseAllowedProviders.call(_this, items.providers);
        }
    });

};

Provider.prototype._parseAllowedProviders = function(providers) {
    if (!providers.length) return;
    var allowed = [];
    // check if any of the providers is disabled
    for (var i = 0; i < providers.length; i++) {
        if (providers[i]['enabled'] === true ) {
            allowed.push(providers[i]['uri']);
        }

        if (i == providers.length - 1) {
            this.allowed = allowed;

            if (this.detectProvider()) {
                this.init();
                this.interval = setInterval(function () {
                    this.checkStatus();
                    this.checkAnnoyingLightboxes();
                }.bind(this), 1000);
                this.checkTitleInterval = setInterval(this.checkTitle.bind(this), 10000);
            } else {
                return false;
            }

        }

    }
}

Provider.prototype.isInstalled = function () {
    if (window.location.host.replace('www.', '') == 'stoplay_page.dev'
        || window.location.host.replace('www.', '') == 'stoplay.github.io') {
        document.querySelector("body").className = document.querySelector("body").className + " m_installed";
    }
};

Provider.prototype.on = function (name, callback) {
    if (typeof this.events[name] === 'undefined') this.events[name] = [];

    this.events[name].push(callback);

    return this;
};

Provider.prototype.trigger = function (name) {
    if (typeof this.events[name] === 'undefined') return;

    var l = this.events[name].length,
            i = 0;
    while(i < l) {
        this.events[name][i].call();
        i++;
    }
};

Provider.prototype.detectProvider = function () {
    this.host = window.location.host.replace('www.', '');

    var clearSubDomains = "";
    if (this.host.split("bandcamp.com").length > 1) {
        clearSubDomains = "bandcamp.com";
    }
    if (clearSubDomains) this.host = clearSubDomains;

    return (this.allowed.indexOf(this.host) >= 0);
};

Provider.prototype.attachEvents = function () {
    var _this = this;

    this
        .on('start', function () {
            _this.status = 'playing';
            chrome.runtime.sendMessage({action: 'started', title: _this.getTitle()});
        })
        .on('pause', function () {
            _this.status = 'paused';
            chrome.runtime.sendMessage({action: 'paused'});
        })
        .on('updateTitle', function () {
            chrome.runtime.sendMessage({action: 'updateTitle', title: _this.playingTitle});
        });
};

Provider.prototype.__changeState = function (status) {
    if (status != this.status) {
        switch(status) {
            case "playing":
                this.trigger( 'start' );
                break;

            case "paused":
                this.trigger( 'pause' );
                break;
        }
    }
};

Provider.prototype.getTitle = function () {
    var title = '';

    switch(this.host) {
        case "play.google.com":
            var songName = document.getElementById('currently-playing-title').textContent;
            var songArtist = document.getElementById('player-artist').textContent;

            title = songArtist + ' - ' + songName;
            break;
    }

    return title;
};

Provider.prototype.checkTitle = function () {
    var currentTitle = this.getTitle();

    if (currentTitle !== this.playingTitle) {
        this.playingTitle = currentTitle;
        this.trigger('updateTitle');
    }
};

Provider.prototype.init = function () {
    this.attachEvents();

    switch(this.host) {
        case "dailymotion.com":
            StoPlay.injectScript(`setInterval(function () {
                window.playerV5.addEventListener("play", function () {
                    window.localStorage.setItem('stoplaystate', 'playing');
                });
                window.playerV5.addEventListener("pause", function () {
                    window.localStorage.setItem('stoplaystate', 'paused');
                });
                window.playerV5.addEventListener("ended", function () {
                    window.localStorage.setItem('stoplaystate', 'paused');
                });
            }, 200);`);
            break;
    }
};

Provider.prototype.checkStatus = function () {
    var status, p;

    switch(this.host) {
        case "fs.to":
        case "brb.to":
            if (document.getElementById('player_api')) {
                p = document.getElementById('player_api');
                if (p && p.fp_getState) {
                    status = p.fp_getState() == 3 ? 'playing' : 'paused';
                }
            } else if (document.querySelector('.b-aplayer__html5-desktop')) {
                p = document.querySelectorAll('.b-aplayer__html5-desktop');
                if (p.length > 0) {
                    p = Array.prototype.filter.call(p, function(el) {
                        return getComputedStyle(el)['display'] !== 'none';
                    })[0];
                }
                if (p.play) {
                    status = p.paused ? 'paused' : 'playing';
                }
            }
            break;

        case "baboom.com":
            status = document.querySelector('#player .main-player-view')
                && document.querySelector('#player .main-player-view').classList.contains('state-playing') ? 'playing' : 'paused';
            break;

        case "ex.ua":
            status = document.querySelector('.vjs-play-control')
                && document.querySelector('.vjs-play-control').classList.contains('vjs-playing') ? 'playing' : 'paused';
            break;

        case "vk.com":
            status = document.getElementById('head_play_btn')
                && document.getElementById('head_play_btn').classList.contains('playing') ? 'playing' : 'paused';
            break;

        case "new.vk.com":
            status = document.querySelector('.top_audio_player')
                && document.querySelector('.top_audio_player').classList.contains('top_audio_player_playing') ? 'playing' : 'paused';
            break;

        case "ted.com":
            status = document.getElementById('streamingPlayerSWF') && document.getElementById('streamingPlayerSWF').isVideoPlaying && document.getElementById('streamingPlayerSWF').isVideoPlaying() ? 'playing' : 'paused';
            break;

        case "last.fm":
            status = document.getElementById('webRadio').classList.contains('playing') ? 'playing' : 'paused';
            break;

        case "rutube.ru":
            p = document.querySelector('#video-object-container iframe') && document.querySelector('#video-object-container iframe').contentDocument.getElementById('rutubePlayerHolder_flash_api');
            if (p) {
                status = p.getPlayerState && p.getPlayerState();
            }
            break;

        case "pleer.com":
            status = document.querySelector('#player #play').classList.contains('pause') ? 'playing' : 'paused';
            break;

        case "vimeo.com":
        case "player.vimeo.com":
            status = document.querySelector('.play.state-playing') ? 'playing' : 'paused';
            break;

        case "tunein.com":
            status = document.getElementById('tuner') && document.getElementById('tuner').classList.contains('playing') ? 'playing' : 'paused';
            break;

        case "muzebra.com":
            status = document.querySelector('#player button.play').classList.contains('icon-pause') ? 'playing' : 'paused';
            break;

        case "facebook.com":
        case "kickstarter.com":
            var videos = document.getElementsByTagName('video');

            if (videos.length > 0) {
                status = 'paused';

                for (var i = 0; i < videos.length; i++) {
                    if (videos[i] && !videos[i].paused) {
                        status = 'playing';
                    }
                }
            }
            break;

        case "youtube.com":
            p = document.getElementById("movie_player") || document.querySelector('.html5-video-player');

            if (p && p.getPlayerState) {
                status = p.getPlayerState() == 1 ? 'playing' : 'paused';
            } else if (document.querySelector('.html5-main-video')) {
                status = document.querySelector('.html5-main-video').paused ? 'paused' : 'playing';
            } else if (document.getElementById("movie_player")) {
                status = document.getElementById("movie_player") && document.getElementById("movie_player").classList.contains('playing-mode') ? 'playing' : 'paused';
            }
            break;

        case "seasonvar.ru":
            status = document.querySelector('#vpcenter object').getUppod && document.querySelector('#vpcenter object').getUppod('getstatus');
            status = status == 1 ? 'playing' : 'paused';
            break;

        case "play.google.com":
            status = document.querySelector('[data-id="play-pause"]').classList.contains('playing') ? 'playing' : 'paused';
            break;

        case "music.yandex.ru":
        case "music.yandex.ua":
            status = document.querySelector('.player-controls__btn_play').classList.contains('player-controls__btn_pause') ? 'playing' : 'paused';
            break;
        case "mixcloud.com":
            status = document.querySelector('.player-control') &&
                document.querySelector('.player-control')
                .classList.contains('pause-state') ? 'playing' : 'paused';
            break;
        case "soundcloud.com":
            status = document.querySelector('.playControl').classList.contains('playing') ? 'playing' : 'paused';
            break;
        case "jazzradio.com":
            status = document.querySelector('#now-playing .status') &&
                document.querySelector('#now-playing .status')
                .textContent.toLocaleLowerCase() == 'now playing' ? 'playing' : 'paused';
            break;
        case "v5player.slipstreamradio.com":
            status = document.getElementById('statusLabel') &&
                document.getElementById('statusLabel')
                .textContent.toLocaleLowerCase() == 'playing' ? 'playing' : 'paused';
            break;
        case "play.spotify.com":
            status = document.getElementById('play-pause') &&
                document.getElementById('play-pause').classList.contains('playing') ? 'playing' : 'paused';
            break;
        case "bandcamp.com":
            status = document.querySelector('.inline_player .playbutton') &&
                document.querySelector('.inline_player .playbutton').classList.contains('playing') ? 'playing' : 'paused';
            break;
        case "promodj.com":
            status = document.querySelector('.playerr_bigplaybutton .playerr_bigpausebutton') ? 'playing' : 'paused';
            break;
        case "hearthis.at":
            status = document.body.classList && document.body.classList.contains('play') ? 'playing' : 'paused';
            break;
        case "courses.prometheus.org.ua":
            status = document.querySelector('.video-controls .video_control').classList.contains('pause') ? 'playing' : 'paused';
            break;
        case "dailymotion.com":
            localStorageState = window.localStorage.getItem('stoplaystate');
            status = localStorageState ? localStorageState : null;
            break;
         case "coursera.org":
            var selector = document.querySelector('.c-video-control.vjs-control');
            status = selector && selector.classList.contains('vjs-playing') ? 'playing' : 'paused';
            break;
   }

    status && this.__changeState(status);
};

Provider.prototype.checkAnnoyingLightboxes = function () {
    var modal;

    switch (this.host) {
        case "jazzradio.com":
            modal = document.getElementById('modal-region');

            if (modal && modal.style.display == 'block') {
                modal.querySelector('.close') && modal.querySelector('.close').click();
            }
            break;
    }
};

Provider.prototype.pause = function () {
    var p;
    if (this.status == 'playing') {
        switch(this.host) {
            case "fs.to":
            case "brb.to":
                if (document.getElementById('player_api')) {
                    p = document.getElementById('player_api');
                    p.fp_isPlaying && p.fp_isPlaying() && p.fp_pause && p.fp_pause();
                } else if (document.querySelector('.b-aplayer__html5-desktop')) {
                    p = document.querySelectorAll('.b-aplayer__html5-desktop');
                    if (p.length > 0) {
                        p = Array.prototype.filter.call(p, function(el) {
                            return getComputedStyle(el)['display'] !== 'none';
                        })[0];
                    }
                    p.paused ? null : p.pause();
                }
                break;

            case "baboom.com":
                document.querySelector('#player .main-player-view')
                    && document.querySelector('#player .main-player-view .btn-ctrl-pause').click();
                break;

            case "ex.ua":
                document.querySelector('.vjs-play-control')
                    && document.querySelector('.vjs-play-control.vjs-playing').click();
                break;

            case "vk.com":
                document.querySelector('#gp_play.playing') && document.querySelector('#gp_play.playing').click();
                break;

            case "new.vk.com":
                document.querySelector('.top_audio_player.top_audio_player_playing .top_audio_player_play').click();
                break;

            case "ted.com":
                p = document.getElementById('streamingPlayerSWF');
                p && p.pauseVideo && p.pauseVideo();
                break;

            case "last.fm":
                document.querySelector('#radioControlPause a') && document.querySelector('#radioControlPause a').click()
                break;

            case "rutube.ru":
                p = document.querySelector('#video-object-container iframe') && document.querySelector('#video-object-container iframe').contentDocument.getElementById('rutubePlayerHolder_flash_api');
                p && p.pauseVideo && p.pauseVideo();
                break;

            case "pleer.com":
                document.querySelector('#player #play.pause') && document.querySelector('#player #play.pause').click();
                break;

            case "vimeo.com":
                document.querySelector('.play.state-playing') && document.querySelector('.play.state-playing').click();
                break;

            case "tunein.com":
                document.querySelector('#tuner.playing .playbutton-cont') && document.querySelector('#tuner.playing .playbutton-cont').click();
                break;

            case "megogo.net":
                p = document.getElementById("playerFrame");
                p && p.contentDocument && p.contentDocument.getElementById('player_object') && p.contentDocument.getElementById('player_object').megogoPlayerPause && p.contentDocument.getElementById('player_object').megogoPlayerPause();
                break;

            case "muzebra.com":
                document.querySelector('#player button.play.icon-pause') && document.querySelector('#player button.play.icon-pause').click();
                break;

            case 'facebook.com':
            case "kickstarter.com":
                var videos = document.getElementsByTagName('video');

                for (var i = 0; i < videos.length; i++) {
                    if (videos[i] && !videos[i].paused) {
                        videos[i].pause();
                    }
                }
                break;

            case "youtube.com":
                p = document.getElementById("movie_player") || document.querySelector('.html5-video-player');
                if (p && p.pauseVideo) {
                    p.pauseVideo();
                } else {
                    document.querySelector('.ytp-play-button') && document.querySelector('.ytp-play-button').click();
                }
                break;

            case "seasonvar.ru":
                document.querySelector('#vpcenter object').sendToUppod && document.querySelector('#vpcenter object').sendToUppod('pause');
                break;

            case "play.google.com":
                document.querySelector('[data-id="play-pause"]') && document.querySelector('[data-id="play-pause"]').click();
                break;

            case "music.yandex.ru":
            case "music.yandex.ua":
                document.querySelector('.player-controls__btn_pause') && document.querySelector('.player-controls__btn_pause').click();
                break;
            case "mixcloud.com":
                document.querySelector('.player-control').click();
                break;
            case "soundcloud.com":
                document.querySelector('.playControl.playing') && document.querySelector('.playControl').click();
                break;
            case "jazzradio.com":
                document.querySelector('#ctl-play > .icon-stop') && document.getElementById('ctl-play').click();
                break;
            case "v5player.slipstreamradio.com":
                document.getElementById('pause_button') && document.getElementById('pause_button').click();
                break;
            case "play.spotify.com":
                document.getElementById('play-pause') && document.getElementById('play-pause').click();
                break;
            case "bandcamp.com":
                document.querySelector('.inline_player .playbutton') &&
                    document.querySelector('.inline_player .playbutton').click();
                break;
            case "promodj.com":
                document.querySelector('.playerr_bigplaybutton .playerr_bigpausebutton').click();
                break;
            case "hearthis.at":
                var script   = document.createElement('script');
                script.type  = "text/javascript";
                script.text  = "soundManager.pauseAll();";

                var target = document.getElementsByTagName('script')[0];
                target.parentNode.insertBefore(script, target);
                break;
            case "courses.prometheus.org.ua":
                var button   = document.querySelector('.video-controls .video_control.pause');
                
                if (button) {
                    button.click();
                }
                break;
            case "dailymotion.com":
                StoPlay.injectScript("window.playerV5.paused ? null : window.playerV5.pause();");
                break;
            case "coursera.org":
                var button = document.querySelector('.c-video-control.vjs-control.vjs-playing');
                if (button) {
                    button.click();
                }
                break;
       }
        this.__changeState('paused');
    }
};

Provider.prototype.play = function () {
    var p;
    if (this.status != 'playing') {
        switch(this.host) {
            case "fs.to":
            case "brb.to":
                if (document.getElementById('player_api')) {
                    p = document.getElementById('player_api');
                    p && p.fp_isPaused && p.fp_isPaused() && p.fp_play && p.fp_play();
                } else if (document.querySelector('.b-aplayer__html5-desktop')) {
                    p = document.querySelectorAll('.b-aplayer__html5-desktop');
                    if (p.length > 0) {
                        p = Array.prototype.filter.call(p, function(el) {
                            return getComputedStyle(el)['display'] !== 'none';
                        })[0];
                    }
                    p.paused ? p.play() : null;
                }
                break;

            case "baboom.com":
                document.querySelector('#player .main-player-view')
                    && document.querySelector('#player .main-player-view .btn-ctrl-play').click();
                break;

            case "ex.ua":
                document.querySelector('.vjs-play-control')
                    && document.querySelector('.vjs-play-control.vjs-paused').click();
                break;

            case "vk.com":
                document.querySelector('#gp_play:not(.playing)') && document.querySelector('#gp_play:not(.playing)').click();
                break;

            case "new.vk.com":
                document.querySelector('.top_audio_player .top_audio_player_play').click();
                break;

            case "ted.com":
                p = document.getElementById('streamingPlayerSWF');
                p && p.playVideo && p.playVideo();
                break;

            case "last.fm":
                document.querySelector('#radioControlPlay a') && document.querySelector('#radioControlPlay a').click()
                break;

            case "rutube.ru":
                p = document.querySelector('#video-object-container iframe') && document.querySelector('#video-object-container iframe').contentDocument.getElementById('rutubePlayerHolder_flash_api');
                p && p.playVideo && p.playVideo();
                break;

            case "pleer.com":
                document.querySelector('#player #play.play') && document.querySelector('#player #play.play').click();
                break;

            case "vimeo.com":
                document.querySelector('.play.state-paused') && document.querySelector('.play.state-paused').click();
                break;

            case "tunein.com":
                document.querySelector('#tuner.stopped .playbutton-cont') && document.querySelector('#tuner.stopped .playbutton-cont').click();
                break;

            case "megogo.net":
                p = document.getElementById("playerFrame");
                p && p.contentDocument && p.contentDocument.getElementById('player_object') && p.contentDocument.getElementById('player_object').megogoPlayerResume && p.contentDocument.getElementById('player_object').megogoPlayerResume();
                break;

            case "muzebra.com":
                document.querySelector('#player button.play.icon-play') && document.querySelector('#player button.play.icon-play').click();
                break;

            case 'facebook.com':
            case "kickstarter.com":
                var videos = document.getElementsByTagName('video');

                for (var i = 0; i < videos.length; i++) {
                    if (videos[i] && videos[i].paused && videos[i].played.length > 0) {
                        videos[i].play();
                    }
                }
                break;

            case "youtube.com":
                p = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
                if (p && p.playVideo) {
                    p.playVideo();
                } else {
                    document.querySelector('.ytp-play-button') && document.querySelector('.ytp-play-button').click();
                }
                break;

            case "seasonvar.ru":
                document.querySelector('#vpcenter object').sendToUppod && document.querySelector('#vpcenter object').sendToUppod('play');
                break;

            case "play.google.com":
                document.querySelector('[data-id="play-pause"]') && document.querySelector('[data-id="play-pause"]').click();
                break;

            case "music.yandex.ru":
            case "music.yandex.ua":
                document.querySelector('.player-controls__btn_play') && document.querySelector('.player-controls__btn_play').click();
                break;

            case "mixcloud.com":
                document.querySelector('.player-control').click();
                break;
            case "soundcloud.com":
                document.querySelector('.playControl') && document.querySelector('.playControl').click();
                break;
            case "jazzradio.com":
                document.querySelector('#ctl-play > .icon-play') && document.getElementById('ctl-play').click();
                break;
            case "v5player.slipstreamradio.com":
                document.getElementById('play_button') && document.getElementById('play_button').click();
                break;
            case "play.spotify.com":
                document.getElementById('play-pause') && document.getElementById('play-pause').click();
                break;
            case "bandcamp.com":
                document.querySelector('.inline_player .playbutton') &&
                    document.querySelector('.inline_player .playbutton').click();
                break;
            case "promodj.com":
                document.querySelector('.playerr_bigplaybutton .playerr_bigplaybutton').click();
                break;
            case "hearthis.at":
                var script   = document.createElement('script');
                script.type  = "text/javascript";
                script.text  = "soundManager.resumeAll();";

                var target = document.getElementsByTagName('script')[0];
                target.parentNode.insertBefore(script, target);
                break;
            case "courses.prometheus.org.ua":
                var button   = document.querySelector('.video-controls .video_control.play');
                
                if (button) {
                    button.click();
                }
                break;
            case "dailymotion.com":
                StoPlay.injectScript("window.playerV5.paused ? window.playerV5.play() : null;");
                break;
            case "coursera.org":
                var button = document.querySelector('.c-video-control.vjs-control.vjs-paused');
                if (button) {
                    button.click();
                }
                break;

        }
        this.__changeState('playing');
    }
};

var ProviderInstance = new Provider();

if (ProviderInstance) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action == 'pause') {
            ProviderInstance.pause();
        }

        if (request.action == 'play') {
            ProviderInstance.play();
        }
    });
}
