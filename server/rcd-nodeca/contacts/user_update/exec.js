// Submit form handler
//

'use strict';

const _         = require('lodash');
const validator = require('is-my-json-valid');


module.exports = function (N, apiPath) {
  N.validate(apiPath, {
    firstname:  { type: 'string', required: true },
    lastname:   { type: 'string', required: true },
    birthday:   { type: 'string', required: true }
  });


  // Check auth
  //
  N.wire.before(apiPath, function check_user_auth(env) {
    if (!env.user_info.is_member) throw N.io.FORBIDDEN;
  });


  // Create sandbox for form errors
  //
  N.wire.before(apiPath, function prepare_env_data(env) {
    env.data.errors = env.data.errors || {};
  });


  // Form input validator
  //
  const validate = validator({
    type: 'object',
    properties: {
      firstname:  { type: 'string', required: true },
      lastname:   { type: 'string', required: true },
      birthday:   { type: 'string', required: true }
    }
  }, {
    verbose: true
  });


  // Validate form data
  //
  N.wire.before(apiPath, function validate_params(env) {
    if (!validate(env.params)) {
      _.forEach(validate.errors, function (error) {
        // Don't customize form text, just highlight the field.
        env.data.errors[error.field.replace(/^data[.]/, '')] = null;
      });
    }
  });


  // If any of the previous checks failed, terminate with client error
  //
  N.wire.before(apiPath, function check_errors(env) {
    if (!_.isEmpty(env.data.errors)) {
      throw { code: N.io.CLIENT_ERROR, data: env.data.errors };
    }
  });


  // Send email to administration
  //
  N.wire.on(apiPath, async function send_email(env) {
    let general_project_name = await N.settings.get('general_project_name');
    let emails;

    if (!emails) emails = _.get(N.config, 'rcd-nodeca.contacts.user_update.email');
    if (!emails) emails = _.get(N.config, 'rcd-nodeca.contacts_default_email');
    if (!emails) emails = [];

    if (!Array.isArray(emails)) emails = [ emails ];

    let subject = env.t('email_subject', {
      project_name: general_project_name,
      username: env.user_info.user_name
    });

    let text = env.t('email_text', {
      name:       env.user_info.user_name,
      profile:    N.router.linkTo('users.member', { user_hid: env.user_info.user_hid }),
      firstname:  env.params.firstname,
      lastname:   env.params.lastname,
      birthday:   env.params.birthday,
      link:       N.router.linkTo('admin.rcd-nodeca.update_by_link', {
        user_hid: env.user_info.user_hid,
        $query: {
          first_name:  env.params.firstname,
          last_name:   env.params.lastname,
          birthday:    env.params.birthday
        }
      })
    });

    let from_name  = env.user_info.user_name;
    let from_email = (await N.models.users.User.findById(env.user_info.user_id)).email;

    let replyTo = `"${from_name}" <${from_email}>`;

    for (let email of emails) {
      await N.mailer.send({
        to: email,
        subject,
        text,
        replyTo
      });
    }
  });
};
