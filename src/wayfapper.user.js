// ==UserScript==
// @name			Wayfapper
// @version			0.0.2
// @description		Submit wayfarerdata elsewhere
// @author			un1matr1x
// @match			https://wayfarer.nianticlabs.com/*
// @grant			none
// ==/UserScript==
// @namespace		http://tampermonkey.net/

window.onload = function(){
	'use strict';

function sendNomCtrlData(){
	if (typeof nomCtrl != "undefined") {
		if (!nomCtrl.loaded){
		setTimeout(sendNomCtrlData, 100);
		}
	} else {
		setTimeout(sendNomCtrlData, 100);
	}
	fetch("https://wfp.cr4.me/api/v1/webhook.php?&p=n&t="+ WEBHOOK_TOKEN, {
		method: "POST",
		mode: 'no-cors',
		body: JSON.stringify(nomCtrl.nomList)
	});
	console.log('data send to fapper')
}

	function addCss() {
		const css = `
			span.glyphicon.glyphicon-share {
				margin-right: 13px;
			}

			a.sidebar-item.sidebar-wayfapper {
				padding-left: 27px;
			}

			a.sidebar-item.sidebar-wayfapper:hover {
				padding-left: 22px;
				text-decoration: none;
			}`;
		const style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = css;
		document.querySelector('head').appendChild(style);
	}

	function getToken() {
		return localStorage['wayfapper-token'];
	}

	function addConfigurationButton() {
		addCss();

		const link = document.createElement('a');
		link.className = 'sidebar-item sidebar-wayfapper';
		link.title = 'Configure Wayfapper';
		link.innerHTML = '<span class="glyphicon glyphicon-share"></span>Wayfapper';
		const ref = document.querySelector('.sidebar-settings');

		ref.parentNode.insertBefore(link, ref.nextSibling);

		link.addEventListener('click', function(e) {
			e.preventDefault();

			const currentToken = getToken();
			const token = window.prompt('Wayfapper-Token', currentToken);
			if (!token)
				return;
				localStorage['wayfapper-token'] = token;
		});
	}


	// login prüfen
	const stats = document.querySelector("body.is-authenticated")
	if ( stats !== null) {
		let rx = /https:\/\/wayfarer.nianticlabs.com\/(\w+)/
		let page = rx.exec(document.location.href)
		if (null !== page) {
			console.log(page[1])
			switch (page[1]) {
				case "review":
					console.log('Review: ' + page[1])
					break
				case "profile":
					console.log('Profile: ' + page[1])
					break
				case "nominations":
					console.log('Nominations: ' + page[1])
                    window.setTimeout(sendNomCtrlData,100)
					break
				case "settings":
					console.log('Settings: ' + page[1])
					addConfigurationButton()
					break
				default:
					console.log('unknown URL: ' + page[1])
					break
			}
		} else {
			console.log('Mainpage - nothing to do here')
		}
	} else {
		console.log('No Login - nothing to do here')
	}

const WEBHOOK_TOKEN = getToken();

};