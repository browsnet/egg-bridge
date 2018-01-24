'use strict';

const sendMap = new Map();
class Sender {
  constructor(timeout, resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;
    this.timeout = timeout ? timeout : 3000;
    this.id = this.initID();
    sendMap.set(this.id, this);
  }

  initID() {
    const id = parseInt(Math.random() * 1000000);
    if (sendMap.has(id)) return this.initID();
    return id;
  }
  send(sender) {
    sender(this.id);
    setTimeout(() => {
      this.clear();
    }, this.timeout);
  }
  clear() {
    sendMap.delete(this.id);
    this.reject(`timeout:no message from other process in ${this.timeout}ms`);
  }
  callback(ret) {
    sendMap.delete(this.id);
    this.resolve(ret);
  }
}

exports.resolveSender = function resolveSender(senderid, data) {
  if (!senderid || !sendMap.has(senderid)) return;
  const sender = sendMap.get(senderid);
  sender.callback(data);
};

exports.createSender = function createSender({ handle, timeout }) {
  return new Promise((resolve, reject) => {
    const sender = new Sender(timeout, resolve, reject);
    sender.send(handle);
  });
};
