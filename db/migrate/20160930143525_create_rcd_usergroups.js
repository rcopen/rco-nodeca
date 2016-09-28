'use strict';


const co = require('bluebird-co').co;


exports.up = co.wrap(function* (N) {
  let usergroups = [
    { name: 'incomplete_profile' },
    { name: 'just_registered' },
    { name: 'novices',    parent: 'members' },
    { name: 'moderators', parent: 'members' },
    { name: 'che' },
    { name: 'losers' },
    { name: 'frozen' }
  ];

  for (let config of usergroups) {
    let usergroup = new N.models.users.UserGroup({
      short_name:   config.name
      //is_protected: true
    });

    try {
      yield usergroup.save();
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

    let usergroup = yield N.models.users.UserGroup.findIdByName(config.name);
    let parent    = yield N.models.users.UserGroup.findIdByName(config.parent);

    yield N.models.users.UserGroup.update(
      { _id: usergroup },
      { $set: { parent_group: parent } }
    );
  }


  let usergroupStore = N.settings.getStore('usergroup');

  if (!usergroupStore) throw 'Settings store `usergroup` is not registered.';

  // add usergroup settings for moderators
  // (in addition to inherited from members)

  let grp_moderators = yield N.models.users.UserGroup.findIdByName('moderators');

  yield usergroupStore.set({
    can_see_infractions:           { value: true },
    cannot_receive_infractions:    { value: true },
    cannot_be_ignored:             { value: true },
    users_mod_can_add_infractions: { value: true },
    forum_show_ignored:            { value: true }
  }, { usergroup_id: grp_moderators });

  // add usergroup settings for incomplete_profile group

  let grp_incomplete_profile = yield N.models.users.UserGroup.findIdByName('incomplete_profile');

  yield usergroupStore.set({
    can_edit_profile:  { value: true },
    can_receive_email: { value: true }
  }, { usergroup_id: grp_incomplete_profile });

  // add usergroup settings for just_registered group

  let grp_just_registered = yield N.models.users.UserGroup.findIdByName('just_registered');

  yield usergroupStore.set({
    can_edit_profile:  { value: true },
    can_receive_email: { value: true }
  }, { usergroup_id: grp_just_registered });

  // add usergroup settings for che group

  let grp_che = yield N.models.users.UserGroup.findIdByName('che');

  yield usergroupStore.set({
    can_edit_profile:  { value: true },
    can_receive_email: { value: true }
  }, { usergroup_id: grp_che });

  // add usergroup settings for losers group

  let grp_losers = yield N.models.users.UserGroup.findIdByName('losers');

  yield usergroupStore.set({
    can_edit_profile:  { value: true },
    can_receive_email: { value: true }
  }, { usergroup_id: grp_losers });


  //
  // Change default usergroup after registration
  //
  let store = N.settings.getStore('global');

  if (!store) throw 'Settings store `global` is not registered.';

  yield store.set({ registered_user_group: { value: grp_incomplete_profile.toString() } });
});
