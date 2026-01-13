import { InviteUserDto } from './dto/invite-user-to-family-dto';

export type InviteTokenData = InviteUserDto & {
  userId: number;
};

export type ParsedInviteTokenData = InviteTokenData & {
  exp: number;
  iat: number;
};
