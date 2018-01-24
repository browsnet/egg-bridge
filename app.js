'use strict';
const createBridge = require('./lib/bridge');

module.exports = app => {
  app.bridge = createBridge(app, false);
};
