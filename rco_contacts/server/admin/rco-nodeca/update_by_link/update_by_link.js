// Change userdata
//

'use strict';

const _ = require('lodash');

// Convert date object to YYYY-MM-DD
//
function date_to_string(date) {
  if (!date) return '';

  try {
    return date.toISOString().split('T')[0];
  } catch (e) {
    // new Date('xxx') -> Invalid Date
    return date.toString();
  }
}


module.exports = function (N, apiPath) {
  N.validate(apiPath, {
    user_hid: { type: 'integer', minimum: 1, required: true },
    $query: {
      type: 'object',
      required: false,
      properties: {
        first_name: { type: 'string' },
        last_name:  { type: 'string' },
        birthday:   { type: 'string' }
      }
    }
  });


  // Fetch member by 'user_hid'
  //
  N.wire.before(apiPath, function fetch_user_by_hid(env) {
    return N.wire.emit('internal:users.fetch_user_by_hid', env);
  });


  // Fill user
  //
  N.wire.on(apiPath, async function fill_user(env) {
    env.res.head = env.res.head || {};
    env.res.head.title = env.t('title');

    env.res.user = _.pick(env.data.user, [ '_id', 'hid', 'name', 'exists' ]);

    env.res.changes = [];

    for (let field of [ 'first_name', 'last_name' ]) {
      let old_value = (env.data.user[field] || '').trim();
      let new_value = _.get(env.params, '$query.' + field, '').trim();

      if (new_value && old_value !== new_value) {
        env.res.changes.push({
          name: field,
          old_value,
          new_value
        });
      }
    }

    if (_.get(env.params, '$query.birthday', '').trim()) {
      let old_value = _.get(env.data.user, 'about.birthday');
      let new_value = new Date(_.get(env.params, '$query.birthday', '').trim());

      if (new_value && Number(old_value) !== Number(new_value)) {
        env.res.changes.push({
          name: 'birthday',
          old_value: date_to_string(old_value),
          new_value: date_to_string(new_value)
        });
      }
    }


    // fill moderator's notes count
    env.res.mod_notes_count = await N.models.users.ModeratorNote.find()
                                        .where('to').equals(env.data.user._id)
                                        .countDocuments();

    // fill usergroups
    env.res.usergroups = await N.models.users.UserGroup.find()
                                   .where('_id').in(env.data.user.usergroups)
                                   .select('_id short_name')
                                   .sort('_id')
                                   .lean(true)
                                   .then(groups => groups.map(group => ({
                                     name:  group.short_name,
                                     value: group._id,
                                     title: 'admin.users.usergroup_names.' + group.short_name
                                   })));
  });
};
