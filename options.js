// options
"use strict";

var providersCurrent = [];
var toggler = true;

document.addEventListener('DOMContentLoaded', function() {
	restore_options();

	// global enable
	document.querySelector('.is_on input').addEventListener('change', function(e) {
		save_options();
	});

	// toggle all
	document.querySelector('.e_select_toggle_all').addEventListener('click', function(e) {
		providersCurrent = providersCurrent.map(function(item) {
			return item.enabled = toggler;
		});
		save_options();
		generateProvidersList();
		toggler = !toggler;
	});

	// toggle all
	document.querySelector('.e_filter_options_clear').addEventListener('click', function(e) {
		var filter_obj = document.querySelector('.e_filter_options input');
		filter_obj.value = '';
		filter_obj.dispatchEvent(new Event('keyup'));
	});

	// filter options
	document.querySelector('.e_filter_options input').addEventListener('keyup', function(e) {
		var obj = e.target;
		var obj_val = obj.value;
		var parent = obj.parentElement;
		if (obj_val.length) {
			parent.classList.add('filter_active');
		} else {
			parent.classList.remove('filter_active');
		}

		providersCurrent = providersCurrent.map(function(item, index) {
			var found = item.uri.indexOf(obj_val) !== -1;
			delete item.hidden;
			if (!found) {
				item.hidden = true;
			}
			return item;
		});
		generateProvidersList();
	});

	document.querySelector('.e_clear .btn').addEventListener('click', function(e) {
		chrome.storage.sync.clear();
	});

});

function generateProvidersList() {
	var html = "";
	providersCurrent.forEach(function(item) {
		html += providerTpl(item);
	});
	console.log('STOPLAY generateProvidersList', providersCurrent.length);
	document.querySelector('#e_select .list-group').innerHTML = html;
	attachProviderHandlers();
}

function attachProviderHandlers() {
	var providersList = document.querySelectorAll('.e_select .list-group-item');
	providersList.forEach(function(item) {
		item.addEventListener('click', function(e) {
			console.log('STOPLAY click provider')
			var obj = e.target;

			toggleClass(obj, 'active');

			providersCurrent = providersCurrent.map(function(el, index) {
				if (el.uri === obj.dataset.provider) {
					el.enabled = !el.enabled;
					console.log('STOPLAY click provider enabled', el.enabled);
				}
				return el;
			});
			setTimeout(save_options, 0);
		});
	});
}

function providerTpl(provider, active) {
	var tpl = '<div class="list-group-item' + ((provider.enabled) ? ' active' : '') + ((provider.hidden) ? ' hidden' : '') + '" data-provider="' + provider.uri + '">' + provider.uri + '</div>';
	return tpl;
}


function toggleClass(obj, className) {
	if (obj.classList.contains(className)) {
		obj.classList.remove(className);
	} else {
		obj.classList.add(className);
	}
};

function showStatus(text) {
	var status = document.getElementById('status');
	status.textContent = text;
	status.style.display = 'block';
	setTimeout(function() {
		status.textContent = '';
		status.style.display = 'none';
	}, 2000);
}

// Saves options to chrome.storage.sync.
function save_options() {
	var enabled = document.querySelector('.is_on input').checked;
	// clear hidden state
	providersCurrent = providersCurrent.map(function(item) {
		if (typeof item.hidden !== 'undefined') {
			delete item.hidden;
		}
		return item;
	});
	chrome.storage.sync.set({
		enabled: enabled,
		providers: providersCurrent
	}, function() {
		console.log('STOPLAY saved', providersCurrent);
		showStatus("Settings saved.")
	});
}

// Get options from chrome.storage.sync.
function restore_options() {
	chrome.storage.sync.get({
		enabled: true,
		providers: providersCurrent
	}, function(items) {
		console.log('STOPLAY options get', items);
		document.querySelector('.is_on input').checked = items.enabled;
		if (items.providers.length) {
			providersCurrent = items.providers;
		} else {
			console.log('STOPLAY we have no idea of the options, something is wrong');
		}

		generateProvidersList();
	});
}
