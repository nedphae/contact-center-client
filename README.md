# 客服系统桌面客户端

基于 Electron + React 开发的客服系统客户端 

查看客服系统服务端开源项目：[gitee:contact-center](https://gitee.com/nedgao/contact-center-open.git) [github:contact-center](https://github.com/nedphae/contact-center)

其他项目 :

| 项目名称     | 项目地址                             | 详细说明                             |
| :---------: | :--------------------------------- | :--------------------------------- |
| 客服系统服务端 | [gitee:contact-center](https://gitee.com/nedgao/contact-center-open.git) [github:contact-center](https://github.com/nedphae/contact-center) | 基于 Spring Cloud 的高并发，高可用，全异步开源微服务客服系统 |
| 客服系统用户端 | [customer-web-client](https://github.com/nedphae/customer-web-client) | 客服系统用户端，基于 [ChatUI Pro](https://chatui.io/sdk/getting-started) 开发 |

### 特性

- 100% TypeScript
- 多平台支持，Win，MacOS，Linux
- 基于 material-design UI
- 接口全部使用 GraphQL

### 安装

需要先安装 Visual Studio + Python 环境
```bash
git clone https://github.com/nedphae/contact-center-client.git
cd contact-center-client
yarn
```
开发环境运行：
```bash
yarn start
```
生产环境打包：
```bash
yarn package
```
### 修改配置

在 [clientConfig](app/config/clientConfig.ts) 中修改后端服务地址
 