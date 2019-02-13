// Move user to "che" usergroup on `bad_profile_data` infraction
//
'use strict';


module.exports = function (N) {

  N.wire.on('internal:users.infraction.add', async function move_che(infraction) {
    if (infraction.type !== 'bad_profile_data') return;

    let che_group_id = await N.models.users.UserGroup.findIdByName('che');

    if (!che_group_id) throw new Error('Cheburate: Cannot find usergroup by short name "che"');

    await N.models.users.User.updateOne({ _id: infraction.for }, { usergroups: [ che_group_id ] });
  });
};
