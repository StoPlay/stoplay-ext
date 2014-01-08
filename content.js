/* StoPlay Content JS */

var Provider = function() {
	var _this = this;

	this.allowed = ['vk.com', 'grooveshark.com', 'youtube.com', 'vimeo.com'];
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
		case "vk.com":
			var status = document.getElementById('head_play_btn').classList.contains('playing') ? 'playing' : 'paused';
			this.__changeState(status);
			break;

		case "vimeo.com":
			var status = document.querySelector('.play.state-playing') ? 'playing' : 'paused';
			this.__changeState(status);
			break;

		case "youtube.com":
			var status = document.title.indexOf('▶') >= 0 ? 'playing' : 'paused';
			this.__changeState(status);
			break;

		case "grooveshark.com":
			var status = document.getElementById('play-pause').classList.contains('playing') ? 'playing' : 'paused';
			this.__changeState(status);
			break;
	}
};

Provider.prototype.pause = function() {
	console.log('Pause', this.host);
	if(this.status == 'playing') {
		switch(this.host) {
			case "vk.com":
				document.querySelector('#gp_play.playing') && document.querySelector('#gp_play.playing').click();
				break;

			case "vimeo.com":
				document.querySelector('.play.state-playing') && document.querySelector('.play.state-playing').click();
				break;

			case "grooveshark.com":
				document.querySelector('#play-pause.playing') && document.querySelector('#play-pause.playing').click();
				break;
		}
		this.__changeState('paused');
	}
};

Provider.prototype.play = function() {
	console.log('Play', this.host);
	
	if(this.status != 'playing') {
		switch(this.host) {
			case "vk.com":
				document.querySelector('#gp_play:not(.playing)') && document.querySelector('#gp_play:not(.playing)').click();
				break;
				
			case "vimeo.com":
				document.querySelector('.play.state-paused') && document.querySelector('.play.state-paused').click();
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