// Test links cleanup from garbage in query params
//
'use strict';


const assert  = require('assert');


const samples = [
  /* eslint-disable max-len */

  // Banggood

  [ // own affiliate program
    'http://www.banggood.com/New-Version-Upgraded-Hubsan-X4-V2-H107L-2_4G-4CH-RC-Quadcopter-RTF-p-71838.html?p=WL2504207536201306OF',
    'http://www.banggood.com/New-Version-Upgraded-Hubsan-X4-V2-H107L-2_4G-4CH-RC-Quadcopter-RTF-p-71838.html'
  ],
  [ // epn
    'http://www.banggood.com/collection-2555.html?pr=epn&click_id=3oh7nh0l67adz5tuntt831upg7xe94uh',
    'http://www.banggood.com/collection-2555.html'
  ],
  [ // banggood.app.link
    'http://www.banggood.com/Liantian-LED-Strip-with-4-WS2812B-RG85050-Colorful-LED-Lamp-for-Naze32-CC3D-p-1044127.html?utm_campaign=android-share&utm_source=google-play&utm_medium=organic&android_share=1&_branch_match_id=307168648793035009',
    'http://www.banggood.com/Liantian-LED-Strip-with-4-WS2812B-RG85050-Colorful-LED-Lamp-for-Naze32-CC3D-p-1044127.html'
  ],
  [
    'http://www.banggood.com/ru/2_4G-2W-Radio-Signal-Booster-Antenna-Feeder-For-DJI-Phantom-Multirotor-TX-Extend-Range-p-986756.html?rmmds=cart',
    'http://www.banggood.com/ru/2_4G-2W-Radio-Signal-Booster-Antenna-Feeder-For-DJI-Phantom-Multirotor-TX-Extend-Range-p-986756.html'
  ],

  // Gearbest

  [
    'http://www.gearbest.com/multi-rotor-parts/pp_428943.html?wid=21&utm_source=epn&offer_type=30days&af_id=752&pl_id=0&pl_type=other&click_id=1ohefa66nkalpa1py627xg71ycsq6z4t',
    'http://www.gearbest.com/multi-rotor-parts/pp_428943.html?wid=21'
  ],
  [
    'http://www.gearbest.com/kits/pp_265051.html?admitad_uid=f0a6c75626fc2d5c431ce7ea5aacace1',
    'http://www.gearbest.com/kits/pp_265051.html'
  ],

  // dx.com
  [
    'http://www.dx.com/p/rechargeable-4-ch-r-c-helicopter-w-gyroscope-yellow-black-ir-remote-6-x-aa-67080#.VjhPcbfhCM8',
    'http://www.dx.com/p/rechargeable-4-ch-r-c-helicopter-w-gyroscope-yellow-black-ir-remote-6-x-aa-67080'
  ]
];


describe('Links cleanup (query params)', function () {

  samples.map(([ url, expected ]) => {
    it(expected + '...', function () {
      let data = { url, types: [ 'inline' ] };

      return TEST.N.wire.emit('internal:common.embed', data).then(() => {
        assert.strictEqual(data.canonical, expected);
      });
    });
  });

});
