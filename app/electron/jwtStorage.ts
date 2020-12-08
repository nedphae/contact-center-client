import os from 'os';
import storage from 'electron-json-storage';
import { verifyToken } from '../utils/jwtUtils';

import tokenConfig from '../config/tokenConfig';

storage.setDataPath(os.tmpdir());

export interface OauthToken {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  organizationId: number;
  jti: string;
}

export function saveToken(token: OauthToken) {
  verifyToken(token.access_token, (err: any, decoded: any) => {
    if (decoded) {
      localStorage.setItem(tokenConfig.oauth.accessTokenName, decoded);
      storage.set(tokenConfig.oauth.tokenName, token, (error) => {
        if (error) {
          throw error;
        }
      });
    }
    if (err) {
      localStorage.removeItem(tokenConfig.oauth.accessTokenName);
    }
  });
}

export async function getToken(): Promise<OauthToken> {
  return new Promise((resolve, reject) => {
    storage.get(tokenConfig.oauth.tokenName, (error, data) => {
      if (error) reject(error);
      resolve(data as OauthToken);
    });
  });
}

export function clearToken() {
  storage.remove(tokenConfig.oauth.tokenName, (error) => {
    throw error;
  });
}
