'use strict';

const { BaseContextClass } = require('egg');
class Handle extends BaseContextClass {
  async bridge(...args) {
    const app = this.app;
    const { username } = this.ctx;
    app.logger.info('in worker:', username, args);
    const ret = await app.bridge({ username }).plus(args[0]);
    await app.bridge({ username }, 'self').plus(ret);
  }
}
module.exports = Handle;
