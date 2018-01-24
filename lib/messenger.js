'use strict';

const channelName = 'egg-bridge';
const { resolveSender, createSender } = require('./sender');
const SENDER = Symbol('SENDER');

class Messenger {
  constructor(app, messageHandle, isEgent) {
    this.app = app;
    this.isEgent = isEgent;
    app.messenger.on(channelName, message => {
      if (!message) return;
      const { senderid, action, data, req } = message;
      if (action === 'response') {
        return resolveSender(senderid, data);
      }
      return messageHandle(senderid, data, req);
    });
  }
  get sender() {
    if (this[SENDER]) return this[SENDER];
    const func = this.isEgent ?
      this.app.messenger.sendRandom.bind(this.app.messenger) :
      this.app.messenger.sendToAgent.bind(this.app.messenger);
    this[SENDER] = func.bind(this.app.messenger);
    return this[SENDER];
  }
  send(data) {
    this.sender(channelName, data);
  }
  sendWait(data, timeout) {
    return createSender({
      handle: senderid => {
        this.send(Object.assign({ senderid }, data));
      },
      timeout,
    });
  }
}

module.exports = (app, messageHandle, isEgent) => {
  return new Messenger(app, messageHandle, isEgent);
};
