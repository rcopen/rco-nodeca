// Test links cleanup from garbage in query params
//
'use strict';


const assert  = require('assert');


const samples = [
  /* eslint-disable max-len */

  // GA + email marketing

  [
    'http://store.dji.com/product/mavic-pro?utm_source=newsletter&utm_medium=edm&utm_campaign=mavicen0927&sc_src=email_884153&sc_eh=b887c77a4d9e75871&sc_llid=133584&sc_lid=21286924&sc_uid=LtEcV0kEvu',
    'http://store.dji.com/product/mavic-pro'
  ],

  // Yandex's ymclid
  [
    'http://rc-today.ru/shop/UID_60130.html?_openstat=bWFya2V0LnlhbmRleC5ydTvQoNCw0LTQuNC-0YPQv9GA0LDQstC70Y_QtdC80YvQuSDQvNC-0L3RgdGC0YAgVlJYIFJhY2luZyBPZmYtcm9hZCBNb25zdGVyIFRydWNrIEJMWDEwLCBXYXRlcnByb29mIDRXRCBSVFIg0LzQsNGB0YjRgtCw0LEgMToxMCAyLjRHIC0gUkVDLTAwMTQtMDI7WDFvcjAwbEl4dnpjWGJ1dXpoSnpCZzs%2C&from=yml&frommarket=https%3A%2F%2Fmarket.yandex.ru%2Fproduct%2F1645104247%3Fnid%3D59698%26hid%3D10682592%26show-uid%3D74041728078441224820001&ymclid=74041736382661722850001',
    'http://rc-today.ru/shop/UID_60130.html'
  ],

  // AliExpress

  [
    'http://ru.aliexpress.com/store/product/D58-2-DUO5800-5-8Ghz-32CH-Wireless-AV-FPV-Diversity-Receiver/1819419_32358972247.html?storeId=1819419',
    'http://ru.aliexpress.com/store/product/D58-2-DUO5800-5-8Ghz-32CH-Wireless-AV-FPV-Diversity-Receiver/1819419_32358972247.html'
  ],
  [
    'https://yowoo.ru.aliexpress.com/store/group/XXL-Battery/1850811_502744098.html?spm=2114.8147860.0.0.AqRqTT',
    'https://yowoo.ru.aliexpress.com/store/group/XXL-Battery/1850811_502744098.html'
  ],
  [
    'https://ru.aliexpress.com/item/FX797T-5-8G-25mW-40CH-AV-Transmitter-With-600TVL-Camera/32652904850.html?detailNewVersion=&categoryId=200001407',
    'https://ru.aliexpress.com/item/FX797T-5-8G-25mW-40CH-AV-Transmitter-With-600TVL-Camera/32652904850.html'
  ],
  [
    'http://ru.aliexpress.com/item/uBlox-6M-GPS-with-Compass-for-APM-2-6-APM2-8-GPS-folding-Black-holder/2038060542.html?adminSeq=201725844&shopNumber=727847',
    'http://ru.aliexpress.com/item/uBlox-6M-GPS-with-Compass-for-APM-2-6-APM2-8-GPS-folding-Black-holder/2038060542.html'
  ],

  // Ebay

  [
    'http://www.ebay.com/itm/Emax-RS2205-2600KV-Racing-Edition-CCW-Motor-for-FPV-Multicopter-RC-Quadcopter/282062341166?_trksid=p2047675.c100005.m1851&_trkparms=aid%3',
    'http://www.ebay.com/itm/Emax-RS2205-2600KV-Racing-Edition-CCW-Motor-for-FPV-Multicopter-RC-Quadcopter/282062341166'
  ],
  [
    'http://www.ebay.com/itm/Axial-AE-2-ESC-with-Drag-Brake-Wraith-Dingo-Honcho-/350555699509#ht_2864wt_709',
    'http://www.ebay.com/itm/Axial-AE-2-ESC-with-Drag-Brake-Wraith-Dingo-Honcho-/350555699509'
  ],

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
  [
    'http://www.banggood.com/RC235-235MM-Carbon-Fiber-Frame-Kit-Mini-Quadcopter-Multiroter-p-1013293.html?currency=USD',
    'http://www.banggood.com/RC235-235MM-Carbon-Fiber-Frame-Kit-Mini-Quadcopter-Multiroter-p-1013293.html'
  ],

  // Gearbest

  [
    'http://www.gearbest.com/multi-rotor-parts/pp_428943.html?wid=21&utm_source=epn&offer_type=30days&af_id=752&pl_id=0&pl_type=other&click_id=1ohefa66nkalpa1py627xg71ycsq6z4t',
    'http://www.gearbest.com/multi-rotor-parts/pp_428943.html'
  ],
  [
    'http://www.gearbest.com/kits/pp_265051.html?admitad_uid=f0a6c75626fc2d5c431ce7ea5aacace1',
    'http://www.gearbest.com/kits/pp_265051.html'
  ],
  [
    'http://www.gearbest.com/rc-quadcopter-parts/pp_270377.html?wid=21',
    'http://www.gearbest.com/rc-quadcopter-parts/pp_270377.html'
  ],

  // dx.com
  [
    'http://www.dx.com/p/rechargeable-4-ch-r-c-helicopter-w-gyroscope-yellow-black-ir-remote-6-x-aa-67080#.VjhPcbfhCM8',
    'http://www.dx.com/p/rechargeable-4-ch-r-c-helicopter-w-gyroscope-yellow-black-ir-remote-6-x-aa-67080'
  ],

  // hobbyking
  [
    'http://www.hobbyking.com/hobbyking/store/uh_viewitem.asp?idProduct=59744&aff=346897',
    'http://www.hobbyking.com/hobbyking/store/uh_viewitem.asp?idProduct=59744'
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
