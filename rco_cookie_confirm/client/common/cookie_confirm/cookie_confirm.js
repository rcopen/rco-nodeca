// Popup dialog asking user to agree about this website using cookies.
//
'use strict';


N.wire.once('navigate.done', function cookie_confirm() {
  if (String(document.cookie).indexOf('cookie_accepted=1') !== -1) return;

  $('body').append(N.runtime.render(module.apiPath));

  N.wire.on(module.apiPath + ':accept', function cookie_confirm_accept() {
    var pairs = [];

    pairs.push('cookie_accepted=1');
    pairs.push('path=/');
    pairs.push('max-age=' + 24 * 60 * 60 * 365 * 2); // 2 years

    if (location.protocol === 'https:') pairs.push('secure');

    document.cookie = pairs.join('; ');
  });
});
