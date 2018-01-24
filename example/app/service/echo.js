'use strict';

const { Service } = require('egg');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));
class EchoService extends Service {
  async hello(name) {
    await sleep(1500);
    return `hello ${name}`;
  }
}

module.exports = EchoService;
