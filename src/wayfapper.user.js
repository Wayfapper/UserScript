// ==UserScript==
// @id              wayfapper
// @name            Wayfapper
// @category        Misc
// @version         0.1.7
// @description     WAYFArer + mAPPER = Wayfapper
// @namespace       https://wfp.cr4.me/
// @downloadURL     https://wfp.cr4.me/dl/wayfapper.user.js
// @homepageURL     https://wfp.cr4.me/
// @supportURL      https://github.com/Wayfapper/UserScript/issues
// @include         https://wfp.cr4.me/
// @include         https://wayfarer.nianticlabs.com/*
// @include         https://www.ingress.com/intel*
// @include         https://ingress.com/intel*
// @include         https://intel.ingress.com/intel*
// @match           https://wfp.cr4.me/
// @match           https://wayfarer.nianticlabs.com/*
// @match           https://www.ingress.com/intel*
// @match           https://ingress.com/intel*
// @match           https://intel.ingress.com/intel*
// @grant           GM.getValue
// @grant           GM.setValue
// @grant           GM_getValue
// @grant           GM_setValue
// ==/UserScript==

(async function () {
  "use strict";
  /**
   * Overall script parts are placed here
   */
  console.log("[WFP]: init");

  /**
   * Recieve the stored token, async function needed due to GM_get/set
   * @return {string} The stored token.
   */
  async function getToken() {
    const token = await GM.getValue("wayfapper-token", -1);
    return token;
  }

  // define basic parameter that are used everywhere
  const WEBHOOK_URL = "https://wfp.cr4.me/api/v5/webhook.php";
  const WEBHOOK_TOKEN = await getToken();

  /**
   * Stop this script for a defined time
   * @param {init} milliseconds time to wait
   * @return {object} Promise if time has passed
   */
  function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  /**
   * Check whether basic requirements for the token are met
   * @param {string} token potential space spolluted string
   * @return {boolean} true if token passes
   */
  function checkWebhookToken(token) {
    const WEBHOOK_CHAR = /^[a-zA-Z0-9]+$/;
    if (token !== -1 && token.length == 64 && WEBHOOK_CHAR.test(token)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Add some stylerules to wayfarer
   */
  function addWayfarerCss() {
    const css = `
      span.fapper {
        font-family: Akkurat,Roboto,sans-serif;
      }
      .badge {
        position: absolute;
        padding: 5px 10px !important;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
      }
      .sidebar__item--fapper_force {
        min-height: 25px !important;
      }`;
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = css;
    document.querySelector("head").appendChild(style);
  }

  /**
   * Add some visible representation of wayfapper to wayfarer
   */
  function addWayfarerVisibles() {
    const badgeNode = document.createElement("span");
    badgeNode.innerHTML = "&nbsp;";
    badgeNode.id = "bage_hover";
    badgeNode.className = "badge";
    const badge = document.querySelector(".sidebar__item--settings span")
      .parentNode;
    badge.insertBefore(badgeNode, badge.childNodes[0]);
  }

  /**
   * Add a force submission and reload button
   */
  function addWayfarerForceSubmission() {
    const fapperForce = document.createElement("a");
    fapperForce.title = "Force submission after reload";
    fapperForce.id = "fapper_force";
    fapperForce.className = "sidebar__item sidebar__item--fapper_force";
    fapperForce.innerHTML =
      '<m class="glyphicon glyphicon-retweet"></m><span> Force Submit</span>';
    const fapper = document.querySelector(".sidebar__item--community");
    fapper.parentNode.insertBefore(fapperForce, fapper.nextSibling);

    fapperForce.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage["[WFP]_n"] = 0;
      localStorage["[WFP]_p"] = 0;
      location.reload();
    });
  }

  /**
   * Change wayfarer sidebare items color as feedback
   * @param {string} sidebarItem the item for the feedback
   * @param {string} color the indication color, default red
   */
  function setWayfarerFeedback(sidebarItem = "s", color = "red") {
    let setColor = "";
    let setItem = "";
    switch (sidebarItem) {
      case "p":
        setItem = ".sidebar__item--profile";
        break;
      case "n":
        setItem = ".sidebar__item--nominations";
        break;
      case "s":
      default:
        setItem = ".sidebar__item--settings";
        break;
    }
    switch (color) {
      case "green":
        setColor = "rgba(0, 255, 0, 0.1)";
        localStorage["[WFP]_" + sidebarItem] = Date.now();
        break;
      case "yellow":
        setColor = "rgba(255, 255, 0, 0.1)";
        addWayfarerForceSubmission();
        break;
      case "red":
      default:
        setColor = "rgba(255, 0, 0, 0.1)";
        break;
    }
    document
      .querySelectorAll(setItem)[0]
      .setAttribute("style", "background-color :" + setColor + " !important");
  }

  /**
   * Check, if we should allow another trasmission to wayfapper
   * @param {string} page where the trasmissions came from for the check
   * @param {inti} time min passed duraction since last successfull transmition
   * @return {boolean} true if time since last transmission is allready passed
   */
  function checkWayfarerLastTransmit(page, time = 30) {
    let timestamp = 0;
    if (localStorage["[WFP]_" + page]) {
      timestamp = parseInt(localStorage["[WFP]_" + page]);
    }
    if (Date.now() > time * 60 * 1000 + timestamp) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Change wayfarer sidebare items color as feedback
   * @param {string} data object with the informations
   * @param {string} page target to submit the data
   */
  function sendDataToWayfapper(data, page = "s") {
    fetch(WEBHOOK_URL + "?&p=" + page + "&t=" + WEBHOOK_TOKEN, {
      method: "POST",
      body: JSON.stringify(data),
    }).then(function (response) {
      if (response.status == 222) {
        setWayfarerFeedback(page, "green");
      } else {
        setWayfarerFeedback(page, "red");
      }
      console.log("[WFP]: " + response.status);
      return response.text().then(function (text) {
        console.log("[WFP]: " + text);
      });
    });
  }

  /**
   * Extract and submit data from the wayfarer nominations
   */
  function sendWayfarerNominationsData() {
    console.log("[WFP]: Nominations waiting");
    if (checkWayfarerLastTransmit("n", 20)) {
      if (typeof nomCtrl !== "undefined") {
        // WF+ data object is available
        if (!nomCtrl.loaded) {
          // WF+ data object isn't loaded yet, but available, retour to the start
          setTimeout(sendWayfarerNominationsData, 100);
        } else {
          // WF+ data object is loaded, let's start
          sendDataToWayfapper(nomCtrl.nomList, "n");
        }
      } else {
        // WF+ data object isn't available, retour to the start
        setTimeout(sendWayfarerNominationsData, 100);
      }
    } else {
      setWayfarerFeedback("n", "yellow");
    }
  }

  /**
   * Extract and submit data from the wayfarer profile
   */
  function sendWayfarerProfileData() {
    console.log("[WFP]: Profile waiting");
    if (checkWayfarerLastTransmit("p", 5)) {
      if (typeof pCtrl !== "undefined") {
        // WF+ data object is available
        if (!pCtrl.loaded) {
          // WF+ data object isn't loaded yet, but available, retour to the start
          setTimeout(sendWayfarerProfileData, 100);
        } else {
          // WF+ data object is loaded, let's start
          const profileStats = document.getElementById("profile-stats");
          const jprovile = {};
          jprovile.reviews = parseInt(
            profileStats.children[0].children[0].children[1].innerText
          );
          if (
            settings["profExtendedStats"] == "truth" ||
            settings["profExtendedStats"] == "aprox"
          ) {
            jprovile.nominations_pos = parseInt(
              profileStats.children[1].children[2].children[1].innerText
            );
            jprovile.nominations_neg = parseInt(
              profileStats.children[1].children[3].children[1].innerText
            );
            jprovile.dublicates = parseInt(
              profileStats.children[1].children[4].children[1].innerText
            );
          } else if (settings["profExtendedStats"] == "off") {
            jprovile.nominations_pos = parseInt(
              profileStats.children[1].children[1].children[1].innerText
            );
            jprovile.nominations_neg = parseInt(
              profileStats.children[1].children[2].children[1].innerText
            );
            jprovile.dublicates = parseInt(
              profileStats.children[1].children[3].children[1].innerText
            );
          } else {
            return;
          }
          sendDataToWayfapper(jprovile, "p");
        }
      } else {
        // WF+ data object isn't available, retour to the start
        setTimeout(sendWayfarerProfileData, 100);
      }
    } else {
      setWayfarerFeedback("p", "yellow");
    }
  }

  /**
   * Add some wayfapper options to wayfarer settings
   */
  function addWayfarerSetting() {
    // TODO change german language to languagekeys
    let dispToken = "";
    if (!checkWebhookToken(WEBHOOK_TOKEN)) {
      dispToken = "Kein (richtiger?) Token gespeichert";
    } else {
      dispToken =
        WEBHOOK_TOKEN.substring(0, 5) + "***" + WEBHOOK_TOKEN.substring(59, 64);
    }
    const h3WfrSetting = document.createElement("h3");
    h3WfrSetting.innerHTML = "Wayfapper";
    h3WfrSetting.className = "settings__breadcrumb";

    const divWfrSetting = document.createElement("div");
    divWfrSetting.className = "settings-content";
    divWfrSetting.innerHTML =
      '<div class="settings-item">' +
      '<div class="item-header">' +
      "<span>Wayfapper-Token</span>" +
      '<div class="item-edit icon" id="wfp_token_pop">' +
      "</div>" +
      "</div>" +
      '<div class="item-value ng-binding">' +
      dispToken +
      "</div>" +
      '<div class="item-text additional-description">Dein persönlicher ' +
      "Token, der dich gegenüber dem Wayfapper-Projekt ausweist" +
      "</div>";

    const h3Wfr = document.querySelector("h3").parentNode;
    h3Wfr.insertBefore(divWfrSetting, h3Wfr.childNodes[0]);
    h3Wfr.insertBefore(h3WfrSetting, h3Wfr.childNodes[0]);

    const wfpTokenPop = document.getElementById("wfp_token_pop");
    wfpTokenPop.addEventListener("click", function (e) {
      (async () => {
        e.preventDefault();
        const token = window.prompt("Wayfapper-Token", WEBHOOK_TOKEN);
        if (!token) return;
        await GM.setValue("wayfapper-token", String(token));
      })();
    });
  }

  /**
   * Select what should happen, when wayfarer is detected
   */
  function wayfarerMainFunction() {
    const stats = document.querySelector("body.is-authenticated");
    if (stats !== null) {
      addWayfarerCss();
      addWayfarerVisibles();
      const rx = /https:\/\/wayfarer.nianticlabs.com\/(\w+)/;
      const page = rx.exec(document.location.href);
      if (null !== page) {
        if (page[1] == "settings" || checkWebhookToken(WEBHOOK_TOKEN)) {
          switch (page[1]) {
            case "review":
              console.log("[WFP]: reviews");
              break;
            case "profile":
              console.log("[WFP]: profile");
              window.setTimeout(sendWayfarerProfileData, 100);
              break;
            case "nominations":
              console.log("[WFP]: nominations");
              window.setTimeout(sendWayfarerNominationsData, 100);
              break;
            case "settings":
              console.log("[WFP]: settings");
              window.setTimeout(addWayfarerSetting, 10);
              break;
            default:
              console.log("[WFP] unknown URL: " + page[1]);
              break;
          }
        } else {
          setWayfarerFeedback("s", "red");
        }
      } else {
        // check if gm-storage is filled, else check for old data can be used
        // this check & conversion will be removed in version 0.2.0
        // TODO remove @version 0.2.0
        if (WEBHOOK_TOKEN == -1) {
          if (localStorage["wayfapper-token"] == undefined) {
            console.log("[WFP] token: empty");
          } else {
            console.log(
              "[WFP] localstorage: " + localStorage["wayfapper-token"]
            );
            GM.setValue("wayfapper-token", localStorage["wayfapper-token"]);
          }
        }
      }
    } else {
      console.log("[WFP]: No Login - nothing to do here");
    }
  }

  /**
   * ReCheck if Wayfarer+ is now avalible
   * @param {int} recheckCount loop counter
   */
  async function wayfarerMainRecheck(recheckCount = 1) {
    console.log(
      "[WFP]: Wayfarer+ not recognized by now, retry N° " + recheckCount + "/10"
    );
    recheckCount++;
    await sleep(recheckCount * 100);
    if (typeof settings !== "undefined" && settings["useMods"]) {
      window.setTimeout(wayfarerMainFunction, 10);
    } else if (recheckCount < 11) {
      window.setTimeout(wayfarerMainRecheck, 10, recheckCount);
    }
  }

  /**
   * Submit data from the intel map
   * @param {object} data object that contains the portal infos
   */
  function sendIntelPortalData(data) {
    if (checkWebhookToken(WEBHOOK_TOKEN)) {
      fetch(WEBHOOK_URL + "?&p=w&t=" + WEBHOOK_TOKEN, {
        method: "POST",
        body: data,
      })
        .then(function (response) {
          if (!response.ok) {
            if (response.status >= 400 && response.status <= 499) {
              console.error("[WFP] 4xx error, not retrying", response);
            }
          } else {
            inFlight = false;
            checkIntelSend();
          }
        })
        .catch(function (error) {
          console.warn("[WFP] network error, retrying in 10 seconds", error);
          window.setTimeout(function () {
            sendIntelPortalData(data);
          }, 10000);
        });
    }
  }

  /**
   * Trim a string
   * @param {string} str potential space spolluted string
   * @return {string} str clean string
   */
  function safeIntelTrim(str) {
    if (typeof str === "string") {
      return str.trim();
    } else {
      return str;
    }
  }

  /**
   * Reduce PortalData to the needs
   * @param {string} guid graphicuserinterfaceid
   * @param {object} ent portaldata
   * @return {object} clean portalobject
   */
  function IPortal(guid, ent) {
    return [
      // portalid
      guid,
      // latE6 converted to normal coordinates
      ent[2] / 1e6,
      // lngE6  converted to normal coordinates
      ent[3] / 1e6,
      // portaltitle
      ent[8],
      // portalimage
      safeIntelTrim(ent[7]),
    ];
  }

  if (window.location.href.indexOf("wfp.cr4.me") > -1) {
    console.log("[WFP]: Wayfapper recognized");
    // TODO add stuff here, later
  } else if (window.location.href.indexOf("wayfarer.nianticlabs.com") > -1) {
    console.log("[WFP]: Wayfarer recognized");
    if (typeof settings !== "undefined" && settings["useMods"]) {
      window.setTimeout(wayfarerMainFunction, 10);
    } else {
      window.setTimeout(wayfarerMainRecheck, 50);
      setWayfarerFeedback("s", "red");
    }
  } else if (window.location.href.indexOf(".ingress.com/intel") > -1) {
    console.log("[WFP]: Ingress Intel-Map recognized");

    const seenGuids = new Set();
    let portals = [];
    let inFlight = false;
    let timerStarted = false;
    const ingressMethodRegex = /^(?:(?:https?:)?\/\/(?:www\.|intel\.)?ingress\.com)?\/r\/(getPortalDetails|getEntities)$/i;

    /**
     * Check data from the intel map
     */
    function checkIntelSend() {
      if (timerStarted || inFlight) {
        return;
      }
      if (Object.keys(portals).length !== 0) {
        timerStarted = true;
        window.setTimeout(function () {
          timerStarted = false;
          inFlight = true;
          sendIntelPortalData(JSON.stringify(portals));
          portals = [];
        }, 3000);
      }
    }

    (function (open) {
      XMLHttpRequest.prototype.open = function () {
        if (window.disable_portalfinder) {
          // Testing override
          open.apply(this, arguments);
          return;
        }
        let apiFunc;
        let match;
        if ((match = arguments[1].match(ingressMethodRegex)) !== null) {
          apiFunc = match[1];
          let getPortalDetailsGuid;
          if (apiFunc === "getPortalDetails") {
            const origSend = this.send;
            this.send = function () {
              getPortalDetailsGuid = JSON.parse(arguments[0]).guid;
              origSend.apply(this, arguments);
            };
          }
          this.addEventListener(
            "readystatechange",
            function () {
              if (this.readyState === 4 && this.status === 200) {
                try {
                  if (
                    this.responseText === "{}" ||
                    this.responseText.startsWith("<!DOCTYPE html>")
                  ) {
                    return;
                  }
                  let data;
                  switch (apiFunc) {
                    case "getPortalDetails":
                      const guid = getPortalDetailsGuid;
                      if (!seenGuids.has(guid)) {
                        seenGuids.add(guid);
                        data = JSON.parse(this.responseText);
                        if (data.result === undefined) {
                          return;
                        }
                        portals.push(new IPortal(guid, data.result));
                      }
                      break;
                    case "getEntities":
                      data = JSON.parse(this.responseText);
                      if (
                        data.result === undefined ||
                        data.result.map === undefined
                      ) {
                        return;
                      }

                      for (const tile in data.result.map) {
                        if (data.result.map.hasOwnProperty(tile)) {
                          if (
                            data.result.map[tile].gameEntities === undefined
                          ) {
                            continue;
                          }
                          data.result.map[tile].gameEntities.forEach(function (
                            ent
                          ) {
                            switch (
                              // Entity type
                              ent[2][0]
                            ) {
                              case "p": // Portal
                                const guid = ent[0];
                                if (!seenGuids.has(guid)) {
                                  seenGuids.clear();
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
                  checkIntelSend();
                } catch (e) {
                  console.error(
                    "[WFP]: Caught error in Intel XHR hook",
                    apiFunc,
                    e,
                    this.responseText
                  );
                }
              }
            },
            false
          );
        }
        open.apply(this, arguments);
      };
    })(XMLHttpRequest.prototype.open);
  } else {
    console.log("[WFP]: pages mismatch");
    console.log("[WFP]: " + window.location.href);
  }
})();
