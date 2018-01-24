'use strict';
const createBridge = require('./lib/bridge');

module.exports = agent => {
  agent.bridge = createBridge(agent, true);
};
