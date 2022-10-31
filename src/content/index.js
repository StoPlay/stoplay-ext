/* StoPlay Content JS */
import { CheckTimer } from "./CheckTimer.js";
import { Actions } from "../common/Actions.js";
import { NativeMediaPlayer } from "../common/NativeMediaPlayer";

function safeGetElementTextContentByQuery(query) {
  try {
    const element = document.querySelector(query);

    return element.textContent;
  } catch (e) {
    return "";
  }
}

const StoPlay = {
  injectScript: function (scriptText) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = scriptText;

    const target = document.getElementsByTagName("script")[0];
    target.parentNode.insertBefore(script, target);
    return script;
  },
};

let button = null;

const Status = {
  PAUSED: "paused",
  PLAYING: "playing",
};

const CHECK_TIMEOUT = 1000;
const TITLE_TIMEOUT = 10000;

class Provider {
  constructor() {
    this.allowed = [];
    this.enabled = true;
    this.LOG = "STOPLAY";
    this.status = Status.PAUSED;
    this.playingTitle = "";
    this.timer = null;
    this.checkTitleInterval = null;
    this.events = {};

    this.isInstalled();
    this.customLastPlayerSelector = null;
    this.customLastPauseSelector = null;

    chrome.storage.sync.get(
      {
        enabled: true,
        providers: [],
      },
      (options) => this._parseOptions(options)
    );

    this.timer = new CheckTimer({
      delay: CHECK_TIMEOUT,
      callback: this.checkStatus.bind(this),
      recursive: true,
    });
    this.checkTitleInterval = new CheckTimer({
      delay: TITLE_TIMEOUT,
      callback: this.checkTitle.bind(this),
      recursive: true,
    });

    chrome.storage.onChanged.addListener((changes) =>
      this._parseChanges(changes)
    );
  }

  /**
   * Parse options
   */
  _parseOptions(options) {
    this.enabled = options.enabled;
    this._parseAllowedProviders(options.providers);
    if (this.enabled) {
      this._detectProviderAndStartCheckInterval();
    }
  }

  /**
   * Parse changes
   */
  _parseChanges(changes) {
    if (typeof changes.providers !== "undefined") {
      this._parseAllowedProviders(changes.providers.newValue);
    }
    if (typeof changes.enabled !== "undefined") {
      if (changes.enabled.newValue !== this.enabled) {
        this.enabled = changes.enabled.newValue;
      }
    }

    if (!this.enabled) {
      this._stopCheckInterval();
    } else {
      this._restartCheckInterval();
    }
  }

  _parseAllowedProviders(providers) {
    if (!providers.length) {
      return;
    }

    this.allowed = providers
      .filter(function (provider) {
        // check if any of the providers is disabled
        return provider.enabled === true;
      })
      .map(function (provider) {
        return provider.uri;
      });
  }

  _detectProviderAndStartCheckInterval() {
    if (this.detectProvider()) {
      this.timer.start();
      this.checkTitleInterval.start();

      this.init();
    }
  }

  _stopCheckInterval() {
    this.timer.stop();
    this.checkTitleInterval.stop();
  }

  _restartCheckInterval() {
    this._stopCheckInterval();
    this._detectProviderAndStartCheckInterval();
  }

  isInstalled() {
    if (
      window.location.host.replace("www.", "") == "stoplay_page.dev" ||
      window.location.host.replace("www.", "") == "stoplay.github.io"
    ) {
      document.querySelector("body").className =
        document.querySelector("body").className + " m_installed";
    }
  }

  on(name, callback) {
    if (typeof this.events[name] === "undefined") this.events[name] = [];

    this.events[name].push(callback);

    return this;
  }

  trigger(name) {
    if (typeof this.events[name] === "undefined") return;

    let l = this.events[name].length;
    let i = 0;

    while (i < l) {
      this.events[name][i].call();
      i++;
    }
  }

  detectProvider() {
    this.host = window.location.host.replace("www.", "");

    let clearSubDomains = "";
    if (this.host.split("bandcamp.com").length > 1) {
      clearSubDomains = "bandcamp.com";
    }
    if (clearSubDomains) this.host = clearSubDomains;

    return this.allowed.indexOf(this.host) >= 0;
  }

  attachEvents() {
    this.on("start", () => {
      this.status = Status.PLAYING;
      chrome.runtime.sendMessage({ action: "started", title: this.getTitle() });
    })
      .on("pause", () => {
        this.status = Status.PAUSED;
        chrome.runtime.sendMessage({ action: Status.PAUSED });
      })
      .on("updateTitle", () => {
        chrome.runtime.sendMessage({
          action: "updateTitle",
          title: this.playingTitle,
        });
      });
  }

  __changeState(status) {
    if (status !== this.status || status === Status.PLAYING) {
      switch (status) {
        case Status.PLAYING:
          this.trigger("start");
          break;

        case Status.PAUSED:
          this.trigger("pause");
          break;
      }
    }
  }

  getTitle() {
    let songName;
    let artistName;

    switch (this.host) {
      case "music.youtube.com":
        songName = safeGetElementTextContentByQuery(
          ".ytmusic-player-bar.title"
        );
        artistName = safeGetElementTextContentByQuery(
          ".ytmusic-player-bar.byline a:first-child"
        );
        break;

      case "play.google.com":
        songName = safeGetElementTextContentByQuery("#currently-playing-title");
        artistName = safeGetElementTextContentByQuery("#player-artist");
        break;

      case "musicforprogramming.net":
        songName = safeGetElementTextContentByQuery(".pad a");
        artistName = "Music for Programming";
        break;

      case "beatport.com":
        songName = safeGetElementTextContentByQuery(
          ".player2 .track-title__primary"
        );
        artistName = safeGetElementTextContentByQuery(
          ".player2 .track-artists"
        );
        break;

      case "radio.garden":
        artistName = safeGetElementTextContentByQuery(
          ".channel-list-item-name-container"
        );
        break;
    }

    if (artistName && songName) {
      return `${artistName} - ${songName}`;
    }

    if (artistName && !songName) {
      return artistName;
    }

    return "";
  }

  checkTitle() {
    const currentTitle = this.getTitle();

    if (currentTitle !== this.playingTitle) {
      this.playingTitle = currentTitle;
      this.trigger("updateTitle");
    }
  }

  init() {
    this.attachEvents();
    switch (this.host) {
      case "deezer.com":
        StoPlay.injectScript(`
                    function stoplayGetStatus() {
                        return window.dzPlayer.playing ? Status.PLAYING : Status.PAUSED;
                    }

                    let stoplayLastStatus = stoplayGetStatus();

                    setInterval(function () {
                        let currentStatus = stoplayGetStatus();

                        if (stoplayLastStatus !== currentStatus) {
                            stoplayLastStatus = currentStatus;
                            window.localStorage.setItem('stoplaystate', currentStatus);
                        }
                    }, 400);
                `);
        break;
    }
  }

  checkStatus() {
    let status, p, selector, selectorQuery, playerPauseButton;

    switch (this.host) {
      case "anchor.fm":
      case "armyfm.com.ua":
      case "bandcamp.com":
      case "podcasts.google.com":
      case "tunein.com":
      case "mixcloud.com":
      case "podcasts.google.com":
      case "tunein.com":
      case "fex.net":
      case "qub.ca":
        status = new NativeMediaPlayer("audio").status();
        break;

      case "adultswim.com":
      case "ted.com":
      case "megogo.net":
      case "ted.com":
      case "facebook.com":
      case "kickstarter.com":
      case "music.youtube.com":
      case "app.pluralsight.com":
      case "netflix.com":
      case "udemy.com":
      case "vimeo.com":
      case "gaming.youtube.com":
      case "youtube.com":
      case "takflix.com":
        status = new NativeMediaPlayer("video").status();
        break;

      case "last.fm":
        status = document
          .getElementById("webRadio")
          .classList.contains("playing")
          ? Status.PLAYING
          : Status.PAUSED;
        break;

      case "soundcloud.com":
        status = document
          .querySelector(".playControl")
          .classList.contains("playing")
          ? Status.PLAYING
          : Status.PAUSED;
        break;
      case "jazzradio.com":
      case "rockradio.com":
      case "radiotunes.com":
      case "classicalradio.com":
      case "zenradio.com":
        status = document.querySelector('#play-button [data-state="playing"]')
          ? Status.PLAYING
          : Status.PAUSED;
        break;
      case "v5player.slipstreamradio.com":
        status =
          document.getElementById("statusLabel") &&
          document
            .getElementById("statusLabel")
            .textContent.toLocaleLowerCase() == "playing"
            ? Status.PLAYING
            : Status.PAUSED;
        break;

      case "play.spotify.com": // old UI, may be available somewhere
        status =
          document.getElementById("play-pause") &&
          document.getElementById("play-pause").classList.contains("playing")
            ? Status.PLAYING
            : Status.PAUSED;
        break;
      case "open.spotify.com": // new UI // outdated as of Oct 2022
        p = document.querySelector("[data-testid='control-button-playpause'] path[d*='1a.7.7']");
        status = Status.PAUSED;

        if (p) {
          status = Status.PLAYING;
        }
        break;

      case "promodj.com":
        status = document.querySelector(
          ".playerr_bigplaybutton .playerr_bigpausebutton"
        )
          ? Status.PLAYING
          : Status.PAUSED;
        break;
      case "hearthis.at":
        status =
          document.body.classList && document.body.classList.contains("play")
            ? Status.PLAYING
            : Status.PAUSED;
        break;
      case "courses.prometheus.org.ua":
        status = document
          .querySelector(".video-controls .video_control")
          .classList.contains("pause")
          ? Status.PLAYING
          : Status.PAUSED;
        break;
      case "edx.org":
      case "courses.edx.org":
      case "learning.edx.org":
        status = document.querySelector(".video.is-playing")
          ? Status.PLAYING
          : Status.PAUSED;
        break;
      case "dailymotion.com":
        p = document.getElementById("dmp_Video");
        status = Status.PAUSED;

        if (
          p &&
          // check for muted as when you close the video it starts playing in header muted
          p.muted === false &&
          p.paused === false
        ) {
          status = Status.PLAYING;
        }
        break;

      case "deezer.com":
        const localStorageState = window.localStorage.getItem("stoplaystate");
        status = localStorageState ? localStorageState : null;
        break;
      case "coursera.org":
        selector = document.querySelector(".c-video-control.vjs-control");
        status =
          selector && selector.classList.contains("vjs-playing")
            ? Status.PLAYING
            : Status.PAUSED;
        break;
      case "egghead.io":
        p = document.querySelector(".bitmovinplayer-container video");
        status = Status.PAUSED;
        if (p && p.paused === false) {
          status = Status.PLAYING;
        }

      case "di.fm":
        button = document.querySelector(
          "#webplayer-region .controls .icon-pause"
        );
        status = Status.PAUSED;
        if (button) {
          status = Status.PLAYING;
        }
        break;

      case "audible.ca":
      case "audible.com":
      case "audible.com.au":
        selector = document.querySelector(
          "#adbl-cloud-player-controls .adblPauseButton"
        );

        status =
          selector && !selector.classList.contains("bc-hidden")
            ? Status.PLAYING
            : Status.PAUSED;
        break;

      case "livestream.com":
        selector = document.querySelector(".playback-control .play-holder");

        status =
          selector && selector.classList.contains("lsp-hidden")
            ? Status.PLAYING
            : Status.PAUSED;
        break;

      case "musicforprogramming.net":
        const player = document.getElementById("player");
        status = player && !player.paused ? Status.PLAYING : Status.PAUSED;
        break;

      case "beatport.com":
        playerPauseButton = document.getElementById("Player__pause-button");
        status = playerPauseButton ? Status.PLAYING : Status.PAUSED;
        break;

      case "radio.garden":
        selectorQuery = ".icon-toggle.mod-mute .icon-button.mod-sound";
        playerPauseButton = document.querySelector(selectorQuery);

        status = playerPauseButton ? Status.PLAYING : Status.PAUSED;
        break;

      case "somafm.com":
        selectorQuery = ".player .controls button .fa-stop";
        playerPauseButton = document.querySelector(selectorQuery);

        status = playerPauseButton ? Status.PLAYING : Status.PAUSED;
        break;

      case "podcasts.apple.com":
        selectorQuery =
          ".we-audio-controls__playback .we-audio-controls__button--playback.icon-pause";
        playerPauseButton = document.querySelector(selectorQuery);

        status = playerPauseButton ? Status.PLAYING : Status.PAUSED;
        break;
    }

    status && this.__changeState(status);
  }

  pause() {
    let p, selector, selectorQuery, playerPauseButton;

    if (this.status === Status.PLAYING) {
      switch (this.host) {
        case "anchor.fm":
        case "armyfm.com.ua":
        case "bandcamp.com":
        case "podcasts.google.com":
        case "tunein.com":
        case "mixcloud.com":
        case "podcasts.google.com":
        case "tunein.com":
        case "fex.net":
        case "qub.ca":
          new NativeMediaPlayer("audio").pause();
          break;

        case "adultswim.com":
        case "ted.com":
        case "megogo.net":
        case "ted.com":
        case "facebook.com":
        case "kickstarter.com":
        case "music.youtube.com":
        case "app.pluralsight.com":
        case "netflix.com":
        case "udemy.com":
        case "vimeo.com":
        case "takflix.com":
        case "gaming.youtube.com":
        case "youtube.com":
          new NativeMediaPlayer("video").pause();
          break;

        case "last.fm":
          document.querySelector("#radioControlPause a") &&
            document.querySelector("#radioControlPause a").click();
          break;

        case "app.pluralsight.com":
          document.querySelector('[data-text="Pause (k)"] button') &&
            document.querySelector('[data-text="Pause (k)"] button').click();
          break;

        case "soundcloud.com":
          document.querySelector(".playControl.playing") &&
            document.querySelector(".playControl").click();
          break;
        case "jazzradio.com":
        case "rockradio.com":
        case "radiotunes.com":
        case "classicalradio.com":
        case "zenradio.com":
          p = document.querySelector("#play-button .play-button-component");
          p && p.click();
          break;
        case "v5player.slipstreamradio.com":
          document.getElementById("pause_button") &&
            document.getElementById("pause_button").click();
          break;
        case "play.spotify.com": // old UI
          document.getElementById("play-pause") &&
            document.getElementById("play-pause").click();
          break;
        case "open.spotify.com": // new UI // outdatd
          p = document.querySelector("[data-testid='control-button-playpause']");

          if (p) {
            p.click();
          }
          break;

        case "promodj.com":
          document
            .querySelector(".playerr_bigplaybutton .playerr_bigpausebutton")
            .click();
          break;
        case "hearthis.at":
          const script = document.createElement("script");
          script.type = "text/javascript";
          script.text = "soundManager.pauseAll();";

          const target = document.getElementsByTagName("script")[0];
          target.parentNode.insertBefore(script, target);
          break;
        case "courses.prometheus.org.ua":
          button = document.querySelector(
            ".video-controls .video_control.pause"
          );
          if (button) {
            button.click();
          }
          break;

        case "edx.org":
        case "courses.edx.org":
        case "learning.edx.org":
          button = document.querySelector(".video.is-playing .control.pause");

          if (button) {
            button.click();
          }
          break;

        case "dailymotion.com":
          p = document.getElementById("dmp_Video");

          p && !p.paused && p.pause();
          break;

        case "deezer.com":
          StoPlay.injectScript(
            "dzPlayer.playing ? dzPlayer.control.pause() : void(0);"
          );
          break;
        case "coursera.org":
          button = document.querySelector(
            ".c-video-control.vjs-control.vjs-playing"
          );
          if (button) {
            button.click();
          }
          break;
        case "egghead.io":
          button = document.querySelector(
            ".bmpui-ui-playbacktoggle-overlay button"
          );
          if (button) {
            button.click();
          }
          break;

        case "di.fm":
          button = document.querySelector(
            "#webplayer-region .controls .icon-pause"
          );
          if (button) {
            button.click();
          }
          break;

        case "audible.ca":
        case "audible.com":
        case "audible.com.au":
          selector = document.querySelector(
            "#adbl-cloud-player-controls .adblPauseButton"
          );

          if (selector && !selector.classList.contains("bc-hidden")) {
            selector.click();
          }
          break;

        case "livestream.com":
          selector = document.querySelector(".playback-control .play-holder");

          if (selector && selector.classList.contains("lsp-hidden")) {
            document.querySelector(".playback-control .pause-holder").click();
          }
          break;

        case "musicforprogramming.net":
          document.getElementById("player_playpause").click();
          break;

        case "beatport.com":
          playerPauseButton = document.getElementById("Player__pause-button");

          if (!playerPauseButton) {
            return;
          }

          playerPauseButton.click();
          break;

        case "radio.garden":
          selectorQuery = ".icon-toggle.mod-mute .icon-button.mod-sound";
          playerPauseButton = document.querySelector(selectorQuery);

          if (!playerPauseButton) {
            return;
          }

          playerPauseButton.click();
          break;

        case "somafm.com":
          selectorQuery = ".player .controls button .fa-stop";
          playerPauseButton = document.querySelector(selectorQuery);

          if (!playerPauseButton) {
            return;
          }

          playerPauseButton.parentElement.click();
          break;

        case "podcasts.apple.com":
          selectorQuery =
            ".we-audio-controls__playback .we-audio-controls__button--playback.icon-pause";
          playerPauseButton = document.querySelector(selectorQuery);

          if (!playerPauseButton) {
            return;
          }

          playerPauseButton.click();
          break;
      }
      this.__changeState(Status.PAUSED);
    }
  }

  play() {
    let p, selector, selectorQuery, playerPlayButton;

    if (this.status !== Status.PLAYING) {
      switch (this.host) {
        case "podcasts.google.com":
        case "tunein.com":
        case "anchor.fm":
        case "armyfm.com.ua":
        case "bandcamp.com":
        case "podcasts.google.com":
        case "tunein.com":
        case "mixcloud.com":
        case "fex.net":
        case "qub.ca":
          new NativeMediaPlayer("audio").play();
          break;

        case "adultswim.com":
        case "ted.com":
        case "megogo.net":
        case "ted.com":
        case "facebook.com":
        case "kickstarter.com":
        case "music.youtube.com":
        case "app.pluralsight.com":
        case "netflix.com":
        case "udemy.com":
        case "vimeo.com":
        case "takflix.com":
        case "gaming.youtube.com":
        case "youtube.com":
          new NativeMediaPlayer("video").play();
          break;

        case "last.fm":
          document.querySelector("#radioControlPlay a") &&
            document.querySelector("#radioControlPlay a").click();
          break;

        case "app.pluralsight.com":
          document.querySelector('[data-text="Play (k)"] button') &&
            document.querySelector('[data-text="Play (k)"] button').click();
          break;

        case "soundcloud.com":
          document.querySelector(".playControl") &&
            document.querySelector(".playControl").click();
          break;
        case "jazzradio.com":
        case "rockradio.com":
        case "radiotunes.com":
        case "classicalradio.com":
        case "zenradio.com":
          p = document.querySelector("#play-button .play-button-component");
          p && p.click();
          break;
        case "v5player.slipstreamradio.com":
          document.getElementById("play_button") &&
            document.getElementById("play_button").click();
          break;
        case "play.spotify.com": // old UI
          document.getElementById("play-pause") &&
            document.getElementById("play-pause").click();
          break;
        case "open.spotify.com": // new UI
          p = document.querySelector("[data-testid='control-button-playpause']");

          if (p) {
            p.click();
          }
          break;
        case "promodj.com":
          document
            .querySelector(".playerr_bigplaybutton .playerr_bigplaybutton")
            .click();
          break;
        case "hearthis.at":
          const script = document.createElement("script");
          script.type = "text/javascript";
          script.text = "soundManager.resumeAll();";

          const target = document.getElementsByTagName("script")[0];
          target.parentNode.insertBefore(script, target);
          break;
        case "courses.prometheus.org.ua":
          button = document.querySelector(
            ".video-controls .video_control.play"
          );
          if (button) {
            button.click();
          }
          break;

        case "edx.org":
        case "courses.edx.org":
        case "learning.edx.org":
          button = document.querySelector(".video.is-paused .control.play");

          if (button) {
            button.click();
          }
          break;

        case "dailymotion.com":
          p = document.getElementById("dmp_Video");

          p && p.paused && p.play();
          break;
        case "deezer.com":
          StoPlay.injectScript(
            "dzPlayer.paused ? dzPlayer.control.play() : void(0);"
          );
          break;
        case "coursera.org":
          button = document.querySelector(
            ".c-video-control.vjs-control.vjs-paused"
          );
          if (button) {
            button.click();
          }
          break;
        case "egghead.io":
          button = document.querySelector(
            ".bmpui-ui-playbacktoggle-overlay button"
          );
          if (button) {
            button.click();
          }
          break;

        case "di.fm":
          button = document.querySelector(
            "#webplayer-region .controls .icon-play"
          );
          if (button) {
            button.click();
          }
          break;

        case "audible.ca":
        case "audible.com":
        case "audible.com.au":
          selector = document.querySelector(
            "#adbl-cloud-player-controls .adblPlayButton"
          );

          if (selector && !selector.classList.contains("bc-hidden")) {
            selector.click();
          }
          break;

        case "livestream.com":
          selector = document.querySelector(".playback-control .play-holder");

          if (selector && !selector.classList.contains("lsp-hidden")) {
            document.querySelector(".playback-control .play-holder").click();
          }
          break;

        case "musicforprogramming.net":
          document.getElementById("player_playpause").click();
          break;

        case "beatport.com":
          playerPlayButton = document.getElementById("Player__play-button");

          if (!playerPlayButton) {
            return;
          }

          playerPlayButton.click();
          break;

        case "radio.garden":
          selectorQuery = ".icon-toggle.mod-mute .icon-button.mod-muted";
          playerPlayButton = document.querySelector(selectorQuery);

          if (!playerPlayButton) {
            return;
          }

          playerPlayButton.click();
          break;

        case "somafm.com":
          selectorQuery = ".player .controls button .fa-play";
          playerPlayButton = document.querySelector(selectorQuery);

          if (!playerPlayButton) {
            return;
          }

          playerPlayButton.parentElement.click();
          break;

        case "podcasts.apple.com":
          selectorQuery =
            ".we-audio-controls__playback .we-audio-controls__button--playback.icon-play";
          playerPlayButton = document.querySelector(selectorQuery);

          if (!playerPlayButton) {
            return;
          }

          playerPlayButton.click();
          break;
      }
      this.__changeState(Status.PLAYING);
    }
  }
}

const ProviderInstance = new Provider();

if (ProviderInstance) {
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action === Actions.PAUSE) {
      ProviderInstance.pause();
    }

    if (request.action === Actions.PLAY) {
      ProviderInstance.play();
    }
  });
}
