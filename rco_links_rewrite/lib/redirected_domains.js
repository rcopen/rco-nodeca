// Check if redirect should be used for links from a domain
//

'use strict';

const _ = require('lodash');


function get_domains_reg(list) {
  if (!list) return /(?!)/; // this will never match

  let domains = list.map(domain => {
    if (_.isRegExp(domain)) {
      return domain.source;
    }

    // check domain for exact match (e.g. `example.com`) and subdomains (`*.example.com`)
    return '(?:.+[.])?' + _.escapeRegExp(domain);
  });

  return new RegExp(`^(?:${domains.join('|')})$`, 'i');
}


// List of domains links to which are replaced with redirect;
// full html rebuild will be required when adding or removing any domain.
//
// Each entry can be either:
//  - a string (usually 2nd level domain, subdomains are added automatically)
//  - or regular expression (tested for exact match only, ^ and $ are added automatically)
//
module.exports.replace_list = [
  'aliexpress.com',
  'banggood.com',
  'gearbest.com'
];


// List of domains that can be redirected to by `common.redirect`,
// it's usually the list above plus old domains that were recently removed
// from that list (such links can still be found before rebuild)
//
module.exports.redirect_list = module.exports.replace_list;


// check if we should replace links to these domains in html to redirector
module.exports.replace_check = function replace_check(N, domain) {
  replace_check.reg = replace_check.reg || get_domains_reg(module.exports.replace_list);
  return replace_check.reg.test(domain);
};


// check if we can redirect this domain
module.exports.redirect_check = function redirect_check(N, domain) {
  redirect_check.reg = redirect_check.reg || get_domains_reg(module.exports.redirect_list);
  return redirect_check.reg.test(domain);
};
