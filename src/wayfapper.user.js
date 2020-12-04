// ==UserScript==
// @id				wayfapper
// @name			Wayfapper
// @category		Misc
// @version			0.0.10
// @description		WAYFArer + mAPPER = Wayfapper
// @namespace		https://wfp.cr4.me/
// @downloadURL		https://wfp.cr4.me/dl/wayfapper.user.js
// @homepageURL		https://wfp.cr4.me/
// @include			https://wfp.cr4.me/
// @include			https://wayfarer.nianticlabs.com/*
// @include			http://ingress.com/intel*
// @include			http://www.ingress.com/intel*
// @include			https://www.ingress.com/intel*
// @include			https://ingress.com/intel*
// @include			https://intel.ingress.com/intel*
// @match			https://wfp.cr4.me/
// @match			https://wayfarer.nianticlabs.com/*
// @match			http://ingress.com/intel*
// @match			http://www.ingress.com/intel*
// @match			https://www.ingress.com/intel*
// @match			https://ingress.com/intel*
// @match			https://intel.ingress.com/intel*
// @grant           GM.getValue
// @grant           GM.setValue
// @grant           GM_getValue
// @grant           GM_setValue
// ==/UserScript==

(async function() {
    'use strict';
    /**
   * Overall script parts are placed here
   */
    console.log('[WFP]: init');


    async function getToken(a) {
        let token = await GM.getValue("wayfapper-token", -1);
        return token;
    }

    const WEBHOOK_URL = 'https://wfp.cr4.me/api/v4/webhook.php';
    const WEBHOOK_TOKEN = await getToken();

    /**
	* Check the matching website and do specified tasks based on the webpage
	*/

    //Check for Ingress
    if (window.location.href.indexOf('.ingress.com/intel') > -1) {
        console.log('[WFP]: intel ingress recognized');


        //Check for Wayfapper
    } else if (window.location.href.indexOf('wfp.cr4.me') > -1) {
        console.log('[WFP]: wayfapper recognized');


        //Check for Wayfarer
    } else if (window.location.href.indexOf('wayfarer.nianticlabs.com') > -1) {
        console.log('[WFP]: wayfarer recognized');
        //Funktion zur Übermittlung der eigenen Vorschläge
        function sendNomCtrlData(){
            //Prüfung ob von Wayfarer+ die Daten bereitgestellt werden
            if (typeof(nomCtrl) !== "undefined") { //Daten-Objekt stehen von Wayfarer+ bereit
                if (!nomCtrl.loaded){ //Daten-Objekt ist noch nicht fetig geladen
                    setTimeout(sendNomCtrlData, 100);
                } else {//Daten-Objekt ist fetig geladen
                    fetch(WEBHOOK_URL + "?&p=n&t="+ WEBHOOK_TOKEN, {
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

        //Funktion zur Übermittlung der eigenen Vorschläge
        function sendProfileData(){
            console.log('[WFP]: Profile waiting');
            //Prüfung ob von Wayfarer+ die Daten bereitgestellt werden
            if (typeof(pCtrl) !== "undefined") { //Daten-Objekt stehen von Wayfarer+ bereit
                if (!pCtrl.loaded){ //Daten-Objekt ist noch nicht fetig geladen
                    setTimeout(sendProfileData, 100);
                } else {//Daten-Objekt ist fetig geladen
                    var profileStats = document.getElementById("profile-stats");
                    var jprovile = new Object();
                    jprovile.reviews = parseInt(profileStats.children[0].children[0].children[1].innerText);
                    if (settings["profExtendedStats"] == 'truth' || settings["profExtendedStats"] == 'aprox') {
                        jprovile.nominations_pos = parseInt(profileStats.children[1].children[2].children[1].innerText);
                        jprovile.nominations_neg = parseInt(profileStats.children[1].children[3].children[1].innerText);
                        jprovile.dublicates =parseInt(profileStats.children[1].children[4].children[1].innerText);
                    } else if (settings["profExtendedStats"] == 'off') {
                        jprovile.nominations_pos = parseInt(profileStats.children[1].children[1].children[1].innerText);
                        jprovile.nominations_neg = parseInt(profileStats.children[1].children[2].children[1].innerText);
                        jprovile.dublicates =parseInt(profileStats.children[1].children[3].children[1].innerText);
                    } else {
                        return;
                    }
                    fetch(WEBHOOK_URL + "?&p=p&t=" + WEBHOOK_TOKEN, {
                        method: "POST",
                        body: JSON.stringify(jprovile)
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
                setTimeout(sendProfileData, 100);
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
                (async () => {
                    e.preventDefault();

                    const token = window.prompt('Wayfapper-Token', WEBHOOK_TOKEN);
                    if (!token)
                        return;
                    await GM.setValue('wayfapper-token', String(token));
                })();
            });
        }

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
                            window.setTimeout(sendProfileData,100)
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
                    //check if gm-storage is fulled, else check for old data can be used
                    if (WEBHOOK_TOKEN == -1) {
                        if (localStorage['wayfapper-token'] == undefined) {
                            console.log('[WFP] localstorage: empty');
                        }
                        else {
                            console.log('[WFP] localstorage: '+localStorage['wayfapper-token']);
                            GM.setValue('wayfapper-token', localStorage['wayfapper-token']);
                        }
                    }
                }
            } else {
                console.log('[WFP]: No Login - nothing to do here')
            }
        } else {
            document.getElementById("wayfapper_id_icon").style.color = 'red';
            document.getElementById("wayfapper_id_icon").title = 'Wayfarer+ not installed oder activated';
        }

        //Userscript include matched, but page isn't recognized - went something south?
    } else {
        console.log('[WFP]: pages mismatch');
    }
})();