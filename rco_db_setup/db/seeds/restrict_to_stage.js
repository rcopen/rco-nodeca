// Turn off email notifications and email confirmation
//

'use strict';


module.exports = async function (N) {

  // Disable email notifications
  //
  let usergroupStore = N.settings.getStore('usergroup');

  if (!usergroupStore) throw new Error('Settings store `usergroup` is not registered.');

  let usergroups = await N.models.users.UserGroup.find().lean(true);

  for (let usergroup of usergroups) {
    await usergroupStore.set({
      can_receive_email: { value: false, force: true }
    }, { usergroup_id: usergroup._id });
  }

  // Turn off registration confirmation
  //
  /*let globalStore = N.settings.getStore('global');

  if (!globalStore) throw new Error('Settings store `global` is not registered.');

  await globalStore.set({ validate_email: { value: false } });*/
};
