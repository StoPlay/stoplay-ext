/* StoPlay Content JS */

var Provider = function() {
	var _this = this;

	this.allowed = [
		'vk.com','grooveshark.com', 'youtube.com', 'vimeo.com',
		'muzebra.com', 'pleer.com', 'last.fm', 'fs.to', 'brb.to',
		'rutube.ru', 'ted.com', 'mixcloud.com', 'x.mixcloud.com',
		'soundcloud.com', 'seasonvar.ru'
	    //, 'megogo.net'
	];
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
	var status;

	switch(this.host) {
		case "fs.to":
		case "brb.to":
			var p = document.getElementById('player_api');
			if(p && p.fp_getState) {
				status = p.fp_getState() == 3 ? 'playing' : 'paused';
			}
			break;

		case "vk.com":
			status = document.getElementById('head_play_btn').classList.contains('playing') ? 'playing' : 'paused';
			break;

		case "ted.com":
			status = document.getElementById('streamingPlayerSWF') && document.getElementById('streamingPlayerSWF').isVideoPlaying && document.getElementById('streamingPlayerSWF').isVideoPlaying() ? 'playing' : 'paused';
			break;

		case "last.fm":
			status = document.getElementById('webRadio').classList.contains('playing') ? 'playing' : 'paused';
			break;

		case "rutube.ru":
			var p = document.querySelector('#video-object-container iframe') && document.querySelector('#video-object-container iframe').contentDocument.getElementById('rutubePlayerHolder_flash_api');
			if(p) {
				status = p.getPlayerState && p.getPlayerState();
			}
			break;

		case "pleer.com":
			status = document.querySelector('#player #play').classList.contains('pause') ? 'playing' : 'paused';
			break;

		case "vimeo.com":
			status = document.querySelector('.play.state-playing') ? 'playing' : 'paused';
			break;

		case "muzebra.com":
			status = document.querySelector('#player button.play').classList.contains('icon-pause') ? 'playing' : 'paused';
			break;

		case "youtube.com":
			var p = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
			if(p.getPlayerState) {
				status = p.getPlayerState() == 1 ? 'playing' : 'paused';
			} else {
				status = document.title.indexOf('▶') >= 0 ? 'playing' : 'paused';
			}
			break;

		case "seasonvar.ru":
			status = document.querySelector('#vpcenter object').getUppod && document.querySelector('#vpcenter object').getUppod('getstatus');
			status = status == 1 ? 'playing' : 'paused';
			break;

		case "grooveshark.com":
			var p = document.querySelector('.lightbox-interactionTimeout .submit');
			if (p) {
				p.click();
			}
			status = document.getElementById('play-pause').classList.contains('playing') ? 'playing' : 'paused';
			break;
		/*
		// farewell old version
		case "mixcloud.com":
			status = document.getElementById('player-play') &&
				document.getElementById('player-play')
				.classList.contains('playing') ? 'playing' : 'paused';
		*/
		case "mixcloud.com":
			// beta version, will soon be the main one
			status = document.querySelector('.player-control') &&	
				document.querySelector('.player-control')	
				.classList.contains('pause-state') ? 'playing' : 'paused';	
			break;
		case "soundcloud.com":
			status = document.querySelector('.playControl').classList.contains('playing') ? 'playing' : 'paused';
			break;
	}
	this.__changeState(status);
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

			case "ted.com":
				var p = document.getElementById('streamingPlayerSWF');
				p && p.pauseVideo && p.pauseVideo();
				break;

			case "last.fm":
				document.querySelector('#radioControlPause a') && document.querySelector('#radioControlPause a').click()
				break;

			case "rutube.ru":
				var p = document.querySelector('#video-object-container iframe') && document.querySelector('#video-object-container iframe').contentDocument.getElementById('rutubePlayerHolder_flash_api');
				p && p.pauseVideo && p.pauseVideo();
				break;

			case "pleer.com":
				document.querySelector('#player #play.pause') && document.querySelector('#player #play.pause').click();
				break;

			case "vimeo.com":
				document.querySelector('.play.state-playing') && document.querySelector('.play.state-playing').click();
				break;

			case "megogo.net":
				var p = document.getElementById("playerFrame");
				p && p.contentDocument && p.contentDocument.getElementById('player_object') && p.contentDocument.getElementById('player_object').megogoPlayerPause && p.contentDocument.getElementById('player_object').megogoPlayerPause();
				break;

			case "muzebra.com":
				document.querySelector('#player button.play.icon-pause') && document.querySelector('#player button.play.icon-pause').click();
				break;

			case "youtube.com":
				var p = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
				p && p.pauseVideo && p.pauseVideo();					
				break;

			case "seasonvar.ru":
				document.querySelector('#vpcenter object').sendToUppod && document.querySelector('#vpcenter object').sendToUppod('pause');
				break;

			case "grooveshark.com":
				document.querySelector('#play-pause.playing') && document.querySelector('#play-pause.playing').click();
				break;
			/*
			// farewell old version
			case "mixcloud.com":
				document.querySelector('.cc-pause-button').click();
				break;
			*/
			case "mixcloud.com":
				document.querySelector('.player-control').click();
				break;
			case "soundcloud.com":
				document.querySelector('.playControl.playing') && document.querySelector('.playControl').click();
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

			case "ted.com":
				var p = document.getElementById('streamingPlayerSWF');
				p && p.playVideo && p.playVideo();
				break;

			case "last.fm":
				document.querySelector('#radioControlPlay a') && document.querySelector('#radioControlPlay a').click()
				break;

			case "rutube.ru":
				var p = document.querySelector('#video-object-container iframe') && document.querySelector('#video-object-container iframe').contentDocument.getElementById('rutubePlayerHolder_flash_api');
				p && p.playVideo && p.playVideo();
				break;

			case "pleer.com":
				document.querySelector('#player #play.play') && document.querySelector('#player #play.play').click();
				break;

			case "vimeo.com":
				document.querySelector('.play.state-paused') && document.querySelector('.play.state-paused').click();
				break;

			case "megogo.net":
				var p = document.getElementById("playerFrame");
				p && p.contentDocument && p.contentDocument.getElementById('player_object') && p.contentDocument.getElementById('player_object').megogoPlayerResume && p.contentDocument.getElementById('player_object').megogoPlayerResume();
				break;

			case "muzebra.com":
				document.querySelector('#player button.play.icon-play') && document.querySelector('#player button.play.icon-play').click();
				break;

			case "youtube.com":
				var p = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
				p && p.playVideo && p.playVideo();
				break;

			case "seasonvar.ru":
				document.querySelector('#vpcenter object').sendToUppod && document.querySelector('#vpcenter object').sendToUppod('play');
				break;

			case "grooveshark.com":
				document.querySelector('#play-pause.paused') && document.querySelector('#play-pause.paused').click();
				break;
			/*
			// farewell old version
			case "mixcloud.com":
				document.querySelector('.cc-play-button').click();
				break;
			*/
			case "mixcloud.com":
				document.querySelector('.player-control').click();
				break;
			case "soundcloud.com":
				document.querySelector('.playControl') && document.querySelector('.playControl').click();
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