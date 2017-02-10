// Cleanup garbage from link query params
// (referrals, google analytics, etc.)
//
'use strict';


const URL = require('url');


// Delete object keys if exist in blacklist
// Return `true` if object was changed
function cleanup_query(query, blacklist) {
  let modified = false;

  Object.keys(query).forEach(key => {
    if (blacklist.includes(key)) {
      delete query[key];
      modified = true;
    }
  });

  return modified;
}


module.exports = function (N) {

  N.wire.before('internal:common.embed', { priority: -5 }, function link_query_cleanup(data) {
    let original_url = data.canonical || data.url;
    let parsed       = URL.parse(original_url, true, true);

    // Set true if URL should be changed
    let rewrite = false;

    // force url.format to reconstruct query using parsed.query instead of parsed.search
    parsed.search = null;

    // Do nothing if query and hash are empty
    if (!Object.keys(parsed.query).length && !parsed.hash) return;

    //
    // Cleanup GA utm_* params for all domains
    // https://en.wikipedia.org/wiki/UTM_parameters
    //

    rewrite = cleanup_query(parsed.query, [
      'utm_source',
      'utm_medium',
      'utm_term',
      'utm_content',
      'utm_id',
      'utm_campaign'
    ]) || rewrite;

    //
    // Cleanup some email marketing garbage
    //
    //

    if (parsed.query.sc_src && parsed.query.sc_uid && parsed.query.sc_eh) {
      rewrite = cleanup_query(parsed.query, [
        'sc_src',
        'sc_eh',
        'sc_llid',
        'sc_lid',
        'sc_customer',
        'sc_uid'
      ]) || rewrite;
    }


    //
    // *.aliexpress.com
    //

    if (/^\w+\.aliexpress\.com$/.test(parsed.hostname)) {
      if (/^\/item\/[^\/]+\/\d+\.html$/.test(parsed.pathname) ||
          /^\/store\/product\/[^\/]+\/\d+\.html$/.test(parsed.pathname)) {
        // if we are on product page - drop everything
        parsed.query = {};
        rewrite = true;
      } else {
        // for other pages - try to clear as much as possible
        rewrite = cleanup_query(parsed.query, [
          // s.aliexpress.com
          'shortkey',
          'addresstype',
          // A/B split testing
          'ws_ab_test',
          // internal tracking garbage
          'scm',
          'spm',
          'pvid',
          'tpp',
          'btsid',
          'initiative_id',
          'sdom',
          // affiliate program (100%)
          'af',
          'cn',
          'cv',
          'dp',
          // Unknown affiliates
          'aff_platform',
          'sk',
          'cpt',
          'afref',
          'aff_trace_key'
        ]) || rewrite;
      }
    }


    //
    // www.banggood.com & m.banggood.com
    //

    if (/^(\w+\.)?banggood\.com$/.test(parsed.hostname)) {
      rewrite = cleanup_query(parsed.query, [
        // own affiliate program
        'p',
        // epn
        'pr',
        'click_id',
        // banggood.app.link
        'android_share',
        '_branch_match_id',
        // garbage
        'rmmds',
        // from banggood emails only
        'emst'
      ]) || rewrite;
    }


    //
    // www.gearbest.com
    //

    if (/^(\w+\.)?gearbest\.com$/.test(parsed.hostname)) {
      rewrite = cleanup_query(parsed.query, [
        // epn
        'offer_type',
        'af_id',
        'pl_id',
        'pl_type',
        'click_id',
        // ???
        'admitad_uid'
      ]) || rewrite;
    }

    //
    // www.dx.com
    //
    if (/^(\w+\.)?dx\.com$/.test(parsed.hostname)) {
      if (parsed.hash) {
        parsed.hash = null;
        rewrite = true;
      }
    }

    //
    // Build new URL if needed
    //

    if (!rewrite) return;

    data.canonical = URL.format(parsed);
  });

};
