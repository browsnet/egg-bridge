'use strict';

const is = require('is-type-of');
const assert = require('assert');
const BRIDGEFLAG = Symbol('BRIDGEFLAG');

const flagArr = [
  'nowait', 'self',
];

function checkFlag(req, flag) {
  if (!flag && req && flagArr.includes(req)) {
    flag = req;
  }
  if (req && !is.object(req)) req = null;
  if (!flag || !flagArr.includes(flag)) return req;
  if (!req) req = {};
  req[BRIDGEFLAG] = flag;
  return req;
}


function createBridgeHandle(config) {
  const { fullpath } = config;
  return function handle(...args) {
    const data = { fullpath, args };
    assert(this && this.app, 'cannot call bridgeHandle without this');
    const app = this.app;
    const req = this.req;
    const bridgeFlag = req && req[BRIDGEFLAG] ? req[BRIDGEFLAG] : null;
    if (!bridgeFlag) {
      const timeout = config.timeout ? config.timeout : app.config.bridge.timeout;
      return this.messenger.sendWait({ data, req }, timeout);
    }
    if (bridgeFlag === 'nowait') {
      return this.messenger.send({ data, req });
    }
    if (bridgeFlag === 'self') {
      return execHandle(this, data, req);
    }
  };
}


async function execHandle(wrap, data, req) {
  const { app, loader, isEgent } = wrap;
  const { fullpath, args } = data;
  const map = loader.map;
  const handle = map.get(fullpath);
  if (!handle) return;
  if (!is.object(req)) req = null;
  let ctx;
  if (!isEgent) {
    ctx = Object.assign(app.createAnonymousContext(), req);
  } else {
    ctx = Object.assign({ app }, req);
  }
  return handle(ctx, ...args);
}

module.exports = {
  checkFlag,
  createBridgeHandle,
  execHandle,
};
