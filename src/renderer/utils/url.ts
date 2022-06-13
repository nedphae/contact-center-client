interface UrlParams {
  [key: string]: string | number | boolean;
}

const addParam = (uri: string, params: UrlParams) => {
  let str = '';
  Object.keys(params).forEach((key) => {
    if (str !== '') {
      str += '&';
    }
    str += `${key}=${encodeURIComponent(params[key])}`;
  });
  return `${uri}?${str}`;
};

export default addParam;
