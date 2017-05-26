// Contact form
//

'use strict';

const _  = require('lodash');

let view = null;
let picker = null;


// View model for editable fields of the form
//
function Control() {
  const ko = require('knockout');

  this.hasError = ko.observable(false);
  this.message  = ko.observable(null);
  this.value    = ko.observable('');
}


N.wire.on('navigate.preload:' + module.apiPath, function load_deps(preload) {
  preload.push('vendor.pikaday');
  preload.push('vendor.knockout');
});


// Page enter
//
N.wire.on('navigate.done:' + module.apiPath, function page_setup() {
  const ko = require('knockout');

  // Root view model.
  view = {};

  view.firstname = new Control();
  view.lastname  = new Control();
  view.birthday  = new Control();

  view.recaptcha_response_field = {
    visible:  Boolean(N.runtime.recaptcha),
    hasError: ko.observable(false),
    message:  ko.observable(null)
  };

  view.submitted = ko.observable(false);

  // Apply root view model.
  ko.applyBindings(view, $('#content')[0]);

  // Init ReCaptcha.
  N.wire.emit('common.blocks.recaptcha.create');
});


N.wire.on('navigate.done:' + module.apiPath, function initialize_datepicker() {
  const Pikaday = require('pikaday');

  let container = $('#contact-form-birthday');

  if (!container.length) return;

  let cldr          = N.runtime.t('l10n.cldr').dates.calendars.gregorian;
  let months        = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ].map(key =>
                        cldr.months['stand-alone'].wide[key]);
  let weekdays      = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ].map(key =>
                        cldr.days['stand-alone'].wide[key]);
  let weekdaysShort = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ].map(key =>
                        cldr.days['stand-alone'].abbreviated[key]);

  picker = new Pikaday({
    field:     container[0],
    yearRange: [ 1900, new Date().getFullYear() ],
    i18n:      { months, weekdays, weekdaysShort },
    onSelect:  date => {
      // pikaday returns date in local TZ, but toISOString returns date in UTC,
      // so we need to cancel out timezone offset
      date = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      container.find('input').val(date.toISOString().slice(0, 10));
      container.find('input').trigger('change');
    }
  });
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


  N.wire.on('navigate.exit:users.settings.about', function teardown_datepicker() {
    if (picker) {
      picker.destroy();
      picker = null;
    }
  });


  // Form submit
  //
  N.wire.on(module.apiPath + ':submit', function register(form) {

    return N.io.rpc('rcd-nodeca.contacts.user_update.exec', form.fields)
      .then(() => {
        view.submitted(true);
      })
      .catch(err => {
        // Non client error will be processed with default error handler
        if (err.code !== N.io.CLIENT_ERROR) throw err;

        // Update classes and messages on all input fields.
        _.forEach(view, (field, name) => {
          if (name === 'submitted') return;

          field.hasError(_.has(err.data, name));
          field.message(err.data[name]);
        });

        // Update ReCaptcha if there is a ReCaptcha error.
        if (_.has(err.data, 'recaptcha_response_field')) {
          N.wire.emit('common.blocks.recaptcha.update');
        }
      });
  });
});
