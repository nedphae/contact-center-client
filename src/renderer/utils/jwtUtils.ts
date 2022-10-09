import * as jose from 'jose';

import { AccessToken } from 'renderer/domain/OauthToken';
import tokenConfig from '../config/clientConfig';

const JWKS = jose.createRemoteJWKSet(
  new URL(tokenConfig.web.host + tokenConfig.oauth.jwks)
);

export default async function verifyToken(
  jwtToken: string,
): Promise<AccessToken> {
  const { payload } = await jose.jwtVerify(jwtToken, JWKS);
  return payload as unknown as AccessToken;
}

export async function verifyTokenPromise(
  token: string,
  interval = 0,
): Promise<AccessToken | undefined> {
  const decoded = await verifyToken(token);
  const accessToken = decoded;
  accessToken.source = token;
  const now = new Date().getTime();
  if (accessToken.exp * 1000 < now + interval) {
    throw new Error('token will be expired');
  } else {
    return undefined;
  }
}

export function decodeToken(token: string): unknown {
  return jose.decodeJwt(token);
}
