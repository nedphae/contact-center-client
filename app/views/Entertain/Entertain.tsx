/** ！
 * 咨询接待页面
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';

import ChatApp from '../../components/Chat/ChatApp';
import getData from '../../chat/localStorage';
import setCssVariable from '../../utils/setCssVariable';

// 注册 Service Worker
if (window.location.protocol === 'https:' && navigator.serviceWorker) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/fiora-sw.js');
  });
}

// 更新 css variable
const { primaryColor, primaryTextColor } = getData();
setCssVariable(primaryColor, primaryTextColor);

// 请求 Notification 授权
if (
  window.Notification &&
  (window.Notification.permission === 'default' ||
    window.Notification.permission === 'denied')
) {
  window.Notification.requestPermission();
}

export default function Entertain() {
  return <ChatApp />;
}
