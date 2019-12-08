import { Service } from './Service.js';
import * as StatusStrategies from './Status.Strategies.js';
import * as ControlStrategies from './Control.Strategies.js';

// #TODO: move it to build-time
function oneSelectorHelper(hosts, statusArgs, playArgs, pauseArgs) {
  return {
    hosts,
    options: {
      statusStrategy: StatusStrategies.checkSelector,
      statusArgs: [ statusArgs ],
      controlStrategy: ControlStrategies.clickSelector,
      playArgs: [ playArgs ],
      pauseArgs: [ pauseArgs ]
    }
  };
}

function getOneSelector() {
  return [
    [
      [ 'vimeo.com', 'player.vimeo.com' ],
      '.play.state-playing',
      '.play.state-paused',
      '.play.state-playing'
    ], [
      [ 'vk.com' ],
      '.top_audio_player.top_audio_player_playing',
      '.top_audio_player_play',
      '.top_audio_player_play'
    ], [
      [ 'muzebra.com' ],
      '.player.jp-state-playing',
      '.player.jp-play',
      '.player.jp-pause'
    ], [
      [ 'music.yandex.ru', 'music.yandex.ua' ],
      '.player-controls__btn_play.player-controls__btn_pause',
      '.player-controls__btn_play',
      '.player-controls__btn_pause'
    ], [
      [ 'mixcloud.com' ],
      '.player-control.pause-state',
      '.player-control',
      '.player-control'
    ], [
      [ 'soundcloud.com' ],
      '.playControl.playing',
      '.playControl',
      '.playControl.playing'
    ], [
      [ 'jazzradio.com', 'rockradio.com', 'radiotunes.com', 'classicalradio.com', 'zenradio.com' ],
      '#play-button .icon-pause',
      '#play-button .ctl',
      '#play-button .ctl'
    ], [
      [ 'v5player.slipstreamradio.com', 'accuradio.com' ],
      '#playerPauseButton',
      '#playerPlayButton',
      '#playerPauseButton'
    ], [
      [ 'open.spotify.com' ],
      ".control-button[class*='pause']",
      ".control-button[class*='play']",
      ".control-button[class*='pause']"
    ], [
      [ 'bandcamp.com' ],
      '.inline_player .playbutton.playing',
      '.inline_player .playbutton',
      '.inline_player .playbutton.playing'
    ], [
      [ 'promodj.com' ],
      '.playerr_bigplaybutton .playerr_bigpausebutton',
      '.playerr_bigplaybutton .playerr_bigplaybutton',
      '.playerr_bigplaybutton .playerr_bigpausebutton'
    ], [
      [ 'courses.prometheus.org.ua' ],
      '.video-controls .video_control.pause',
      '.video-controls .video_control.play',
      '.video-controls .video_control.pause'
    ], [
      [ 'coursera.org' ],
      '.c-video-control.vjs-control.vjs-playing',
      '.c-video-control.vjs-control.vjs-paused',
      '.c-video-control.vjs-control.vjs-playing'
    ], [
      [ 'di.fm' ],
      '#webplayer-region .controls .icon-pause',
      '#webplayer-region .controls .icon-play',
      '#webplayer-region .controls .icon-pause'
    ], [
      [ 'audible.ca', 'audible.com', 'audible.com.au' ],
      '#adbl-cloud-player-controls .adblPauseButton:not(.bc-hidden)',
      '#adbl-cloud-player-controls .adblPauseButton:not(.bc-hidden)',
      '#adbl-cloud-player-controls .adblPauseButton:not(.bc-hidden)'
    ], [
      [ 'coub.com' ],
      '.coub.active[play-state="playing"]',
      '.coub.active .viewer__replay',
      '.coub.active .viewer__click',
    ], [
      [ 'livestream.com' ],
      '.playback-control .play-holder.lsp-hidden',
      '.playback-control .play-holder',
      '.playback-control .pause-holder'
    ], [
      [ 'beatport.com' ],
      '#Player__pause-button',
      '#Player__play-button',
      '#Player__pause-button'
    ], [
      [ 'radio.garden' ],
      '.icon-toggle.mod-mute .icon-button.mod-sound',
      '.icon-toggle.mod-mute .icon-button.mod-muted',
      '.icon-toggle.mod-mute .icon-button.mod-sound'
    ]
  ].map(item => oneSelectorHelper.apply(null, item));

}

export const servicesRegistry = () => {

  return getOneSelector().concat([
    {
      hosts: [ 'radiolist.com.ua' ],
      options: {
        statusStrategy: StatusStrategies.checkSelectorAndStore,
        statusArgs: [ '.jouele-status-playing .jouele-info-control-button-icon_pause' ],
        controlStrategy: ControlStrategies.joueleStoredSelector
      }
    }, {
      hosts: [ 'megogo.net' ],
      options: {
        statusStrategy: StatusStrategies.mediaSelector,
        statusArgs: [ 'video[class*="player:video"]' ],
        controlStrategy: ControlStrategies.mediaToggle,
        playArgs: [ 'video[class*="player:video"]' ],
        pauseArgs: [ 'video[class*="player:video"]' ]
      }
    }, {
      hosts: [ 'dailymotion.com' ],
      options: {
        statusStrategy: StatusStrategies.mediaSelector,
        statusArgs: [ '#dmp_Video' ],
        controlStrategy: ControlStrategies.mediaToggle,
        playArgs: [ '#dmp_Video' ],
        pauseArgs: [ '#dmp_Video' ]
      }
    }, {
      hosts: [ 'netflix.com' ],
      options: {
        statusStrategy: StatusStrategies.mediaSelector,
        statusArgs: [ '.VideoContainer video' ],
        controlStrategy: ControlStrategies.mediaToggle,
        playArgs: [ '.VideoContainer video' ],
        pauseArgs: [ '.VideoContainer video' ]
      }
    }, {
      hosts: [ 'egghead.io' ],
      options: {
        statusStrategy: StatusStrategies.mediaSelector,
        statusArgs: [ '.bitmovinplayer-container video' ],
        controlStrategy: ControlStrategies.mediaToggle,
        playArgs: [ '.bitmovinplayer-container video' ],
        pauseArgs: [ '.bitmovinplayer-container video' ]
      }
    }, {
      hosts: [ 'udemy.com' ],
      options: {
        statusStrategy: StatusStrategies.mediaSelector,
        statusArgs: [ 'video' ],
        controlStrategy: ControlStrategies.mediaToggle,
        playArgs: [ 'video' ],
        pauseArgs: [ 'video' ]
      }
    }, {
      hosts: [ 'musicforprogramming.net' ],
      options: {
        statusStrategy: StatusStrategies.mediaSelector,
        statusArgs: [ '#player' ],
        controlStrategy: ControlStrategies.mediaToggle,
        playArgs: [ '#player' ],
        pauseArgs: [ '#player' ]
      }
    }, {
      hosts: [ 'netflix.com' ],
      options: {
        statusStrategy: StatusStrategies.mediaSelector,
        statusArgs: [ '.VideoContainer video' ],
        controlStrategy: ControlStrategies.mediaToggle,
        playArgs: [ '.VideoContainer video' ],
        pauseArgs: [ '.VideoContainer video' ]
      }
    }, {
      hosts: [ 'hearthis.at' ],
      options: {
        statusStrategy: StatusStrategies.checkSelector,
        statusArgs: [ 'body.play' ],
        controlStrategy: { /* custom */},
      }
    }, {
      hosts: ['ted.com', 'facebook.com', 'kickstarter.com', 'music.youtube.com' ],
      options: {
        statusStrategy: StatusStrategies.oneOfTheVideosPlaying,
        controlStrategy: ControlStrategies.oneOfTheVideos,
      }
    },
  ])
};

export function getService(domain) {
  const matchedService = servicesRegistry().find(serviceConfig => serviceConfig.hosts.includes(domain));

  if (!matchedService) {
    return;
  }

  return new Service(matchedService.options);
}
