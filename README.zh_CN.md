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

## 依赖说明

### 依赖的 egg 版本

egg-bridge 版本 | egg 2.x
--- | ---
2.x | 😁
0.x | ❌

## 开启插件

```js
// config/plugin.js
exports.bridge = {
  enable: true,
  package: 'egg-bridge',
};
```

## 使用场景

- egg-bridge是为了解决agent进程和worker进程之间互相调用函数而存在的
- 可以在agent进程里使用`await agent.bridge().handle()`的形式，在一个随机的worker进程里执行提前定义好的Bridge函数，并得到返回值。
- 也可以在worker进程里使用`await app.bridge().handle()`的形式，让agent进程执行对应的函数，并得到返回值。
- 每个Bridge文件在bridge()上挂载的都是一个函数，为此要求Bridge类继承Egg.BaseContextClass，并且定义入口函数`async bridge()`。
- Bridge类在worker进程里创建了一个匿名的context，所以可以在内部使用`this.service`的形式调用service，但在agent进程里没有service。
- `bridge(ctx)`里的ctx是一个可序列化的对象，可以被传递到Bridge类里的this.ctx上，例如`bridge({me})`形式调用，那么Bridge类里可以使用this.ctx.me。
- `bridge(ctx,FLAG)`里的FLAG可以设定为**nowait** 或 **self**，使用字符串标识。
- 当只需要通知进程执行对应的逻辑，而不关注执行结果时，可以标识FLAG为`"nowait"`，此时bridge返回结果为空。
- 当需要在本进程内执行对应的逻辑，用以复用相应代码时，可以标识FLAG为`"self"`，可以拿到函数的返回值。
- 由于多进程通讯是异步的，所有调用的返回值都是一个promise（标识为`"self"`同样），所以需要使用await或者then来进行下一步。
- 可以在config.default.js里配置一个timeout，用以指定跨进程调用的等待时间，当超过这个时间以后，会抛出timeout的错误。有FLAG的调用下，无视此配置。
- 也可以在Bridge类里指定一个`static timeout`的配置，用以指定此Bridge的等待时间，它会覆盖默认配置。有FLAG的调用下，无视此配置。

## 详细配置

请到 [config/config.default.js](config/config.default.js) 查看详细配置项说明。

## API

在worker进程下调用：

```js
// 在agent进程下执行handle，并获取结果。
await app.bridge().handle()
// 在agent进程下执行handle，并获取结果。在handle里可以使用this.ctx访问到指定的配置
await app.bridge(ctx).handle()
// 在agent进程下执行handle，不等待执行结果。
app.bridge('nowait').handle()
// 在agent进程下执行handle，不等待执行结果。在handle里可以使用this.ctx访问到指定的配置
app.bridge(ctx,'nowait').handle()
// 在本worker进程下执行handle。
await app.bridge('self').handle()
// 在本worker进程下执行handle。在handle里可以使用this.ctx访问到指定的配置
await app.bridge(ctx,'self').handle()
// 在agent进程下执行位于package下的handle，并获取结果。
await app.bridge().package.subpackage.handle()
```

call from agent process:

```js
// 在随机worker进程下执行handle，并获取结果。
await agent.bridge().handle()
// 在随机worker进程下执行handle，并获取结果。在handle里可以使用this.ctx访问到指定的配置
await agent.bridge(ctx).handle()
// 在随机worker进程下执行handle，不等待执行结果。
agent.bridge('nowait').handle()
// 在随机worker进程下执行handle，不等待执行结果。在handle里可以使用this.ctx访问到指定的配置
agent.bridge(ctx,'nowait').handle()
// 在agent进程下执行handle。
await agent.bridge('self').handle()
// 在agent进程下执行handle。在handle里可以使用this.ctx访问到指定的配置
await agent.bridge(ctx,'self').handle()
// 在随机worker进程下执行位于package下的handle，并获取结果。
await agent.bridge().package.subpackage.handle()
```

## 示例

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
可以用 [example/app/bridge](example/app/bridge) 示例代码做为参考
## 提问交流

请到 [egg issues](https://github.com/eggjs/egg/issues) 异步交流。

## License

[MIT](LICENSE)
