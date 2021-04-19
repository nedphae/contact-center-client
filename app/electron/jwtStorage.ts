import os from 'os';
import storage from 'electron-json-storage';
import verifyToken from 'app/utils/jwtUtils';
import { OauthToken, AccessToken } from 'app/domain/OauthToken';
import tokenConfig from 'app/config/clientConfig';

storage.setDataPath(os.tmpdir());

export function saveToken(token: OauthToken): Promise<AccessToken> {
  return new Promise<AccessToken>((resolve, reject) => {
    verifyToken(token.access_token, (err: unknown, decoded: unknown) => {
      if (decoded) {
        // storage 保存整个 jwt， localStorage 保存 access_token
        localStorage.setItem(
          tokenConfig.oauth.tokenName,
          JSON.stringify(token)
        );
        storage.set(tokenConfig.oauth.tokenName, token, (error) => {
          if (error) {
            reject(err);
          }
        });
        return resolve(decoded as AccessToken);
      }
      return reject(err);
    });
  });
}

export function getToken(): Promise<OauthToken> {
  return new Promise((resolve, reject) => {
    // 把 token 保存到 localStorage
    const token = localStorage.getItem(tokenConfig.oauth.tokenName);
    if (token) {
      resolve(JSON.parse(token) as OauthToken);
    }
    storage.get(tokenConfig.oauth.tokenName, (error, data) => {
      if (error) reject(error);
      localStorage.setItem(tokenConfig.oauth.tokenName, JSON.stringify(data));
      resolve(data as OauthToken);
    });
  });
}

export function clearToken() {
  localStorage.removeItem(tokenConfig.oauth.tokenName);
  storage.remove(tokenConfig.oauth.tokenName, (error) => {
    throw error;
  });
}
