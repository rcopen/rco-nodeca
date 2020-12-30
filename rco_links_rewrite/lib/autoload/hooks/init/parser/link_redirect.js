// Replace external links to whitelisted domains with a link to redirector
//

'use strict';


const URL = require('url');
const $ = require('nodeca.core/lib/parser/cheequery');
const domains = require('rco-nodeca/rco_links_rewrite/lib/redirected_domains');


module.exports = function (N) {

  function link_redirect_plugin(parser) {
    parser.bus.after([ 'ast2html', 'ast2preview' ], { priority: 20 }, function rewrite_to_redirector(data) {
      // using parser plugin for this instead of common.embed hook in order to keep
      // original text or beautified url as is
      data.ast.find('.link-ext').each(function () {
        let $this = $(this);
        let url = $this.attr('href');

        let { host, protocol } = URL.parse(url, false, true);

        // don't redirect to mailto:, skype: and such
        if (protocol && protocol !== 'http:' && protocol !== 'https:') return;

        // only use redirector for specified domains
        if (!host || !domains.replace_check(N, host)) return N.io.BAD_REQUEST;

        if (!$this.data('nd-orig')) {
          $this.data('nd-orig', url);
        }

        $(this).attr('href', N.router.linkTo('common.redirect', {
          $query: { to: url }
        }));
      });
    });
  }


  N.wire.once('init:parser', function link_redirect_plugin_init() {
    N.parser.addPlugin(
      'link:redirect',
      link_redirect_plugin
    );
  });
};
