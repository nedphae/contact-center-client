import axios from 'axios';
import { OauthToken, AccessToken } from 'app/domain/OauthToken';
import clientConfig from 'app/config/clientConfig';
import { clearToken, saveToken } from 'app/electron/jwtStorage';
import addParam from 'app/utils/url';
import { history } from 'app/store';

/**
 * 配置全局的 header 和过滤器
 */

export interface LoginParamsType {
  readonly org_id: number;
  readonly username: string;
  readonly password: string;
}

export async function oauthLogin(
  param: LoginParamsType,
  save: boolean
): Promise<AccessToken> {
  const oauthParam = {
    grant_type: clientConfig.oauth.grant_type,
    org_id: param.org_id,
    username: param.username,
    password: param.password,
  };
  const url = addParam(
    clientConfig.web.host + clientConfig.oauth.path,
    oauthParam
  );
  const result = await axios.post<OauthToken>(url, null, {
    headers: {
      Authorization: clientConfig.headers.Authorization,
    },
  });
  return saveToken(result.data, save);
}

export function logout() {
  clearToken();
  history.push('/login');
}
