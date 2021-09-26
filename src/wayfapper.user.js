// ==UserScript==
// @id              wayfapper
// @name            Wayfapper
// @category        Misc
// @version         0.2.7
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
// @include         https://intel.ingress.com/*
// @match           https://wfp.cr4.me/
// @match           https://wayfarer.nianticlabs.com/*
// @match           https://www.ingress.com/intel*
// @match           https://ingress.com/intel*
// @match           https://intel.ingress.com/intel*
// @match           https://intel.ingress.com/*
// @icon            https://wfp.cr4.me/images/wayfapper_icon.svg
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
  const WEBHOOK_URL = "https://wfp.cr4.me/api/v7/webhook.php";
  const WEBHOOK_TOKEN = await getToken();

  /**
   * Stop this script for a defined time
   * @param {init} milliseconds time to wait
   * @return {object} Promise if time has passed
   *\/
  function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }*/

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
   * A simple hash-function, with no security or privacy in mind
   * @param {string} str the input that has to be hashed
   * @param {integer} seed provide alternate stream with same input
   * @return {string} returne 53-bit hash of input
   * https://stackoverflow.com/a/52171480/13279341
   */
  function cyrb53(str, seed = 0) {
    const date = new Date();
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 =
      Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
      Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
      Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
      Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (
      date.getFullYear().toString() +
      date.getMonth().toString() +
      date.getDate().toString() +
      (h2 >>> 0).toString(16).padStart(8, 0) +
      (h1 >>> 0).toString(16).padStart(8, 0)
    );
  }

  /**
   * Add some stylerules to wayfarer
   */
  function addWayfarerCss() {
    const css = `
      .badge {
        position: absolute;
        padding: 5px 10px !important;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
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
    if (document.getElementById("bage_hover") || false) {
      return;
    }
    const checkElement =
      document.querySelector("a[href='/new/settings']") || false;
    if (checkElement) {
      const badgeNode = document.createElement("span");
      badgeNode.innerHTML = "&nbsp;&nbsp;";
      badgeNode.id = "bage_hover";
      badgeNode.className = "badge";
      const badge = document.querySelector("a[href='/new/settings']");
      badge.insertBefore(badgeNode, badge.childNodes[1]);
    } else {
      window.setTimeout(addWayfarerVisibles, 100);
    }
  }

  /**
   * Change wayfarer sidebare items color as feedback
   * @param {string} sidebarItem the item for the feedback
   * @param {string} color the indication color, default red
   */
  function setWayfarerFeedback(sidebarItem = "s", color = "red") {
    let sRed = 0;
    let sGreen = 0;
    let sBlue = 0;
    let count = 0;
    const setItem = document.querySelector("#bage_hover");
    switch (color) {
      case "green":
        sGreen = 255;
        break;
      case "yellow":
        sRed = 255;
        sGreen = 255;
        break;
      case "red":
      default:
        sRed = 255;
        break;
    }
    const cond = document.getElementById("bage_hover") || false;
    if (cond) {
      const interval = setInterval(function () {
        if (count > 254) {
          clearInterval(interval);
          return;
        }
        if (sRed - 1 < 0) {
          sRed = 0;
        } else {
          sRed = sRed - 1;
        }
        if (sGreen - 1 < 0) {
          sGreen = 0;
        } else {
          sGreen = sGreen - 1;
        }
        if (sBlue - 1 < 0) {
          sBlue = 0;
        } else {
          sBlue = sBlue - 1;
        }
        setItem.style.backgroundColor =
          "rgba(" + sRed + ", " + sGreen + ", " + sBlue + ", 0.5)";
        count++;
      }, 10);
    } else {
      window.setTimeout(setWayfarerFeedback, 100, sidebarItem, color);
    }
  }

  /**
   * Check, if we should allow another trasmission to wayfapper
   * We only submit once a day if data isn't changed
   * @param {string} page where the trasmissions came from for the check
   * @param {string} hash cyrb53-hash of the data
   * @return {boolean} true if date or data is changed
   */
  function checkWayfarerDataChanged(page, hash) {
    let storedHash = "";
    if (localStorage["[WFP]_" + page]) {
      storedHash = localStorage["[WFP]_" + page];
    }
    if (storedHash != hash) {
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
    const hash = cyrb53(JSON.stringify(data));
    if (checkWayfarerDataChanged(page, hash)) {
      fetch(WEBHOOK_URL + "?&p=" + page + "&t=" + WEBHOOK_TOKEN, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(function (response) {
        console.log(hash);
        if (response.status == 222) {
          localStorage["[WFP]_" + page] = hash;
          setWayfarerFeedback(page, "green");
        } else {
          setWayfarerFeedback(page, "red");
        }
        console.log("[WFP]: " + response.status);
        return response.text().then(function (text) {
          console.log("[WFP]: " + text);
        });
      });
    } else {
      setWayfarerFeedback(page, "yellow");
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
    const h3WfrSetting = document.createElement("h2");
    h3WfrSetting.innerHTML = "Wayfapper";
    h3WfrSetting.className = "wf-page-header__title ng-star-inserted";

    const divWfrSetting = document.createElement("div");
    divWfrSetting.className = "settings-content";
    divWfrSetting.innerHTML =
      '<div class="max-w-md ng-star-inserted">' +
      '<div class="settings__item settings-item">' +
      '<div class="settings-item__header">' +
      "<div>Wayfapper-Token</div>" +
      "<div>" +
      '<app-edit-setting-button _nghost-soo-c173="" id="wfp_token_pop">' +
      '<button _ngcontent-soo-c173="" wf-button="" wftype="icon" class="wf-button ' +
      'wf-button--icon">' +
      '<mat-icon _ngcontent-soo-c173="" role="img" class="mat-icon notranslate ' +
      'material-icons mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font">' +
      "edit</mat-icon>" +
      "</button>" +
      "</app-edit-setting-button>" +
      "</div>" +
      "</div>" +
      '<div class="settings-item__value">' +
      dispToken +
      "</div>" +
      '<div class="settings-item__description">' +
      "Dein persönlicher Token, der dich gegenüber dem Wayfapper-Projekt ausweist" +
      "</div>" +
      "</div>" +
      "</div>";

    const h3Wfr = document.querySelector("wf-page-header").parentNode;
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
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
      this.addEventListener("load", async function () {
        if (
          this.responseURL ==
          "https://wayfarer.nianticlabs.com/api/v1/vault/manage"
        ) {
          const nominations = JSON.parse(this.responseText).result;
          // console.log(data);
          sendDataToWayfapper(nominations, "n");
        }
        if (
          this.responseURL ==
          "https://wayfarer.nianticlabs.com/api/v1/vault/profile"
        ) {
          const profile = JSON.parse(this.responseText).result;
          // console.log(data);
          sendDataToWayfapper(profile, "p");
        }
        if (
          this.responseURL ==
          "https://wayfarer.nianticlabs.com/api/v1/vault/settings"
        ) {
          window.setTimeout(addWayfarerSetting, 1000);
        }
      });
      origOpen.apply(this, arguments);
    };
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
    addWayfarerCss();
    addWayfarerVisibles();
    window.setTimeout(wayfarerMainFunction, 10);
  } else if (window.location.href.indexOf(".ingress.com/") > -1) {
    console.log("[WFP]: Ingress Intel-Map recognized");

    const seenGuids = new Set();
    let portals = [];
    let inFlight = false;
    let timerStarted = false;
    const ingressMethodRegex =
      /^(?:(?:https?:)?\/\/(?:www\.|intel\.)?ingress\.com)?\/r\/(getPortalDetails|getEntities)$/i;

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
                        sendIntelPortalData(
                          JSON.stringify(new IPortal(guid, data.result))
                        );
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
