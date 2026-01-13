import { Response } from 'express';

export interface AccessTokenData {
  login: string;
  id: number;
  email: string;
}

export interface GetUserTokenDataProps {
  access_token: string;
  refresh_token: string;
  user_id: number;
}

export interface UserTokenData {
  access_token: string;
  refresh_token: string;
  user_id?: number;
}

export interface AccessTokenParsedData extends AccessTokenData {
  iat: number;
  exp: number;
}

export type ParsedResponse = Response & {
  user: AccessTokenParsedData;
};
