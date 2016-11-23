
'use strict';


const validate = require('is-my-json-valid')({
  properties: {
    first_name: { type: [ 'string', 'null' ] },
    last_name:  { type: [ 'string', 'null' ] }
  },
  additionalProperties: true
});


module.exports = function (N, apiPath) {

  N.wire.before(apiPath, { priority: -20 }, function update_user(env) {
    if (!validate(env.params)) throw N.io.BAD_REQUEST;

    env.data.user.about = env.data.user.about || {};
    env.data.errors     = env.data.errors || {};
    env.res.fields      = env.res.fields  || {};

    if (!env.data.user.first_name && !env.data.user.last_name) {
      // if name is already set, can't change it

      if (env.params.first_name || env.params.last_name) {
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
    }

    // make sure birthday cannot be changed once set
    if (env.data.user.about.birthday) {
      if (typeof env.params.birthday !== 'undefined') {
        env.params.birthday = env.data.user.about.birthday.toISOString().slice(0, 10);
      }
    }

    // check that age is between 8 and 90 (this is more strong restriction
    // in addition to checks in nodeca.users)
    if (!env.data.user.about.birthday && env.params.birthday) {
      let birthday = new Date(env.params.birthday);

      if (!isNaN(birthday)) {
        let now = new Date();
        let age = now.getFullYear() - birthday.getFullYear();

        if (now.getMonth() < birthday.getMonth()) age--;
        if (now.getMonth() === birthday.getMonth() && now.getDate() < birthday.getDate()) age--;

        if (age < 8 || age > 90) env.data.errors.birthday = true;
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


  // Profile update for `incomplete_profile` usergroup triggers group upgrade
  //
  N.wire.after(apiPath, { priority: 30 }, function* group_upgrade(env) {
    yield N.wire.emit('internal:users.group_upgrade', { user_id: env.data.user._id });
  });
};
