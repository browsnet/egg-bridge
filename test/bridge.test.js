'use strict';

const mock = require('egg-mock');

describe('test/bridge.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/bridge-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, bridge')
      .expect(200);
  });
});
