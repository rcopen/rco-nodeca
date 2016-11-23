
'use strict';


module.exports = function (N, apiPath) {

  N.wire.after(apiPath, { priority: 5 }, function add_fields(env) {

    if (!env.data.user.first_name && !env.data.user.last_name) {
      env.res.about.push({
        name:      'first_name',
        value:     env.data.user.first_name,
        mandatory: true,
        priority:  4
      });

      env.res.about.push({
        name:      'last_name',
        value:     env.data.user.last_name,
        mandatory: true,
        priority:  5
      });
    }

    env.res.about = env.res.about.filter(field => {
      if (field.name === 'birthday') {
        // hide birthday field if set
        if (field.value) return false;

        field.mandatory = true;

        return true;
      } else if (field.name === 'location') {

        field.mandatory = true;

        return true;
      }

      return true;
    });
  });
};
