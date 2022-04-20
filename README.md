# 客服系统桌面客户端

基于 Electron + React 开发的客服系统客户端 

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
 