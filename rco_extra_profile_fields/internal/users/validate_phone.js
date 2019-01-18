// Validate phone number using google-libphonenumber library
//
// Input:
//
// - value     (String)  - phone number to validate
//
// Result:
//
// - is_valid  (Boolean) - is it valid or not
// - formatted (String)  - formatted value
//

'use strict';

const libphonenumber  = require('google-libphonenumber');
const phoneNumberUtil = libphonenumber.PhoneNumberUtil.getInstance();


module.exports = function (N, apiPath) {

  N.wire.on(apiPath, function validate_phone_number(data) {
    let parsed;

    try {
      parsed = phoneNumberUtil.parse(data.value, 'RU');
    } catch (__) {}

    if (parsed && phoneNumberUtil.isValidNumberForRegion(parsed, 'RU')) {
      data.is_valid  = true;
      data.formatted = phoneNumberUtil.format(parsed, libphonenumber.PhoneNumberFormat.INTERNATIONAL);
    }
  });
};
