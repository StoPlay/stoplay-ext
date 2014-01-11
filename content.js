/* StoPlay Content JS */

var Provider = function() {
	var _this = this;

	this.allowed = ['vk.com', 'grooveshark.com', 'youtube.com', 'vimeo.com', 'muzebra.com', 'pleer.com', 'last.fm', 'fs.to', 'brb.to'];
	this.status = 'paused';
	this.interval = null;
	this.events = {};

	if(this.detectProvider()) {
		this.attachEvents();
		this.interval = setInterval(function(){
			_this.checkStatus();
		}, 1500);
	} else {
		return false;
	}
};

Provider.prototype.on = function(name, callback){
	if(typeof this.events[name] === 'undefined') this.events[name] = [];

	this.events[name].push(callback);
};

Provider.prototype.trigger = function(name){
	if(typeof this.events[name] === 'undefined') return;

	var l = this.events[name].length,
			i = 0;
	while(i < l) {
		this.events[name][i].call();
		i++;
	}
};

Provider.prototype.detectProvider = function() {
	this.host = window.location.host.replace('www.', '');
	
	return (this.allowed.indexOf(this.host) >= 0);
};

Provider.prototype.attachEvents = function() {
	var _this = this;

	this.on('start', function(){
		_this.status = 'playing';
		chrome.runtime.sendMessage({action: 'started'});
	});

	this.on('pause', function(){
		_this.status = 'paused';
		chrome.runtime.sendMessage({action: 'paused'});
	})
};

Provider.prototype.__changeState = function(status) {
	if(status != this.status) {
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

Provider.prototype.checkStatus = function() {
	switch(this.host) {
		case "fs.to":
		case "brb.to":
			var p = document.getElementById('player_api');
			if(p && p.fp_getState) {
				var status = p.fp_getState() == 3 ? 'playing' : 'paused';
				this.__changeState(status);
			}
			break;

		case "vk.com":
			var status = document.getElementById('head_play_btn').classList.contains('playing') ? 'playing' : 'paused';
			this.__changeState(status);
			break;

		case "last.fm":
			var status = document.getElementById('webRadio').classList.contains('playing') ? 'playing' : 'paused';
			this.__changeState(status);
			break;

		case "pleer.com":
			var status = document.querySelector('#player #play').classList.contains('pause') ? 'playing' : 'paused';
			this.__changeState(status);
			break;

		case "vimeo.com":
			var status = document.querySelector('.play.state-playing') ? 'playing' : 'paused';
			this.__changeState(status);
			break;

		case "muzebra.com":
			var status = document.querySelector('#player button.play').classList.contains('icon-pause') ? 'playing' : 'paused';
			this.__changeState(status);
			break;

		case "youtube.com":
			var p = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
			if(p.getPlayerState) {
				var status = p.getPlayerState() == 1 ? 'playing' : 'paused';
			} else {
				var status = document.title.indexOf('▶') >= 0 ? 'playing' : 'paused';
			}
			this.__changeState(status);
			break;

		case "grooveshark.com":
			var status = document.getElementById('play-pause').classList.contains('playing') ? 'playing' : 'paused';
			this.__changeState(status);
			break;
	}
};

Provider.prototype.pause = function() {
	if(this.status == 'playing') {
		switch(this.host) {
			case "fs.to":
			case "brb.to":
				var p = document.getElementById('player_api');
				p && p.fp_isPlaying && p.fp_isPlaying() && p.fp_pause && p.fp_pause();
				break;

			case "vk.com":
				document.querySelector('#gp_play.playing') && document.querySelector('#gp_play.playing').click();
				break;

			case "last.fm":
				document.querySelector('#radioControlPause a') && document.querySelector('#radioControlPause a').click()
				break;

			case "pleer.com":
				document.querySelector('#player #play.pause') && document.querySelector('#player #play.pause').click();
				break;

			case "vimeo.com":
				document.querySelector('.play.state-playing') && document.querySelector('.play.state-playing').click();
				break;

			case "muzebra.com":
				document.querySelector('#player button.play.icon-pause') && document.querySelector('#player button.play.icon-pause').click();
				break;

			case "youtube.com":
				if(!document.querySelector(".html5-video-player")) {
					var p = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
					p.pauseVideo();					
				} else {
					document.querySelector(".ytp-button-pause") && document.querySelector(".ytp-button-pause").click();
				}
				break;

			case "grooveshark.com":
				document.querySelector('#play-pause.playing') && document.querySelector('#play-pause.playing').click();
				break;
		}
		this.__changeState('paused');
	}
};

Provider.prototype.play = function() {
	if(this.status != 'playing') {
		switch(this.host) {
			case "fs.to":
			case "brb.to":
				var p = document.getElementById('player_api');
				p && p.fp_isPaused && p.fp_isPaused() && p.fp_play && p.fp_play();
				break;

			case "vk.com":
				document.querySelector('#gp_play:not(.playing)') && document.querySelector('#gp_play:not(.playing)').click();
				break;

			case "last.fm":
				document.querySelector('#radioControlPlay a') && document.querySelector('#radioControlPlay a').click()
				break;

			case "pleer.com":
				document.querySelector('#player #play.play') && document.querySelector('#player #play.play').click();
				break;

			case "vimeo.com":
				document.querySelector('.play.state-paused') && document.querySelector('.play.state-paused').click();
				break;
				
			case "muzebra.com":
				document.querySelector('#player button.play.icon-play') && document.querySelector('#player button.play.icon-play').click();
				break;

			case "youtube.com":
				if(!document.querySelector(".html5-video-player")) {
					var p = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
					p.playVideo();					
				} else {
					document.querySelector(".ytp-button-play") && document.querySelector(".ytp-button-play").click();
				}
				break;

			case "grooveshark.com":
				document.querySelector('#play-pause.paused') && document.querySelector('#play-pause.paused').click();
				break;

		}
		this.__changeState('playing');
	}
};

var ProviderInstance = new Provider();

if(ProviderInstance) {
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.action == 'pause') {
			ProviderInstance.pause();
		}

		if(request.action == 'play') {
			ProviderInstance.play();
		}
	});
}