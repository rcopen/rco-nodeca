// Add link to rules to the registration form
//

'use strict';


N.wire.after('navigate.done:users.auth.register.show', function inject_rules() {
  $('form[data-on-submit="users.auth.register.exec"] button[type=submit]')
      .before(N.runtime.render('users.auth.register.show_rules_notice'));
});
