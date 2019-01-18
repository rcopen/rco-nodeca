
'use strict';


module.exports = function (N, apiPath) {

  // Add first_name/last_name to search form
  //
  N.wire.after(apiPath, { priority: 5 }, function create_search_form(env) {
    let search_params = env.data.search_params;

    env.res.fields = env.res.fields || [];

    env.res.fields.push({
      name:     'first_name',
      value:    search_params.first_name,
      priority: 60
    });

    env.res.fields.push({
      name:     'last_name',
      value:    search_params.last_name,
      priority: 70
    });
  });
};
