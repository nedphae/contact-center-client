export type OauthToken = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  organizationId: number;
  jti: string;
};

export type AccessToken = {
  organizationId: number;
  user_name: string;
  scope: string[];
  exp: number;
  authorities: string[];
  jti: string;
  client_id: string;
};
