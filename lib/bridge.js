'use strict';
const BLANKCONTEXT = Symbol('BLANKCONTEXT');
const BOUNDBRIDGE = Symbol('BOUNDBRIDGE');
const HANDLEMESSAGE = Symbol('HANDLEMESSAGE');
const is = require('is-type-of');
const loadBridge = require('./loader');
const setMessenger = require('./messenger');
const { checkFlag, execHandle } = require('./handle');

class BradgeBuilder {
  constructor(app, isEgent) {
    this.app = app;
    this.loader = loadBridge(app);
    this.isEgent = isEgent;
    this.messenger = setMessenger(app, this.request, isEgent);
  }

  get bridge() {
    if (this[BOUNDBRIDGE]) return this[BOUNDBRIDGE];
    const func = (req, flag) => {
      req = checkFlag(req, flag);
      if (!req && this[BLANKCONTEXT]) return this[BLANKCONTEXT];
      const { loader, app, isEgent, messenger } = this;
      const bridge = proxy(loader.handles, { loader, app, req, isEgent, messenger });
      if (!req) this[BLANKCONTEXT] = bridge;
      return bridge;
    };
    this[BOUNDBRIDGE] = func;
    return func;
  }
  get request() {
    if (this[HANDLEMESSAGE]) return this[HANDLEMESSAGE];
    this[HANDLEMESSAGE] = async (senderid, data, req) => {
      const ret = await execHandle(this, data, req);
      if (!senderid) return;
      this.messenger.send({
        action: 'response',
        senderid,
        data: ret,
      });
    };
    return this[HANDLEMESSAGE];
  }
}

module.exports = (app, isEgent) => {
  return new BradgeBuilder(app, isEgent).bridge;
};

function proxy(target, binder) {
  return new Proxy(target, {
    get(target, name) {
      const item = target[name];
      if (is.function(item)) {
        return item.bind(binder);
      } else if (is.object(item)) {
        return proxy(item, binder);
      }
      return item;
    },
  });
}
