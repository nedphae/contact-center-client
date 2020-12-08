import axios from 'axios';
import tokenConfig from '../config/tokenConfig';
import { saveToken, OauthToken } from '../electron/jwtStorage';

/**
 * 配置全局的 header 和过滤器
 */

export interface LoginParamsType {
  org_id: number;
  username: string;
  password: string;
}

interface OauthParams {
  grant_type: string;
  org_id: number;
  username: string;
  password: string;
}

const parseParams = (uri: string, params: any) => {
  const paramsArray: any = [];
  Object.keys(params).forEach(
    (key) => params[key] && paramsArray.push(`${key}=${params[key]}`)
  );
  if (uri.search(/\?/) === -1) {
    uri += `?${paramsArray.join('&')}`;
  } else {
    uri += `&${paramsArray.join('&')}`;
  }
  return uri;
};

export async function oauthLogin(param: LoginParamsType): Promise<string> {
  const oauthParam: OauthParams = {
    grant_type: tokenConfig.oauth.grant_type,
    org_id: param.org_id,
    username: param.username,
    password: param.password,
  };
  const url = parseParams(
    tokenConfig.oauth.oauthHost + tokenConfig.oauth.oauthPath,
    oauthParam
  );
  const result = await axios.post<OauthToken>(url, null, {
    headers: {
      Authorization: tokenConfig.headers.Authorization,
    },
  });
  saveToken(result.data);
  return result.data.access_token;
}
