export interface OauthToken {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  oid: number;
  sid: number;
  jti: string;
}

export interface AccessToken {
  sub: string;
  scope: string[];
  oid: number;
  exp: number;
  // authorities: string[]
  auth: string
  jti: string;
  client_id: string;
  sid: number;
  source: string;
}
