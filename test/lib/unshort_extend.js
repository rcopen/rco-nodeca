'use strict';


const assert  = require('assert');


describe.only('unshort_extend', function () {
  /* eslint-disable max-len */
  it('Unshort ali.pub', function () {
    if (!process.env.LINKS_CHECK) return this.skip();

    let url = 'http://ali.pub/y9fu8';
    let data = { url, types: [ 'inline' ] };

    return TEST.N.wire.emit('internal:common.embed', data).then(() => {
      assert.strictEqual(
        data.canonical,
        'https://www.aliexpress.com/item/Electric-motor-shaft-Mini-Chuck-Fixture-Clamp-0-3mm-3-5mm-Small-To-Drill-Bit-Micro/32706864811.html'
      );
    });
  });

  it('Unshort banggood.app.link', function () {
    if (!process.env.LINKS_CHECK) return this.skip();

    let url = 'https://banggood.app.link/IVvWv4dMBy';
    let data = { url, types: [ 'inline' ] };

    return TEST.N.wire.emit('internal:common.embed', data).then(() => {
      assert.strictEqual(
        // Drop query because it's different every time
        String(data.canonical).split('?')[0],
        'http://www.banggood.com/Liantian-LED-Strip-with-4-WS2812B-RG85050-Colorful-LED-Lamp-for-Naze32-CC3D-p-1044127.html'
      );
    });
  });

});
