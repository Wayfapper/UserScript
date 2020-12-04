// ==UserScript==
// @name			Wayfapper
// @version			0.0.6
// @description		WAYFArer + mAPPER = Wayfapper
// @namespace		https://wfp.cr4.me/
// @downloadURL		https://wfp.cr4.me/dl/wayfapper.user.js
// @homepageURL		https://wfp.cr4.me/
// @match			https://wayfarer.nianticlabs.com/*
// @author			un1matr1x
// @grant           none
// ==/UserScript==

window.onload = function(){
    'use strict';

    //Funktion zur Übermittlung der eigenen Vorschläge
    function sendNomCtrlData(){
        //Prüfung ob von Wayfarer+ die Daten bereitgestellt werden
        if (typeof(nomCtrl) !== "undefined") { //Daten-Objekt stehen von Wayfarer+ bereit
            if (!nomCtrl.loaded){ //Daten-Objekt ist noch nicht fetig geladen
                setTimeout(sendNomCtrlData, 100);
            } else {//Daten-Objekt ist fetig geladen
                fetch("https://wfp.cr4.me/api/v2/webhook.php?&p=n&t="+ WEBHOOK_TOKEN, {
                    method: "POST",
                    body: JSON.stringify(nomCtrl.nomList)
                }).then(function(response) {
                    if (response.status == 222) {
                        document.getElementById("wayfapper_id_icon").style.color = 'green';
                        document.getElementById("wayfapper_id_text").style.color = '#FFF';
                    } else {
                        document.getElementById("wayfapper_id_icon").style.color = 'red';
                        document.getElementById("wayfapper_id_text").style.color = '#FFF';
                    }
                    console.log('[WFP]: '+response.status);
                    return response.text().then(function(text) {
                        console.log('[WFP]: '+text);
                    });
                });
            }
        } else { //Daten-Objekt stehen noch nicht von Wayfarer+ bereit
            setTimeout(sendNomCtrlData, 100);
        }
    }

    function wayfapp_1(){
        console.log("Wayfapper:" + settings["useMods"])
        console.log(window.localStorage.getItem("wfpVersion"))
        console.log(WEBHOOK_TOKEN)
        //Do not apply any mods
    }

    function addCss() {
        const css = `
			a.glyphicon.glyphicon-share {
				margin-right: 13px;
			}

			a.sidebar-item.sidebar-wayfapper {
				padding-left: 15px;
			}

			a.sidebar-item.sidebar-wayfapper:hover {
				padding-left: 10px;
			}

            span.fapper {
               font-family: Akkurat,Roboto,sans-serif;
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
        link.id = 'wayfapper_id_icon';
        link.className = 'sidebar-item sidebar-wayfapper glyphicon';
        if(WEBHOOK_TOKEN == undefined) {
            link.className = link.className+' glyphicon-eye-close';
        }
        else {
            link.className = link.className+' glyphicon-eye-open';
        }
        link.title = 'Configure Wayfapper';
        link.innerHTML = '<span id="wayfapper_id_text" class="fapper">Wayfapper</span>';
        const ref = document.querySelector('.sidebar-community').parentNode;

        ref.insertBefore(link, ref.closest('a[sidebar-item]'));

        link.addEventListener('click', function(e) {
            e.preventDefault();

            const currentToken = getToken();
            const token = window.prompt('Wayfapper-Token', currentToken);
            if (!token)
                return;
            localStorage['wayfapper-token'] = token;
        });
    }


    const WEBHOOK_TOKEN = getToken();
    addConfigurationButton()

    if ((typeof(settings) !== "undefined") && (settings["useMods"])) {
        // login prüfen
        const stats = document.querySelector("body.is-authenticated")
        if ( stats !== null) {
            let rx = /https:\/\/wayfarer.nianticlabs.com\/(\w+)/
            let page = rx.exec(document.location.href)
            if (null !== page) {
                switch (page[1]) {
                    case "review":
                        console.log('[WFP]: ' + page[1])
                        break
                    case "profile":
                        console.log('[WFP]: ' + page[1])
                        break
                    case "nominations":
                        console.log('[WFP]: ' + page[1])
                        window.setTimeout(sendNomCtrlData,100)
                        break
                    case "settings":
                        console.log('[WFP]: ' + page[1])
                        break
                    default:
                        console.log('[WFP] unknown URL: ' + page[1])
                        break
                }
            } else {
                //window.setTimeout(wayfapp_1(),500)
            }
        } else {
            console.log('[WFP]: No Login - nothing to do here')
        }
    } else {
        document.getElementById("wayfapper_id_icon").style.color = 'red';
        document.getElementById("wayfapper_id_icon").title = 'Wayfarer+ not installed oder activated';
    }
};