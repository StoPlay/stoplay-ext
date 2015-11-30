/* StoPlay Content JS */

var Provider = function () {
    var _this = this;

    this.allowed = [];

    this.status = 'paused';
    this.interval = null;
    this.events = {};

    this.isIntalled();

    // check if not disabled globally or this very service
    chrome.storage.sync.get({
        enabled: true,
        providers: []
    }, function(items) {
        var host = _this.host;
        var allowed = [];
        if (items.enabled !== true) {
            _this.allowed = [];
        }

        if (!items.providers.length) return;

        // check if any of the providers is disabled
        for (var i = 0; i < items.providers.length; i++) {
            if (items.providers[i]['enabled'] === true ) {
                allowed.push(items.providers[i]['uri']);
            }

            if (i == items.providers.length - 1) {
                _this.allowed = allowed;

                if (_this.detectProvider()) {
                    _this.attachEvents();
                    _this.interval = setInterval(function () {
                        _this.checkStatus();
                        _this.checkAnnoyingLightboxes();
                    }, 1500);
                } else {
                    return false;
                }

            }

        }
    });

};

Provider.prototype.isIntalled = function () {
    if (window.location.host.replace('www.', '') == 'stoplay_page.dev'
        || window.location.host.replace('www.', '') == 'stoplay.github.io') {
        document.querySelector("body").className = document.querySelector("body").className + " m_installed";
    }
};

Provider.prototype.on = function (name, callback) {
    if (typeof this.events[name] === 'undefined') this.events[name] = [];

    this.events[name].push(callback);
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

    this.on('start', function () {
        _this.status = 'playing';
        chrome.runtime.sendMessage({action: 'started'});
    });

    this.on('pause', function () {
        _this.status = 'paused';
        chrome.runtime.sendMessage({action: 'paused'});
    })
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
                p = document.querySelector('.b-aplayer__html5-desktop');
                if (p.play) {
                    status = p.paused ? 'paused' : 'playing';
                }
            }
            break;

        case "ex.ua":
            status = document.querySelector('.vjs-play-control')
                && document.querySelector('.vjs-play-control').classList.contains('vjs-playing') ? 'playing' : 'paused';
            break;

        case "vk.com":
            status = document.getElementById('head_play_btn')
                && document.getElementById('head_play_btn').classList.contains('playing') ? 'playing' : 'paused';
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
                    p = document.querySelector('.b-aplayer__html5-desktop');
                    p.paused ? null : p.pause();
                }
                break;

            case "ex.ua":
                document.querySelector('.vjs-play-control')
                    && document.querySelector('.vjs-play-control.vjs-playing').click();
                break;

            case "vk.com":
                document.querySelector('#gp_play.playing') && document.querySelector('#gp_play.playing').click();
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
                    p = document.querySelector('.b-aplayer__html5-desktop');
                    p.paused ? p.play() : null;
                }
                break;

            case "ex.ua":
                document.querySelector('.vjs-play-control')
                    && document.querySelector('.vjs-play-control.vjs-paused').click();
                break;

            case "vk.com":
                document.querySelector('#gp_play:not(.playing)') && document.querySelector('#gp_play:not(.playing)').click();
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