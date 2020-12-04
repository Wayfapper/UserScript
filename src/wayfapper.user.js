// ==UserScript==
// @id				wayfapper
// @name			Wayfapper
// @category		Misc
// @version			0.0.12
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

    const WEBHOOK_URL = 'https://wfp.cr4.me/api/v5/webhook.php';
    const WEBHOOK_TOKEN = await getToken();

    /**
	* Check the matching website and do specified tasks based on the webpage
	*/

    //Check for Ingress
    if (window.location.href.indexOf('.ingress.com/intel') > -1) {
        console.log('[WFP]: intel ingress recognized');

        var seenGuids = new Set();
        var portals = [];
        var inFlight = false;
        var timerStarted = false;

        var sendData = function (data) {
            fetch(WEBHOOK_URL + "?&p=w&t="+ WEBHOOK_TOKEN, {
                method: 'POST',
                body: data
            }).then(function (response) {
                if (!response.ok) {
                    if (response.status >= 400 && response.status <= 499) {
                        console.error("portalfinder: 4xx error, not retrying", response);
                    } else {
                    }
                } else {
                    inFlight = false;
                    checkSend();
                }
            }).catch(function (error) {
                console.warn("portalfinder: network error, retrying in 10 seconds", error);
                window.setTimeout(function () {
                    sendData(data);
                }, 10000);
            });
        };

        var checkSend = function () {
            if (timerStarted || inFlight) {
                return;
            }

            if (Object.keys(portals).length !== 0) {
                timerStarted = true;
                window.setTimeout(function () {
                    timerStarted = false;
                    inFlight = true;
                    sendData(JSON.stringify(portals));
                    portals = [];
                }, 3000);
            }
        };

        var cleanSeenSet = function () {
            seenGuids.clear();
        };

        var safeTrim = function (str) {
            if (typeof str === 'string') {
                return str.trim();
            } else {
                return str;
            }
        };

        var IPortal = function (guid, ent) {
            return [
                guid,
                ent[2]/1E6, // latE6
                ent[3]/1E6, // lngE6
                ent[8], // title
                safeTrim(ent[7]) // image
            ];
        };

        var ingressMethodRegex = /^(?:(?:https?:)?\/\/(?:www\.|intel\.)?ingress\.com)?\/r\/(getPortalDetails|getEntities)$/i;
        (function (open) {
            XMLHttpRequest.prototype.open = function () {
                if (window.disable_portalfinder) {
                    // Testing override
                    open.apply(this, arguments);
                    return;
                }

                var apiFunc, match;
                if ((match = arguments[1].match(ingressMethodRegex)) !== null) {
                    apiFunc = match[1];
                    var getPortalDetailsGuid;
                    if (apiFunc === 'getPortalDetails') {
                        var origSend = this.send;
                        this.send = function () {
                            getPortalDetailsGuid = JSON.parse(arguments[0]).guid;
                            origSend.apply(this, arguments);
                        };
                    }
                    this.addEventListener("readystatechange", function () {
                        if (this.readyState === 4 && this.status === 200) {
                            try {
                                if ((this.responseText === '{}') || (this.responseText.startsWith('<!DOCTYPE html>'))) {
                                    return;
                                }

                                var data;
                                switch (apiFunc) {
                                    case 'getPortalDetails':
                                        var guid = getPortalDetailsGuid;
                                        if (!seenGuids.has(guid)) {
                                            seenGuids.add(guid);
                                            data = JSON.parse(this.responseText);
                                            if (data.result === undefined) {
                                                return;
                                            }
                                            portals.push(new IPortal(guid, data.result));
                                        }
                                        break;
                                    case 'getEntities':
                                        data = JSON.parse(this.responseText);
                                        if ((data.result === undefined) || (data.result.map === undefined)) {
                                            return;
                                        }

                                        for (var tile in data.result.map) {
                                            if (data.result.map.hasOwnProperty(tile)) {
                                                if (data.result.map[tile].gameEntities === undefined) {
                                                    continue;
                                                }

                                                data.result.map[tile].gameEntities.forEach(function (ent) {
                                                    switch (ent[2][0]) { // Entity type
                                                        case 'p': // Portal
                                                            var guid = ent[0];
                                                            if (!seenGuids.has(guid)) {
                                                                cleanSeenSet();
                                                                seenGuids.add(guid);
                                                                portals.push(new IPortal(guid, ent[2]));
                                                            }
                                                            break;
                                                    }
                                                });
                                            }
                                        }
                                        break;
                                    default:
                                        return;
                                }
                                checkSend();
                            } catch (e) {
                                console.error("portalfinder: Caught error in Intel XHR hook", apiFunc, e, this.responseText);
                            }
                        }
                    }, false);
                }
                open.apply(this, arguments);
            };
        })(XMLHttpRequest.prototype.open);

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