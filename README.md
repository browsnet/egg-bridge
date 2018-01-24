# egg-bridge

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-bridge.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-bridge
[travis-image]: https://img.shields.io/travis/eggjs/egg-bridge.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-bridge
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-bridge.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-bridge?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-bridge.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-bridge
[snyk-image]: https://snyk.io/test/npm/egg-bridge/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-bridge
[download-image]: https://img.shields.io/npm/dm/egg-bridge.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-bridge

<!--
Description here.
-->

## Install

```bash
$ npm i egg-bridge --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.bridge = {
  enable: true,
  package: "egg-bridge"
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.bridge = {
  timeout: 3000
};
```

```js
// {app_root}/app/bridge/handle.js
const { BaseContextClass } = require("egg");
class Handle extends BaseContextClass {
  async bridge(...args) {
    return args;
  }
}
module.exports = Handle;
```

see [config/config.default.js](config/config.default.js) for more detail.

## API

call from worker process:

```js
// wait agent process handle result
await app.bridge().handle()
// wait agent process handle result,with ctx
await app.bridge(ctx).handle()
// just execute agent process handle
app.bridge('nowait').handle()
// just execute agent process handle,with ctx
app.bridge(ctx,'nowait').handle()
// execlute handle in this process
await app.bridge('self').handle()
// execlute handle in this process,with ctx
await app.bridge(ctx,'self').handle()
// wait agent process handle result,in package
await app.bridge().package.subpackage.handle()
```

call from agent process:

```js
// wait random worker process handle result
await agent.bridge().handle()
// wait random worker process handle result,with ctx
await agent.bridge(ctx).handle()
// just execute random worker process handle
agent.bridge('nowait').handle()
// just execute random worker process handle,with ctx
agent.bridge(ctx,'nowait').handle()
// execlute handle in agent process
await agent.bridge('self').handle()
// execlute handle in agent process,with ctx
await agent.bridge(ctx,'self').handle()
// wait random worker process handle result,in package
await agent.bridge().package.subpackage.handle()
```

## Example

```js
// {app_root}/app/bridge/hello.js
const { BaseContextClass } = require('egg');
class Hello extends BaseContextClass {
  // optional
  static get timeout(){
    return 2000;
  }
  bridge(name) {
    return this.service.echo.hello(name);
  }
}

module.exports = Hello

// {app_root}/app/service/echo.js
const { Service } = require('egg');
const sleep = time => new Promise(resolve => setTimeout(resolve, time));
class EchoService extends Service {
  async hello(name) {
    await sleep(1500);
    return `hello ${name}`;
  }
}

module.exports = EchoService;


// agent.js
module.exports = agent => {
  agent.messenger.on('egg-ready', async () => {
    const ret = await agent.bridge().hello('world');
    console.log(ret);
  });
};

```
see [example/app/bridge](example/app/bridge) for more detail.

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
