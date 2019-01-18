// Contact form
//

'use strict';

const _  = require('lodash');

const CHECK_NICK_DELAY = 1000;


let view = null;


// View model for editable fields of the form
//
function Control() {
  const ko = require('knockout');

  this.error    = ko.observable(null);
  this.value    = ko.observable('');
}


N.wire.on('navigate.preload:' + module.apiPath, function load_deps(preload) {
  preload.push('vendor.knockout');
});


// Page enter
//
N.wire.on('navigate.done:' + module.apiPath, function page_setup() {
  const ko = require('knockout');

  // Root view model.
  view = {};

  view.nick = new Control();

  view.submitted = ko.observable(false);

  // Reset nick CSS class and message on every change.
  view.nick.value.subscribe(() => {
    view.nick.error(null);
  });

  // Setup automatic nick validation on input.
  view.nick.value.subscribe(_.debounce(text => {
    if (text.length < 1) return;

    N.io.rpc('users.auth.check_nick', { nick: text })
      .then(res => {
        view.nick.error(res.error ? res.message : null);
      });
  }, CHECK_NICK_DELAY));

  // Apply root view model.
  ko.applyBindings(view, $('#content')[0]);
});


// Setup listeners
//
N.wire.once('navigate.done:' + module.apiPath, function page_once() {

  // Page exit
  //
  N.wire.on('navigate.exit:' + module.apiPath, function page_exit() {
    const ko = require('knockout');

    ko.cleanNode($('#content')[0]);
    view = null;
  });


  // Form submit
  //
  N.wire.on(module.apiPath + ':submit', function register(form) {

    return N.io.rpc('rcd-nodeca.contacts.nick_change.exec', form.fields)
      .then(() => {
        view.submitted(true);
      })
      .catch(err => {
        // Non client error will be processed with default error handler
        if (err.code !== N.io.CLIENT_ERROR) throw err;

        // Update classes and messages on all input fields.
        _.forEach(view, (field, name) => {
          if (name === 'submitted') return;

          field.error(err.data[name]);
        });
      });
  });
});
