// Move user to "che" usergroup on `bad_profile_data` infraction
//
'use strict';


module.exports = function (N) {

  N.wire.on('internal:users.infraction.add', function* move_che(infraction) {
    if (infraction.type !== 'bad_profile_data') return;

    let che_group_id = yield N.models.users.UserGroup.findIdByName('che');

    if (!che_group_id) throw new Error('Cheburate: Cannot find usergroup by short name "che"');

    yield N.models.users.User.update({ _id: infraction.for }, { usergroups: [ che_group_id ] });
  });
};
