// Show contacts form
//

'use strict';


module.exports = function (N, apiPath) {
  N.validate(apiPath, {});


  // Redirect guests to login page
  //
  N.wire.before(apiPath, function check_user_auth(env) {
    return N.wire.emit('internal:users.force_login_guest', env);
  });


  // Fill page meta
  //
  N.wire.on(apiPath, function fill_page_head(env) {
    env.res.head.title = env.t('title');
  });


  // Fill breadcrumbs
  //
  N.wire.after(apiPath, function fill_breadcrumbs(env) {
    env.data.breadcrumbs = env.data.breadcrumbs || [];

    env.data.breadcrumbs.push({
      text:  env.t('@rcd-nodeca.contacts.title'),
      route: 'rcd-nodeca.contacts'
    });

    /*env.data.breadcrumbs.push({
      text:  env.t('title')
    });*/

    env.res.breadcrumbs = env.data.breadcrumbs;
  });
};
