// Add more url shorteners
//
'use strict';


module.exports = function (N) {

  N.wire.on('init:embed', function extend_unshort(data) {
    [ 'normal', 'cached' ].forEach(type => {
      let instance = data.unshort[type];

      (N.config.unshort || []).forEach(c => {
        if (typeof c === 'string') {
          instance.add(c);
          return;
        }

        Object.keys(c).forEach(domain => {
          let domain_config = c[domain];

          instance.add(domain, domain_config);
        });
      });
    });
  });

};
