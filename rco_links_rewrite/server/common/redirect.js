// Redirect user to an external link
//
'use strict';

const URL = require('url');
const domains = require('rcd-nodeca/rco_links_rewrite/lib/redirected_domains');


module.exports = function (N, apiPath) {

  N.validate(apiPath, {
    $query: {
      type: 'object',
      required: true,
      properties: {
        to: { type: 'string', required: true }
      },
      // prevent other arguments from appearing, this may stop oauth code leak via referer:
      // https://blog.detectify.com/2019/05/16/the-real-impact-of-an-open-redirect/
      additionalProperties: false
    }
  });


  // Validate link we're redirecting to
  //
  N.wire.before(apiPath, { priority: -20 }, function redirect(env) {
    env.data.url = env.params.$query.to;
    env.data.parsed_url = URL.parse(env.data.url, false, true);

    let { host, protocol } = env.data.parsed_url;

    // only allow http[s] redirects, prevent redirects to javascript:alert(1) and such;
    // https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html
    if (protocol && protocol !== 'http:' && protocol !== 'https:') return N.io.BAD_REQUEST;

    // only use redirector for specified domains
    if (!host || !domains.redirect_check(N, host)) return N.io.BAD_REQUEST;
  });


  // Hot-fix the link
  //
  //N.wire.before(apiPath, function hotfix_example(env) {
  //  env.data.parsed_url.hash = 'example';
  //  env.data.url = URL.format(env.data.parsed_url);
  //});


  // Perform actual redirect
  //
  N.wire.on(apiPath, function redirect(env) {
    return {
      code: N.io.REDIRECT,
      head: {
        Location: encodeURI(env.data.url)
      }
    };
  });


  // disallow redirect page from being indexed,
  // see https://webmasters.googleblog.com/2009/01/open-redirect-urls-is-your-site-being.html
  N.wire.after('server:common.robots', function robots_disallow_redirect(env) {
    env.body += 'Disallow: ' + N.router.linkTo('common.redirect') + '\n';
  });
};
