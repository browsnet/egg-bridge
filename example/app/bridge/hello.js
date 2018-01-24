'use strict';

const { BaseContextClass } = require('egg');
class Hello extends BaseContextClass {
  // optional
  static get timeout() {
    return 2000;
  }
  bridge(name) {
    return this.service.echo.hello(name);
  }
}

module.exports = Hello;
