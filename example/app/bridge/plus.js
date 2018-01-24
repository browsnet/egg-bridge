'use strict';

const { BaseContextClass } = require('egg');
class Plus extends BaseContextClass {
  bridge(num) {
    const { username } = this.ctx;
    num += 100;
    const pwd = this.app.createAnonymousContext ? 'in worker:' : 'in agent :';
    this.app.logger.info(pwd, username, num);
    return num;
  }
}

module.exports = Plus;
