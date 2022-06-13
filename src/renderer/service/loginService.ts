import axios from 'axios';
import { OauthToken, AccessToken } from 'renderer/domain/OauthToken';
import clientConfig from 'renderer/config/clientConfig';
import { clearToken, saveToken } from 'renderer/electron/jwtStorage';
import addParam from 'renderer/utils/url';
import apolloClient from 'renderer/utils/apolloClient';

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
  };
  const url = addParam(
    clientConfig.web.host + clientConfig.oauth.path,
    oauthParam
  );
  const bodyFormData = new FormData();
  bodyFormData.append('username', param.username);
  bodyFormData.append('password', param.password);
  const result = await axios.post<OauthToken>(url, bodyFormData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: clientConfig.headers.Authorization,
    },
  });
  return saveToken(result.data, save);
}

export async function logout() {
  await apolloClient.clearStore();
  clearToken();
}
