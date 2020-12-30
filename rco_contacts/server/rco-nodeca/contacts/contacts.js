// List of available contact forms
//

'use strict';


module.exports = function (N, apiPath) {

  N.validate(apiPath, {});

  N.wire.on(apiPath, function show_contact_form_list(env) {
    env.res.head.title = env.t('title');
  });


  // Fill breadcrumbs
  //
  N.wire.after(apiPath, function fill_breadcrumbs(env) {
    env.data.breadcrumbs = env.data.breadcrumbs || [];

    env.data.breadcrumbs.push({
      text:  env.t('@rco-nodeca.contacts.title'),
      route: 'rco-nodeca.contacts'
    });

    env.res.breadcrumbs = env.data.breadcrumbs;
  });
};
