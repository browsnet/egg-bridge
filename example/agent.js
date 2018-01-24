'use strict';

module.exports = agent => {
  agent.messenger.on('egg-ready', async () => {
    const ret = await agent.bridge().hello('world');
    agent.logger.info('in agent :', ret);
    const bridge = agent.bridge({ username: 'browsnet' }, 'nowait');
    bridge.package.subpackage.handle(100);
  });
};
