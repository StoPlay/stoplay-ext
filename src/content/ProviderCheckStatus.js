/* Checking status for all providers */
import { Status } from './Status.Types.js';

import { GetProvider } from './Providers.js';

export class ProviderCheckStatus {
  constructor() {
    this.host = null;
    this.provider = null;
    this.customLastPlayerSelector = null;

    this.setHost = this.setHost.bind(this);
    this.check = this.check.bind(this);
  }

  setHost(host) {
    this.host = host;
    this.provider = GetProvider(host);
  }

  check() {
    let status, p, selector, selectorQuery;

    switch(this.host) {
      case "radiolist.com.ua":
        p = document.querySelector('.jouele-status-playing .jouele-info-control-button-icon_pause');
        if (p) {
          status = Status.PLAYING;
          this.customLastPlayerSelector = p;
        } else {
          status = Status.PAUSED;
        }
      break;

      case "vk.com":
        const player_obj = document.querySelector('.top_audio_player');
        if (player_obj) {
          status = player_obj && player_obj.classList.contains('top_audio_player_playing') ? Status.PLAYING : Status.PAUSED;
        }
      break;

      case "new.vk.com":
        status = document.querySelector('.top_audio_player')
        && document.querySelector('.top_audio_player').classList.contains('top_audio_player_playing') ? Status.PLAYING : Status.PAUSED;
      break;

      case "last.fm":
        status = document.getElementById('webRadio').classList.contains('playing') ? Status.PLAYING : Status.PAUSED;
      break;

      case "rutube.ru":
        p = document.querySelector('#video-object-container iframe') && document.querySelector('#video-object-container iframe').contentDocument.getElementById('rutubePlayerHolder_flash_api');
        if (p) {
          status = p.getPlayerState && p.getPlayerState();
        }
      break;

      case "pleer.net":
        status = document.querySelector('#player #play').classList.contains('pause') ? Status.PLAYING : Status.PAUSED;
      break;

      case "vimeo.com":
      case "player.vimeo.com":
        status = document.querySelector('.play.state-playing') ? Status.PLAYING : Status.PAUSED;
      break;

      case "armyfm.com.ua":
      case "tunein.com":
        const audios = document.getElementsByTagName("audio");

        if (audios.length > 0) {
          const hasPlayingAudio = Array.from(audios).some((player) => !player.paused);
          status = hasPlayingAudio ? Status.PLAYING : Status.PAUSED;
        } else {
          if (document.getElementById('tuner') && document.getElementById('tuner').classList.contains('playing')) {
            status = Status.PLAYING;
          } else {
            status = Status.PAUSED;
          }
        }
      break;

      case "megogo.net":
        p = document.querySelector("video[class*='player:video']");
        status = Status.PAUSED;

        if (p && p.paused === false) {
          status = Status.PLAYING;
        }
      break;

      case "muzebra.com":
        status = document.querySelector('#player button.play').classList.contains('icon-pause') ? Status.PLAYING : Status.PAUSED;
      break;

      case "ted.com":
        // this could replace the switch
        status = this.provider.checkStatus();
      break;

      case "facebook.com":
      case "kickstarter.com":
      case "music.youtube.com":
        const videos = document.getElementsByTagName("video");
        if (videos.length > 0) {
          const hasPlayingVideo = Array.from(videos).some((player) => !player.paused);

          status = hasPlayingVideo ? Status.PLAYING : Status.PAUSED;
        }
      break;

      case "gaming.youtube.com":
      case "youtube.com":
        p = document.getElementById("movie_player") || document.querySelector('.html5-video-player');
        if (p && p.getPlayerState) {
          status = p.getPlayerState() == 1 ? Status.PLAYING : Status.PAUSED;
        } else if (document.querySelector('.html5-main-video')) {
          const video = document.querySelector('.html5-main-video');
          status = (video.paused || (!video.paused && video.currentTime == 0)) ? Status.PAUSED : Status.PLAYING;
        } else if (document.getElementById("movie_player")) {
          status = document.getElementById("movie_player") && document.getElementById("movie_player").classList.contains('playing-mode') ? Status.PLAYING : Status.PAUSED;
        }
      break;

      case "seasonvar.ru":
        status = document.querySelector('#vpcenter object').getUppod && document.querySelector('#vpcenter object').getUppod('getstatus');
        status = status == 1 ? Status.PLAYING : Status.PAUSED;
      break;

      case "play.google.com":
        p = document.querySelector('[data-id="play-pause"]');
        const p2 = document.querySelector(".lava-player video");
        const p3 = document.querySelector(".playback-button.playing");

        if (p) {
          status = p.classList.contains('playing') ? Status.PLAYING : Status.PAUSED;
        } else if (p2) {
          status = Status.PAUSED;

          if (p2.paused === false) {
            status = Status.PLAYING;
          }
        } else if (p3) {
          status = Status.PLAYING;
        }
      break;

      case "music.yandex.ru":
      case "music.yandex.ua":
        status = document.querySelector('.player-controls__btn_play').classList.contains('player-controls__btn_pause') ? Status.PLAYING : Status.PAUSED;
      break;

      case "mixcloud.com":
        status = document.querySelector('.player-control') &&
        document.querySelector('.player-control')
        .classList.contains('pause-state') ? Status.PLAYING : Status.PAUSED;
      break;

      case "soundcloud.com":
        status = document.querySelector('.playControl').classList.contains('playing') ? Status.PLAYING : Status.PAUSED;
      break;

      case "jazzradio.com":
      case "rockradio.com":
      case "radiotunes.com":
      case "classicalradio.com":
      case "zenradio.com":
        status = document.querySelector('#play-button .icon-pause') ? Status.PLAYING : Status.PAUSED;
      break;

      case "v5player.slipstreamradio.com":
        status = document.getElementById('statusLabel') &&
        document.getElementById('statusLabel')
        .textContent.toLocaleLowerCase() == 'playing' ? Status.PLAYING : Status.PAUSED;
      break;

      case "play.spotify.com": // old UI, may be available somewhere
        status = document.getElementById('play-pause') &&
        document.getElementById('play-pause').classList.contains('playing') ? Status.PLAYING : Status.PAUSED;
      break;

      case "open.spotify.com": // new UI
        p = document.querySelector(".control-button[class*='pause']");
        status = Status.PAUSED;

        if (p) {
          status = Status.PLAYING;
        }
      break;

      case "bandcamp.com":
        status = document.querySelector('.inline_player .playbutton') &&
        document.querySelector('.inline_player .playbutton').classList.contains('playing') ? Status.PLAYING : Status.PAUSED;
      break;

      case "promodj.com":
        status = document.querySelector('.playerr_bigplaybutton .playerr_bigpausebutton') ? Status.PLAYING : Status.PAUSED;
      break;

      case "hearthis.at":
        status = document.body.classList && document.body.classList.contains('play') ? Status.PLAYING : Status.PAUSED;
      break;

      case "courses.prometheus.org.ua":
        status = document.querySelector('.video-controls .video_control').classList.contains('pause') ? Status.PLAYING : Status.PAUSED;
      break;

      case "dailymotion.com":
        p = document.getElementById("dmp_Video");
        status = Status.PAUSED;

        // check for muted as when you close the video it starts playing in header muted
        if (p
        && p.muted === false
        && p.paused === false
        ) {
          status = Status.PLAYING;
        }
      break;

      case "netflix.com":
        p = document.querySelector(".VideoContainer video");
        status = Status.PAUSED;

        if (p && p.paused === false) {
          status = Status.PLAYING;
        }
      break;

      case "deezer.com":
        const localStorageState = window.localStorage.getItem('stoplaystate');
        status = localStorageState ? localStorageState : null;
      break;

      case "coursera.org":
        p = document.querySelector('.c-video-control.vjs-control');
        status = p && p.classList.contains('vjs-playing') ? Status.PLAYING : Status.PAUSED;
      break;

      case "egghead.io":
        p = document.querySelector('.bitmovinplayer-container video');
        status = Status.PAUSED;
        if (p && p.paused === false) {
          status = Status.PLAYING;
        }
      break;

      case "di.fm":
        p = document.querySelector('#webplayer-region .controls .icon-pause');
        status = Status.PAUSED;
        if (p) {
          status = Status.PLAYING;
        }
      break;

      case "audible.ca":
      case "audible.com":
      case "audible.com.au":
        p = document.querySelector('#adbl-cloud-player-controls .adblPauseButton');

        status = p && !p.classList.contains('bc-hidden') ? Status.PLAYING : Status.PAUSED;
      break;

      case "play.mubert.com":
        p = document.querySelector('#genres .playing');

        status = p ? Status.PLAYING : Status.PAUSED;
        if (p) {
          this.customLastPlayerSelector = p;
        }
      break;

      case "udemy.com":
        p = document.querySelector("video-viewer video");

        status = Status.PAUSED;
        if (p && p.paused === false) {
          status = Status.PLAYING;
        }
      break;

      case "coub.com":
        p = document.querySelector('.coub.active');

        if (p) {
          status = p.getAttribute('play-state');
        } else {
          status = Status.PAUSED;
        }
      break;

      case "livestream.com":
        p = document.querySelector('.playback-control .play-holder');

        status = p && p.classList.contains('lsp-hidden') ? Status.PLAYING : Status.PAUSED;
      break;

      case "musicforprogramming.net":
        const player = document.getElementById('player');
        status = player && !player.paused ? Status.PLAYING : Status.PAUSED;
      break;

      case "beatport.com":
        p = document.getElementById('Player__pause-button');
        status = p ? Status.PLAYING : Status.PAUSED;
      break;

      case "radio.garden":
        selectorQuery = ".icon-toggle.mod-mute .icon-button.mod-sound";
        p = document.querySelector(selectorQuery);

        status = p ? Status.PLAYING : Status.PAUSED;
      break;

      case "somafm.com":
        selectorQuery = ".player .controls button .fa-stop";
        p = document.querySelector(selectorQuery);

        status = p ? Status.PLAYING : Status.PAUSED;
      break;
    }
    return status;
  }
}
