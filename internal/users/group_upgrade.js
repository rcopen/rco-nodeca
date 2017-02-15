// Automatically change usergroup membership for users,
// using pre-defined set of rules.
//
// locals (wire object):
//
//  - user_id  (String|ObjectId) - input (optional), process all users if not specified
//  - upgraded (Object)          - internal, list of users where usergroup membership has changed
//


//
// Rules for upgrade are:
//
//  1. {none} -> `incomplete_profile`
//
//     If user has no usergroups, they are immediately moved to
//     `incomplete_profile` usergroup. It can be used to reset
//     usergroups when un-freezing a user.
//
//  2. `incomplete_profile` -> `just_registered` (fill profile)
//
//     If user has "about me" data filled (first name, last name,
//     birthday and location), they are moved to `just_registered`
//
//  3. `incomplete_profile` -> `che` (fill profile)
//
//     If user has "about me" data filled, but we don't like the
//     way they did it (unexpected characters in the name, for
//     example), they are moved to `che` instead of `just_registered`
//
//  4. `just_registered` -> `novices` (1 day after registration)
//
//     Any user in `just_registered` group is moved to `novices`
//     as long as they are registered more than 1 day ago.
//
//  5. `just_registered` -> `banned` (1 day after registration)
//
//     If user ip or email is in the ban list, they're moved to
//     `banned` instead of `novices`.
//
//  6. `novices` -> `members` (30 days after registration)
//
//     Any user in `novices` group is moved to `members`
//     as long as they are registered more than 30 days ago.
//

'use strict';


const _       = require('lodash');
const Promise = require('bluebird');


module.exports = function (N, apiPath) {

  // Check user ip and email against ban lists
  //
  const is_user_banned = Promise.coroutine(function* (user) {
    let store = N.settings.getStore('global');

    let ban_ip = yield store.get('ban_ip');

    if (ban_ip.value.trim().length) {
      let ban_ip_re = new RegExp(
        '^(?:' + ban_ip.value.split(/\s+/)
                          .map(ip => _.escapeRegExp(ip) + (ip.slice(-1) === '.' ? '\\d+(?:\\.\\d+)*' : ''))
                          .join('|') + ')$',
        'i'
      );

      if (ban_ip_re.test(user.joined_ip)) return true;
    }

    let ban_email = yield store.get('ban_email');

    if (ban_email.value.trim().length) {
      let ban_email_re = new RegExp(
        ban_email.value.split(/\s+/)
                       .map(_.escapeRegExp)
                       .join('|'),
        'i'
      );

      if (ban_email_re.test(user.email)) return true;
    }

    return false;
  });


  N.wire.before(apiPath, { priority: -100 }, function group_upgrade_init(locals) {
    locals.upgraded = {};
  });


  // `novices` -> `members` (30 days after registration)
  N.wire.on(apiPath, function* upgrade_novices(locals) {
    let grp_novices = yield N.models.users.UserGroup.findIdByName('novices');

    let query = N.models.users.User.find()
                    .where('usergroups').equals(grp_novices)
                    .where('joined_ts').lt(new Date(Date.now() - 30 * 86400 * 1000));

    if (locals.user_id) query = query.where('_id').equals(locals.user_id);

    let users = yield query.lean(true);

    if (!users.length) return;

    let grp_members = yield N.models.users.UserGroup.findIdByName('members');

    for (let user of users) {
      let usergroups  = user.usergroups;

      // remove old group, and make sure new group isn't already present
      usergroups = user.usergroups.filter(group =>
                     ![ String(grp_novices), String(grp_members) ].includes(String(group)));

      usergroups.push(grp_members);

      yield N.models.users.User.update({ _id: user._id }, { $set: { usergroups } });
      locals.upgraded[user._id] = true;
    }
  });


  // `just_registered` -> `novices` (1 day after registration)
  // `just_registered` -> `banned` (1 day after registration)
  N.wire.on(apiPath, function* upgrade_just_registered(locals) {
    let grp_just_registered = yield N.models.users.UserGroup.findIdByName('just_registered');

    let query = N.models.users.User.find()
                    .where('usergroups').equals(grp_just_registered)
                    .where('joined_ts').lt(new Date(Date.now() - 86400 * 1000));

    if (locals.user_id) query = query.where('_id').equals(locals.user_id);

    let users = yield query.lean(true);

    if (!users.length) return;

    let grp_novices = yield N.models.users.UserGroup.findIdByName('novices');
    let grp_banned  = yield N.models.users.UserGroup.findIdByName('banned');

    for (let user of users) {
      let usergroups = user.usergroups;

      let target_usergroup = (yield is_user_banned(user)) ? grp_banned : grp_novices;

      // remove old group, and make sure new group isn't already present
      usergroups = user.usergroups.filter(group =>
                     ![ String(target_usergroup), String(grp_just_registered) ].includes(String(group)));

      usergroups.push(target_usergroup);

      yield N.models.users.User.update({ _id: user._id }, { $set: { usergroups } });
      locals.upgraded[user._id] = true;
    }
  });


  // `incomplete_profile` -> `just_registered` (fill profile)
  //
  // This rule applies if user already submitted a valid profile a while ago,
  // and `incomplete_profile` is group was added since as an intermediate group,
  // e.g. during unfreezing.
  //
  N.wire.on(apiPath, function* upgrade_incomplete_profile(locals) {
    let grp_incomplete_profile = yield N.models.users.UserGroup.findIdByName('incomplete_profile');

    let query = N.models.users.User.find()
                    .where('usergroups').equals(grp_incomplete_profile)
                    .where('incomplete_profile').equals(false);

    if (locals.user_id) query = query.where('_id').equals(locals.user_id);

    let users = yield query.lean(true);

    if (!users.length) return;

    let just_registered = yield N.models.users.UserGroup.findIdByName('just_registered');

    for (let user of users) {
      // remove old group, and make sure new group isn't already present
      let usergroups = user.usergroups.filter(group =>
                         ![ String(grp_incomplete_profile), String(just_registered) ].includes(String(group)));

      usergroups.push(just_registered);

      yield N.models.users.User.update({ _id: user._id }, { $set: { usergroups } });
      locals.upgraded[user._id] = true;
    }
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


  // `incomplete_profile` -> `just_registered` (fill profile)
  // `incomplete_profile` -> `che` (fill profile)
  //
  // This rule applies if user have just submitted a profile change,
  // so we need to verify if data is valid.
  //
  N.wire.on(apiPath, function* validate_profile(locals) {
    // Only apply this rule when we're triggering update for a single user,
    // not for a mass-upgrade triggered by cron task.
    //
    if (!locals.user_id) return;

    let grp_incomplete_profile = yield N.models.users.UserGroup.findIdByName('incomplete_profile');

    let query = N.models.users.User.find()
                    .where('usergroups').equals(grp_incomplete_profile)
                    .where('first_name').exists()
                    .where('last_name').exists()
                    .where('location').exists()
                    .where('about.birthday').exists()
                    .where('incomplete_profile').equals(true);

    if (locals.user_id) query = query.where('_id').equals(locals.user_id);

    let users = yield query.lean(true);

    if (!users.length) return;

    for (let user of users) {
      let first_name = user.first_name;
      let last_name  = user.last_name;
      let birthday   = user.about ? user.about.birthday : null;
      let location   = user.location;
      let valid      = true;

      if (!first_name || !last_name || !birthday || !location) return;

      // Check if first and last names are the same
      if (first_name === last_name) valid = false;

      // Check firstname
      if (check_name(first_name)) valid = false;

      // Check lastname
      // Like first name, but no spaces allowed
      if (check_name(last_name) || /\s/.test(last_name)) valid = false;

      let usergroups = user.usergroups;
      let new_group;

      if (valid) {
        new_group = yield N.models.users.UserGroup.findIdByName('just_registered');
      } else {
        new_group = yield N.models.users.UserGroup.findIdByName('che');
      }

      // remove old group, and make sure new group isn't already present
      usergroups = user.usergroups.filter(group =>
                     ![ String(grp_incomplete_profile), String(new_group) ].includes(String(group)));

      usergroups.push(new_group);

      let update = { $set: { usergroups } };

      if (valid) update.$set.incomplete_profile = false;

      yield N.models.users.User.update({ _id: user._id }, update);
      locals.upgraded[user._id] = true;
    }
  });


  // {none} -> `incomplete_profile`
  N.wire.on(apiPath, function* upgrade_add_initial_usergroup(locals) {
    // Only apply this rule when we're triggering update for a single user,
    // e.g. during an un-freeze.
    //
    // There is no efficient way to select all users without groups.
    //
    if (!locals.user_id) return;

    let user = yield N.models.users.User.findById(locals.user_id).lean(false);

    if (!user.usergroups.length) {
      user.usergroups = [ yield N.models.users.UserGroup.findIdByName('incomplete_profile') ];

      yield user.save();
      locals.upgraded[user._id] = true;
    }
  });


  // Repeat upgrades in a loop for individual users until no upgrades are possible
  //
  N.wire.after(apiPath, { priority: 100 }, function* group_upgrade_repeat(locals) {
    // do not restart this method if we're already inside a loop
    if (locals.no_nesting) return;

    if (Object.keys(locals.upgraded).length) {

      for (let i = 0; ; i++) {
        let subcall_locals = {
          user_id:    locals.user_id, // optional, can be undefined
          no_nesting: true
        };

        yield N.wire.emit(apiPath, subcall_locals);

        if (Object.keys(subcall_locals.upgraded).length === 0) break;

        if (i > 20) throw new Error('group_upgrade: loop detected');
      }
    }
  });
};
