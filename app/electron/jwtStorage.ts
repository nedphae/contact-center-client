import os from 'os';
import storage from 'electron-json-storage';
import { verifyToken } from 'app/utils/jwtUtils';
import { OauthToken, AccessToken } from 'app/domain/OauthToken';
import tokenConfig from 'app/config/clientConfig';

storage.setDataPath(os.tmpdir());

const jwtMap = new Map<string, OauthToken>();

export function saveToken(token: OauthToken): Promise<AccessToken> {
  return new Promise<AccessToken>((resolve, reject) => {
    verifyToken(token.access_token, (err: unknown, decoded: unknown) => {
      if (decoded) {
        // storage 保存整个 jwt， localStorage 保存 access_token
        jwtMap.set(tokenConfig.oauth.tokenName, token);
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
    const token = jwtMap.get(tokenConfig.oauth.tokenName);
    if (token) {
      resolve(token);
    }
    storage.get(tokenConfig.oauth.tokenName, (error, data) => {
      if (error) reject(error);
      jwtMap.set(tokenConfig.oauth.tokenName, data as OauthToken);
      resolve(data as OauthToken);
    });
  });
}

export function clearToken() {
  jwtMap.clear();
  storage.remove(tokenConfig.oauth.tokenName, (error) => {
    throw error;
  });
}
