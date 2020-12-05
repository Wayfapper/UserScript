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
   * @returns {string} The stored token.
   */
  async function getToken(a) {
    const token = await GM.getValue("wayfapper-token", -1);
    return token;
  }

  // define basic parameter that are used everywhere
  const WEBHOOK_URL = "https://wfp.cr4.me/api/v5/webhook.php";
  const WEBHOOK_TOKEN = await getToken();
  if (window.location.href.indexOf("wfp.cr4.me") > -1) {
    console.log("[WFP]: Wayfapper recognized");
    // TODO add stuff here, later
  } else if (window.location.href.indexOf(".ingress.com/intel") > -1) {
    console.log("[WFP]: Ingress Intel-Map recognized");
    // TODO restore intel functions here
  } else if (window.location.href.indexOf("wayfarer.nianticlabs.com") > -1) {
    console.log('[WFP]: Wayfarer recognized');
    // TODO restore wayfarer functions here

  } else {
    console.log("[WFP]: pages mismatch");
    console.log("[WFP]: " + window.location.href);
  }
})();
