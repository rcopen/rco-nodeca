// Add firstname/lastname to the N.models.users.User model
//

'use strict';


const _ = require('lodash');


// Perform "auto-incorrection" assuming that we know about users' names more
// than they do.
//
// Just for the reference, here're a few better ideas:
// http://ux.stackexchange.com/questions/26560/auto-capitalization-of-name-input-fields
//
function normalize_name(str) {
  return str.split(/([ -])/g)
            .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
            .join('');
}


module.exports = function (N) {
  N.wire.before('init:models.users.User', function init_extend_user_model(User) {
    User.add({
      first_name:    String,
      last_name:     String,

      // copies of first_name and last_name normalized for search purposes
      first_name_lc: String,
      last_name_lc:  String
    });

    User.index({ first_name_lc: 1 });
    User.index({ last_name_lc: 1 });

    
    // FIXME: make denormalisation customizeable
    //
    // Update full name, on dependencies change (nick /first name / last name)
    //
    User.pre('save', function (callback) {

      if (this.isModified('first_name')) {
        this.first_name = normalize_name(this.first_name);
        this.first_name_lc = this.first_name.toLowerCase();
      }

      if (this.isModified('last_name')) {
        this.last_name = normalize_name(this.last_name);
        this.last_name_lc = this.last_name.toLowerCase();
      }

      // skip, if nothing changed
      if (this.isModified('nick') || this.isModified('first_name') || this.isModified('last_name')) {
        if (!!this.first_name && !!this.last_name) {
          this.name = this.first_name + ' (' + this.nick + ') ' + this.last_name;
        } else {
          this.name = this.nick;
        }
      }

      callback();
    });
  });
};
