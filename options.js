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
		for (var i = 0; i < providersCurrent.length; i++) {
			providersCurrent[i]['enabled'] = toggler;

			if (i == providersCurrent.length-1) {
				save_options();
				generateProvidersList();
				toggler = !toggler;
			}
		}

	});

	document.querySelector('.e_clear .btn').addEventListener('click', function(e) {
		chrome.storage.sync.clear();
	});

});

function generateProvidersList() {
	var html = "";

	for (var i = 0; i < providersCurrent.length; i++) {
		html += providerTpl(providersCurrent[i]);

		if (i == providersCurrent.length-1) {
			document.querySelector('#e_select .list-group').innerHTML = html;
			attachProviderHandlers();
		}
	}

}

function attachProviderHandlers() {
	var providersList = document.querySelectorAll('.e_select .list-group-item');
	for (var i = 0; i < providersList.length; i++) {
		providersList[i].addEventListener('click', function(e) {
			var obj = e.target;

			toggleClass(obj, 'active');

			providersCurrent.find(function(el, index) {
				if (el.uri == obj.dataset.provider) {
					providersCurrent[index]['enabled'] = !el.enabled;
				}
			});

			save_options();
		});
	}
}

function providerTpl(provider, active) {
	var tpl = '<div class="list-group-item' + ((provider.enabled) ? ' active' : '') + '" data-provider="' + provider.uri + '">' + provider.uri + '</div>';
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

	chrome.storage.sync.set({
		enabled: enabled,
		providers: providersCurrent
	}, function() {
		showStatus("Settings saved.")
	});
}

// Get options from chrome.storage.sync.
function restore_options() {
	chrome.storage.sync.get({
		enabled: true,
		providers: providersCurrent
	}, function(items) {
		document.querySelector('.is_on input').checked = items.enabled;
		providersCurrent = items.providers;

		generateProvidersList();
	});
}
