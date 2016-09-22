
'use strict';


const validate = require('is-my-json-valid')({
  properties: {
    first_name: { type: 'string' },
    last_name:  { type: 'string' }
  },
  additionalProperties: true
});


module.exports = function (N, apiPath) {

  N.wire.before(apiPath, { priority: -20 }, function update_user(env) {
    if (!validate(env.params)) throw N.io.BAD_REQUEST;

    env.data.user.about = env.data.user.about || {};
    env.data.errors     = env.data.errors || {};
    env.res.fields      = env.res.fields  || {};

    if (env.data.user.first_name || env.data.user.last_name) {
      // if name is already set, can't change it
      if (env.data.user.first_name !== env.params.first_name ||
          env.data.user.last_name  !== env.params.last_name) {

        env.data.errors.first_name = true;
        env.data.errors.last_name  = true;
      }
    } else if (env.params.first_name || env.params.last_name) {
      // if user is trying to set a name, make sure both parts are non-empty
      if (!env.params.first_name) env.data.errors.first_name = true;
      if (!env.params.last_name)  env.data.errors.last_name  = true;

      if (env.data.user.first_name !== env.params.first_name) {
        env.data.user.first_name = env.params.first_name;
      }

      if (env.data.user.last_name !== env.params.last_name) {
        env.data.user.last_name  = env.params.last_name;
      }
    }

    // make sure birthday cannot be changed once set
    if (env.data.user.about.birthday) {
      if (env.data.user.about.birthday.toISOString().slice(0, 10) !== env.params.birthday) {
        env.data.errors.birthday = true;
      }
    }
  });


  // Model implements firstname/lastname normalization on save,
  // so we need to fetch normalized values after that happens
  //
  N.wire.after(apiPath, { priority: 20 }, function fill_normalized_values(env) {
    let is_name_set = !!(env.data.user.first_name || env.data.user.last_name);

    env.res.fields.first_name = { value: env.data.user.first_name, readonly: is_name_set };
    env.res.fields.last_name  = { value: env.data.user.last_name, readonly: is_name_set };

    if (env.res.fields.birthday) {
      env.res.fields.birthday.readonly = !!env.res.fields.birthday.value;
    }
  });
};
