import JwksRsa, { SigningKey, RsaSigningKey } from 'jwks-rsa';
import jwt, { JwtHeader, VerifyCallback } from 'jsonwebtoken';

import tokenConfig from '../config/clientConfig';

const jwksClient = JwksRsa({
  jwksUri: tokenConfig.web.host + tokenConfig.oauth.jwks,
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

export function decodeToken(token: string): unknown {
  return jwt.decode(token);
}
