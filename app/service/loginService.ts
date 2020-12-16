import axios from 'axios';
import { OauthToken, AccessToken } from 'app/domain/OauthToken';
import tokenConfig from 'app/config/clientConfig';
import { saveToken } from 'app/electron/jwtStorage';

/**
 * 配置全局的 header 和过滤器
 */

export interface LoginParamsType {
  readonly org_id: number;
  readonly username: string;
  readonly password: string;
}

interface OauthParams {
  grant_type: string;
  org_id: number;
  username: string;
  password: string;
}

const parseParams = (uri: string, params: any) => {
  let str = '';
  Object.keys(params).forEach((key) => {
    if (str !== '') {
      str += '&';
    }
    str += `${key}=${encodeURIComponent(params[key])}`;
  });
  return `${uri}?${str}`;
};

export async function oauthLogin(param: LoginParamsType): Promise<AccessToken> {
  const oauthParam: OauthParams = {
    grant_type: tokenConfig.oauth.grant_type,
    org_id: param.org_id,
    username: param.username,
    password: param.password,
  };
  const url = parseParams(
    tokenConfig.web.host + tokenConfig.oauth.oauthPath,
    oauthParam
  );
  const result = await axios.post<OauthToken>(url, null, {
    headers: {
      Authorization: tokenConfig.headers.Authorization,
    },
  });
  return saveToken(result.data);
}
