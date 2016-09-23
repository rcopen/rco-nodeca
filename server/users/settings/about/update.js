
'use strict';


const validate = require('is-my-json-valid')({
  properties: {
    first_name: { type: 'string' },
    last_name:  { type: 'string' }
  },
  additionalProperties: true
});


// Check first and lastnames, if returns true - check failed
function check_name(string) {
  return (string.length < 3 && !/^(ян|ли|ан|ус)$/i.test(string)) ||
         // Check ".", ",", "*" and digits
         /[\*\d\.,]/.test(string) ||
         // Check for two "-" in a row
         /--/.test(string) ||
         // Check for 3 identical symbols in a row
         /(.)\1{2}/.test(string);
}


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


  // Move users whose names don't fit our predefined patterns to
  // a separate group.
  //
  N.wire.before(apiPath, function* cheburate(env) {
    let first_name = env.data.user.first_name;
    let last_name  = env.data.user.last_name;
    let birthday   = env.data.user.about.birthday;
    let valid      = true;

    if (first_name || last_name) {
      // Check if first and last names are the same
      if (first_name === last_name) valid = false;

      // Check firstname
      if (check_name(first_name)) valid = false;

      // Check lastname
      // Like first name, but no spaces allowed
      if (check_name(last_name) || / /.test(last_name)) valid = false;
    }

    if (birthday) {
      let now = new Date();
      let age = now.getFullYear() - birthday.getFullYear();

      if (now.getMonth() < birthday.getMonth()) age--;
      if (now.getMonth() === birthday.getMonth() && now.getDate() < birthday.getDate()) age--;

      if (age < 8 || age > 80) valid = false;
    }

    if (!valid) {
      let group_id = yield N.models.users.UserGroup.findIdByName('che');

      env.data.user.usergroups = [ group_id ];
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
