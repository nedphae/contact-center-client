import JwksRsa, { SigningKey, RsaSigningKey } from 'jwks-rsa';
import jwt, { JwtHeader, VerifyCallback, VerifyErrors } from 'jsonwebtoken';

import { AccessToken } from 'app/domain/OauthToken';
import tokenConfig from '../config/clientConfig';

const jwksClient = JwksRsa({
  jwksUri: tokenConfig.web.host + tokenConfig.oauth.jwks,
  cache: true,
});

export default function verifyToken(token: string, callback: VerifyCallback) {
  // 检查token是否正常
  jwt.verify(
    token,
    (header: JwtHeader, jwkCallback) => {
      jwksClient.getSigningKey(header.kid!, (_err: any, key: SigningKey) => {
        if (key) {
          const signingKey = (key as RsaSigningKey).rsaPublicKey;
          jwkCallback(null, signingKey);
        } else {
          jwkCallback('key undefined', undefined);
        }
      });
    },
    callback
  );
}

export function verifyTokenPromise(
  token: string,
  interval = 0
): Promise<undefined> {
  return new Promise<undefined>((resolve, reject) => {
    verifyToken(token, (err: VerifyErrors | null, decoded: unknown) => {
      if (decoded) {
        const accessToken = decoded as AccessToken;
        accessToken.source = token;
        const now = new Date().getTime();
        if (accessToken.exp * 1000 < now + interval) {
          reject(new Error('token will be expired'));
        } else {
          resolve(undefined);
        }
      }
      if (err) {
        // 验证失败就删除 权限
        localStorage.removeItem('antd-pro-authority');
        reject(err);
      }
    });
  });
}

export function decodeToken(token: string): unknown {
  return jwt.decode(token);
}
