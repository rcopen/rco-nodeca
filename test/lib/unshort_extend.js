'use strict';


const assert  = require('assert');
const fs      = require('fs');
const YAML    = require('js-yaml');
const path    = require('path');


describe('unshort_extend', function () {
  if (!process.env.LINKS_CHECK) return;

  let urls = YAML.safeLoad(fs.readFileSync(path.join(__dirname, 'unshort_extend.yml'), 'utf8'));

  Object.keys(urls).forEach(function (url) {
    it(url, function () {
      let data = { url, types: [ 'inline' ] };

      return TEST.N.wire.emit('internal:common.embed', data).then(() => {
        assert.strictEqual(data.canonical, urls[url]);
      });
    });
  });
});
