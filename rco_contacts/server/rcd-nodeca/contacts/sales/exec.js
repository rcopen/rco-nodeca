// Submit form handler
//

'use strict';

const _           = require('lodash');
const validator   = require('is-my-json-valid');
const email_regex = require('email-regex');
const encode      = require('emailjs-mime-codec').mimeWordEncode;
const recaptcha   = require('nodeca.core/lib/app/recaptcha');


module.exports = function (N, apiPath) {
  // required is set to false because all values are checked later,
  // with all errors put into env.data.errors to display to user
  N.validate(apiPath, {
    name:    { type: 'string', required: false },
    email:   { type: 'string', required: false },
    url:     { type: 'string', required: true },
    message: { type: 'string', required: true },
    'g-recaptcha-response': { type: 'string', required: false }
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
      name:    { type: 'string',  required: false, minLength: 1 },
      email:   { format: 'email', required: false, minLength: 1 },
      url:     { type: 'string',  required: true },
      message: { type: 'string',  required: true, minLength: 1 }
    }
  }, {
    verbose: true,
    formats: {
      email: email_regex({ exact: true })
    }
  });


  // Validate form data
  //
  N.wire.before(apiPath, function validate_params(env) {
    if (!validate(env.params)) {
      _.forEach(validate.errors, function (error) {
        // Don't customize form text, just highlight the field.
        env.data.errors[error.field.replace(/^data[.]/, '')] = true;
      });
    }
  });


  // Check recaptcha
  //
  N.wire.before(apiPath, async function validate_recaptcha(env) {
    if (!N.config.options.recaptcha) return;

    // Only require recaptcha for guests
    if (env.user_info.is_member) return;

    // Skip if some other fields are incorrect in order to not change
    // captcha words and not annoy the user by forcing him to retype.
    if (!_.isEmpty(env.data.errors)) return;

    let privateKey = N.config.options.recaptcha.private_key,
        clientIp   = env.req.ip,
        response   = env.params['g-recaptcha-response'];

    let valid = await recaptcha.verify(privateKey, clientIp, response);

    if (!valid) {
      env.data.errors.recaptcha_response_field = env.t('err_wrong_captcha');
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

    if (!emails) emails = _.get(N.config, 'rcd-nodeca.contacts.sales.email');
    if (!emails) emails = _.get(N.config, 'rcd-nodeca.contacts_default_email');
    if (!emails) emails = [];

    if (!Array.isArray(emails)) emails = [ emails ];

    let subject = env.t('email_subject', { project_name: general_project_name });

    let text, from_name, from_email;

    if (env.user_info.is_member) {
      text = env.t('email_text_member', {
        name:    env.user_info.user_name,
        profile: N.router.linkTo('users.member', { user_hid: env.user_info.user_hid }),
        url:     env.params.url,
        message: env.params.message
      });

      let user = await N.models.users.User.findById(env.user_info.user_id);

      from_name  = user.nick;
      from_email = user.email;

    } else {
      text = env.t('email_text_guest', {
        name:    env.params.name,
        email:   env.params.email,
        url:     env.params.url,
        message: env.params.message
      });

      from_name  = env.params.name;
      from_email = env.params.email;
    }

    let from = `"${encode(from_name)} @ ${encode(general_project_name)}" <${N.config.email.from}>`;

    for (let email of emails) {
      await N.mailer.send({
        from,
        to: email,
        subject,
        text,
        replyTo: from_email
      });
    }
  });
};
