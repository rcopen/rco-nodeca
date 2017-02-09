// Add more url shorteners, remove extra arguments in query
// (referrals, google analytics, etc.)
//

'use strict';

const URL = require('url');


module.exports = function (N) {

  N.wire.on('init:embed', function extend_unshort(data) {
    [ 'normal', 'cached' ].forEach(type => {
      let instance = data.unshort[type];

      (N.config.unshort || []).forEach(c => {
        Object.keys(c).forEach(domain => {
          let domain_config = c[domain];

          instance.add(domain, domain_config);
        });
      });
    });
  });


  // TODO: move this to separate file
  N.wire.before('internal:common.embed', { priority: -5 }, function cleanup_query(data) {
    let original_url = data.canonical || data.url;

    let parsed = URL.parse(original_url, true, true);

    // force url.format to reconstruct query using parsed.query instead of parsed.search
    parsed.search = null;

    // filter querystring params
    if (parsed.hostname.match(/^\w+\.aliexpress\.com$/) && parsed.pathname.match(/^\/item\/[^\/]+\/\d+\.html$/)) {
      // remove all params from aliexpress pages
      parsed.query = {};
    } else {
      // remove google analytics params from all domains
      Object.keys(parsed.query).forEach(key => {
        if ([ 'utm_source', 'utm_medium', 'utm_term', 'utm_content', 'utm_id', 'utm_campaign' ].indexOf(key) !== -1) {
          delete parsed.query[key];
        }
      });
    }

    let url = URL.format(parsed);

    if (url !== original_url) {
      data.canonical = url;
    }
  });
};
