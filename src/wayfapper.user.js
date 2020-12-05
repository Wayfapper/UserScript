// ==UserScript==
// @id				wayfapper
// @name			Wayfapper
// @category		Misc
// @version			0.1.0
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

(async function () {
  "use strict";
  /**
   * Overall script parts are placed here
   */
  console.log("[WFP]: init");

  /**
   * Recieve the stored token, async function needed due to GM_get/set
   * @param {int} a unused param.
   * @return {string} The stored token.
   */
  async function getToken(a) {
    const token = await GM.getValue("wayfapper-token", -1);
    return token;
  }

  // define basic parameter that are used everywhere
  const WEBHOOK_URL = "https://wfp.cr4.me/api/v5/webhook.php";
  const WEBHOOK_TOKEN = await getToken();

  /**
   * Add some stylerules to wayfarer
   */
  function addWayfarerCss() {
    const css = `
      a.glyphicon.glyphicon-share {
        margin-right: 13px;
      }
      a.sidebar__item.sidebar-wayfapper {
        padding-left: 15px;
      }
      a.sidebar__item.sidebar-wayfapper:hover {
        padding-left: 10px;
      }
      span.fapper {
        font-family: Akkurat,Roboto,sans-serif;
      }
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
    const badgeNode = document.createElement("span");
    badgeNode.innerHTML = "&nbsp;";
    badgeNode.id = "bage_hover";
    badgeNode.className = "badge";
    const badge = document.querySelector(".sidebar__item--settings span")
      .parentNode;
    badge.insertBefore(badgeNode, badge.childNodes[0]);
  }

  if (window.location.href.indexOf("wfp.cr4.me") > -1) {
    console.log("[WFP]: Wayfapper recognized");
    console.log("[WFP]: API: " + WEBHOOK_URL);
    console.log("[WFP]: Token: " + WEBHOOK_TOKEN);
    // TODO add stuff here, later
  } else if (window.location.href.indexOf(".ingress.com/intel") > -1) {
    console.log("[WFP]: Ingress Intel-Map recognized");
    // TODO restore intel functions here
  } else if (window.location.href.indexOf("wayfarer.nianticlabs.com") > -1) {
    console.log("[WFP]: Wayfarer recognized");
    addWayfarerCss();
    addWayfarerVisibles();
    // TODO restore wayfarer functions here
    if (typeof settings !== "undefined" && settings["useMods"]) {
      const stats = document.querySelector("body.is-authenticated");
      if (stats !== null) {
        const rx = /https:\/\/wayfarer.nianticlabs.com\/(\w+)/;
        const page = rx.exec(document.location.href);
        if (null !== page) {
          switch (page[1]) {
            case "review":
              console.log("[WFP]: reviews");
              break;
            case "profile":
              console.log("[WFP]: profile");
              break;
            case "nominations":
              console.log("[WFP]: nominations");
              break;
            case "settings":
              console.log("[WFP]: settings");
              break;
            default:
              console.log("[WFP] unknown URL: " + page[1]);
              break;
          }
        } else {
          // check if gm-storage is filled, else check for old data can be used
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
    } else {
      document.querySelectorAll(
        ".sidebar__item--settings"
      )[0].style.background = "rgba(220, 20, 60, 0.1)";
    }
  } else {
    console.log("[WFP]: pages mismatch");
    console.log("[WFP]: " + window.location.href);
  }
})();
