// Show closable warning if domain is `dev.*`,
// With link to real site.
//
'use strict';

N.wire.once('navigate.done', function show_dev_warning() {
  // If warning already disabled - nothing to do.
  if (String(document.cookie).indexOf('dev_warning_off=1') !== -1) return;

  // Show warning only for localhost and domains with "dev." inside
  if (!/^dev[.]|[.]dev[.]|^localhost/.test(window.location.hostname)) return;

  $('body').prepend($(N.runtime.render(module.apiPath)));
  $('html').addClass('dev-warning-on');

  N.wire.on(module.apiPath + ':close', function hide_dev_warning() {
    $('html').removeClass('dev-warning-on');
    document.cookie = `dev_warning_off=1; path=/; max-age=${7 * 24 * 3600}`;
  });
});
