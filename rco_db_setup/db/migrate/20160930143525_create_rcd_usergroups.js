'use strict';


exports.up = async function (N) {
  let usergroups = [
    { name: 'incomplete_profile' },
    { name: 'just_registered' },
    { name: 'novices',    parent: 'members' },
    { name: 'moderators', parent: 'members' },
    { name: 'che' },
    { name: 'losers' },
    { name: 'frozen' },
    { name: 'vb_imported' }
  ];

  for (let config of usergroups) {
    let usergroup = new N.models.users.UserGroup({
      short_name:   config.name
      //is_protected: true
    });

    try {
      await usergroup.save();
    } catch (err) {
      //
      // Those usergroups may already be created by nodeca.vbconvert,
      // so we ignore duplicate `short_name` key errors here
      //
      if (err.code !== 11000) throw err;
    }
  }


  // update parent_group
  for (let config of usergroups) {
    if (!config.parent) continue;

    let usergroup = await N.models.users.UserGroup.findIdByName(config.name);
    let parent    = await N.models.users.UserGroup.findIdByName(config.parent);

    await N.models.users.UserGroup.updateOne(
      { _id: usergroup },
      { $set: { parent_group: parent } }
    );
  }


  let usergroupStore = N.settings.getStore('usergroup');

  if (!usergroupStore) throw 'Settings store `usergroup` is not registered.';

  // add usergroup settings for moderators
  // (in addition to inherited from members)

  let grp_moderators = await N.models.users.UserGroup.findIdByName('moderators');

  await usergroupStore.set({
    can_see_infractions:                   { value: true },
    cannot_receive_infractions:            { value: true },
    cannot_be_ignored:                     { value: true },
    users_mod_can_add_infractions_profile: { value: true },
    forum_show_ignored:                    { value: true }
  }, { usergroup_id: grp_moderators });

  // disable club creation for novices (< 30 days)

  let grp_novices = await N.models.users.UserGroup.findIdByName('novices');

  await usergroupStore.set({
    clubs_can_create_clubs:  { value: false },
    market_can_create_items: { value: false }
  }, { usergroup_id: grp_novices });

  // add usergroup settings for incomplete_profile group

  let grp_incomplete_profile = await N.models.users.UserGroup.findIdByName('incomplete_profile');

  await usergroupStore.set({
    can_edit_profile:  { value: true },
    can_receive_email: { value: true }
  }, { usergroup_id: grp_incomplete_profile });

  // add usergroup settings for vb_imported group

  let grp_vb_imported = await N.models.users.UserGroup.findIdByName('vb_imported');

  await usergroupStore.set({
    can_edit_profile:  { value: true },
    can_receive_email: { value: true },
    can_use_dialogs:   { value: true }
  }, { usergroup_id: grp_vb_imported });

  // add usergroup settings for just_registered group

  let grp_just_registered = await N.models.users.UserGroup.findIdByName('just_registered');

  await usergroupStore.set({
    can_edit_profile:  { value: true },
    can_receive_email: { value: true }
  }, { usergroup_id: grp_just_registered });

  // add usergroup settings for che group

  let grp_che = await N.models.users.UserGroup.findIdByName('che');

  await usergroupStore.set({
    can_edit_profile:  { value: true },
    can_receive_email: { value: true }
  }, { usergroup_id: grp_che });

  // add usergroup settings for losers group

  let grp_losers = await N.models.users.UserGroup.findIdByName('losers');

  await usergroupStore.set({
    can_edit_profile:  { value: true },
    can_receive_email: { value: true }
  }, { usergroup_id: grp_losers });


  //
  // Change default usergroup after registration
  //
  let store = N.settings.getStore('global');

  if (!store) throw 'Settings store `global` is not registered.';

  await store.set({ registered_user_group: { value: grp_incomplete_profile.toString() } });
};
