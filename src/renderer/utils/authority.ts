// use localStorage to store the authority info, which might be sent from server in actual project.

// 删除 antd-pro-authority
// 放在这里为了 js 初始化读取代码时就删除 antd-pro-authority
localStorage.removeItem('antd-pro-authority');

export function getAuthority(str?: string): string | string[] {
  const authorityString =
    typeof str === 'undefined' && localStorage
      ? localStorage.getItem('antd-pro-authority')
      : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    if (authorityString) {
      authority = JSON.parse(authorityString);
    }
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  // preview.pro.ant.design only do not use in your production.
  // preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
  // if (!authority) {
  //   return ['admin'];
  // }
  return authority;
}

export function setAuthority(authority: string | string[]): void {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
  // auto reload
  window.reloadAuthorized();
}
