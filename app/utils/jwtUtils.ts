import JwksRsa, { SigningKey, RsaSigningKey } from 'jwks-rsa';
import jwt, { JwtHeader, VerifyCallback } from 'jsonwebtoken';

import tokenConfig from '../config/tokenConfig';

const jwksClient = JwksRsa({
  jwksUri: tokenConfig.oauth.oauthHost + tokenConfig.oauth.jwks,
});

export function verifyToken(token: string, callback: VerifyCallback) {
  // 检查token是否正常
  jwt.verify(
    token,
    (header: JwtHeader, jwkCallback) => {
      jwksClient.getSigningKey(header.kid!, (_err: any, key: SigningKey) => {
        const signingKey = (key as RsaSigningKey).rsaPublicKey;
        jwkCallback(null, signingKey);
      });
    },
    callback
  );
}
