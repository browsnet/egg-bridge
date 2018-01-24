'use strict';

const path = require('path');
const assert = require('assert');
const is = require('is-type-of');
const debug = require('debug')('egg-bridge:loader');
const FULLPATH = Symbol('EGG_LOADER_ITEM_FULLPATH');
const EXPORTS = Symbol('EGG_LOADER_ITEM_EXPORTS');
const { createBridgeHandle } = require('./handle');

module.exports = app => {
  const dirs = app.loader.getLoadUnits().map(unit => path.join(unit.path, 'app/bridge'));
  const Loader = getBridgeLoader(app);
  const bridges = {};
  new Loader({
    directory: dirs,
    target: bridges,
    inject: app,
  }).load();
  return bridges;
};

function getBridgeLoader(app) {
  return class BridgeLoader extends app.loader.FileLoader {
    load() {
      const items = this.parse();
      const target = this.options.target;
      target.map = new Map();
      target.handles = {};
      for (const item of items) {
        loadItem(app, target, item);
      }
      return target;
    }
  };
}


function loadItem(app, target, item) {
  const bridge = item.exports;
  const fullpath = item.fullpath;
  const workerHandles = target.handles;
  const workerMap = target.map;
  debug('loading item %j', item);
  item.properties.reduce((target, property, index) => {
    let obj;
    const properties = item.properties.slice(0, index + 1).join('.');
    if (index === item.properties.length - 1) {
      if (property in target) {
        if (!this.options.override) throw new Error(`can't overwrite property '${properties}' from ${target[property][FULLPATH]} by ${item.fullpath}`);
      }
      const config = {
        fullpath: item.fullpath,
        workerMap,
      };
      const timeout = parseInt(bridge.timeout);
      if (timeout && timeout > 0) config.timeout = timeout;
      obj = createBridgeHandle(config);
      if (obj && !is.primitive(obj)) {
        obj[FULLPATH] = item.fullpath;
        obj[EXPORTS] = true;
      }
    } else {
      obj = target[property] || {};
    }
    target[property] = obj;
    debug('loaded %s', properties);
    return obj;
  }, workerHandles);

  assert(is.class(bridge) || is.function(bridge.handle),
    `bridge(${fullpath}: bridge.handle should be function or bridge should be class`);

  let worker;
  if (is.class(bridge)) {
    worker = (ctx, ...args) => {
      const s = new bridge(ctx);
      s.bridge = app.toAsyncFunction(s.bridge);
      return s.bridge(...args);
    };
  } else {
    worker = app.toAsyncFunction(bridge.handle);
  }
  workerMap.set(fullpath, worker);
}
