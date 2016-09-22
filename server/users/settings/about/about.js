
'use strict';


module.exports = function (N, apiPath) {

  N.wire.after(apiPath, { priority: 5 }, function add_fields(env) {

    let is_name_set = !!(env.data.user.first_name || env.data.user.last_name);

    env.res.about.push({
      name:     'first_name',
      value:    env.data.user.first_name,
      readonly: is_name_set,
      priority: 4
    });

    env.res.about.push({
      name:     'last_name',
      value:    env.data.user.last_name,
      readonly: is_name_set,
      priority: 5
    });

    // make birthday read-only if set
    env.res.about.forEach(field => {
      if (field.name === 'birthday') {
        field.readonly = !!field.value;
      }
    });
  });
};
