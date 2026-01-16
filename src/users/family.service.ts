import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Family } from './family.model';
import { FamilyMember } from './family-members.model';
import { UsersService } from './users.service';
import { InviteUserDto } from './dto/invite-user-to-family-dto';
import { JwtService } from '@nestjs/jwt';
import { InviteTokenData, ParsedInviteTokenData } from './types';
import { MailerCustomService } from '../mailer/mailer.service';
import { InviteFamilyMembers } from './invite-family-members.model';
import { AccessInviteUserDto } from './dto/access-invite-user-to-family-dto';
import { Member } from './member.model';
import { User } from './users.model';
import { DeleteUserFromFamilyDto } from './dto/delete-user-from-family-dto';
import { Op } from 'sequelize';

@Injectable()
export class FamilyService {
  readonly memberOwnerId: number;
  private readonly inviteSubPath: string;
  constructor(
    @InjectModel(Family) private familyRepository: typeof Family,
    @InjectModel(FamilyMember)
    private familyMemberRepository: typeof FamilyMember,
    @InjectModel(InviteFamilyMembers)
    private inviteFamilyMembers: typeof InviteFamilyMembers,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private mailerService: MailerCustomService,
    private jwtService: JwtService,
  ) {
    this.memberOwnerId = 1;
    this.inviteSubPath = '/family/invite';
  }

  async createFamilyForUser(userId: number) {
    const family = await this.createFamily(userId);
    return await this.addMemberToFamily(
      userId,
      family.id,
      this.memberOwnerId,
      userId,
    );
  }

  async addMemberToFamily(
    userId: number,
    familyId: number,
    memberId: number,
    invitedBy?: number,
  ) {
    try {
      return await this.familyMemberRepository.create({
        user_id: userId,
        family_id: familyId,
        member_id: memberId,
        invited_by: invitedBy || null,
        is_using: true,
      });
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async createFamily(userId: number) {
    try {
      return await this.familyRepository.create({
        owner_id: userId,
        is_using: true,
        name: 'Новая семья',
      });
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async getFamilyMembersWithoutUser(userId: number, familyId: number) {
    try {
      return await this.familyMemberRepository.findAll({
        where: { user_id: { [Op.ne]: userId }, family_id: familyId },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteFamily(familyId: number) {
    try {
      await this.familyRepository.update(
        { is_using: false },
        { where: { id: familyId } },
      );
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async makeAnotherUserOwner(userId: number, familyId: number) {
    const familyMembers = await this.getFamilyMembersWithoutUser(
      userId,
      familyId,
    );
    if (familyMembers.length) {
      const firstMember = familyMembers[0];
      await firstMember.update({ member_id: this.memberOwnerId });
      await this.familyRepository.update(
        { owner_id: firstMember.user_id },
        { where: { id: firstMember.family_id } },
      );
    } else {
      await this.deleteFamily(familyId);
    }
  }

  async deleteUserFromFamily(
    userId: number,
    familyId: number,
    needNewFamily: boolean = true,
  ) {
    try {
      const familyMember = await this.getUserFamily(userId, familyId);
      if (familyMember?.member_id === this.memberOwnerId) {
        await this.makeAnotherUserOwner(userId, familyId);
      }
      if (needNewFamily) {
        await this.createFamilyForUser(familyMember.user_id);
      }
      await familyMember.update({ is_using: false });
    } catch (e) {
      console.log(e);
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async getOwnerFamily(familyId: number) {
    try {
      const family = await this.familyRepository.findOne({
        where: { id: familyId },
      });
      return family.owner_id;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUserFromFamilyByOwner(
    ownerId: number,
    { userId, familyId }: DeleteUserFromFamilyDto,
  ) {
    const numericFamilyId = Number(familyId);
    const numericUserId = Number(userId);

    const familyOwner = await this.getOwnerFamily(numericFamilyId);
    if (ownerId === familyOwner) {
      await this.deleteUserFromFamily(numericUserId, numericFamilyId);
      return;
    }
    throw new HttpException(
      'Недостаточно прав для удаления пользователя',
      HttpStatus.BAD_REQUEST,
    );
  }

  makeInviteToken(data: InviteTokenData) {
    return this.jwtService.sign(data, { expiresIn: '3d' });
  }

  async sendInviteToEmail(email: string, userName: string, url: string) {
    try {
      await this.mailerService.sendFamilyInvite(email, userName, url);
    } catch {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async setInviteTokenToModel(token: string, userId: number) {
    try {
      await this.inviteFamilyMembers.create({
        token,
        invited_by: userId,
        is_using: true,
      });
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async inviteMemberToFamily(
    userId: number,
    { email, ...rest }: InviteUserDto,
  ) {
    const invitedUser = await this.usersService.getUserByEmail(email);
    if (!invitedUser) {
      throw new HttpException(
        'Пользователя с таким email не существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = this.makeInviteToken({
      userId: invitedUser.id,
      email,
      ...rest,
    });
    const inviteUrl = `${process.env.FRONTEND_URL}${this.inviteSubPath}?token=${token}`;
    await this.setInviteTokenToModel(token, userId);
    await this.sendInviteToEmail(email, invitedUser.login, inviteUrl);
    return;
  }

  makeParsedToken(token: string): ParsedInviteTokenData {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new HttpException(
        'Приглашение уже было использовано или срок действия истек',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async isUsedToken(token: string) {
    try {
      const inviteTokenRow = await this.inviteFamilyMembers.findOne({
        where: { token },
      });
      if (!inviteTokenRow.is_using) {
        throw new HttpException(
          'Приглашение уже было использовано',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await inviteTokenRow.update({ is_using: false });
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async addMemberFromToken({ token }: AccessInviteUserDto) {
    const { userId, familyId, memberId } = this.makeParsedToken(token);
    const inviteTokenRow = await this.isUsedToken(token);
    const hasUserFamily = await this.getUserFamily(userId);

    if (hasUserFamily) {
      await this.deleteUserFromFamily(userId, hasUserFamily.family_id, false);
    }

    await this.addMemberToFamily(
      userId,
      familyId,
      memberId,
      inviteTokenRow.invited_by,
    );
    return;
  }

  async getMembersByFamilyId(familyId: number) {
    try {
      return await this.familyRepository.findOne({
        where: {
          id: familyId,
          is_using: true,
        },
        attributes: ['id', 'name', ['owner_id', 'ownerId']],
        include: [
          {
            model: FamilyMember,
            as: 'members',
            attributes: ['id'],
            where: { is_using: true },
            include: [
              { model: Member, as: 'member', attributes: ['id', 'name'] },
              {
                model: User,
                as: 'user',
                attributes: ['id', 'email', 'login'],
              },
            ],
            order: [['member_id', 'ASC']],
          },
        ],
      });
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async getUserFamily(userId: number, familyId?: number) {
    const requiredParams = { user_id: userId, is_using: true };
    const whereClause = familyId
      ? { ...requiredParams, family_id: familyId }
      : requiredParams;

    try {
      return await this.familyMemberRepository.findOne({
        where: whereClause,
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getUsersIdsInFamily(familyId: number) {
    try {
      const users = await this.familyMemberRepository.findAll({
        where: {
          family_id: familyId,
          is_using: true,
        },
        attributes: ['user_id'],
      });
      return users.map(({ user_id }) => user_id);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getUserFamilyMembers(userId: number, onlyIds: boolean = false) {
    const userFamily = await this.getUserFamily(userId);
    if (!userFamily) {
      throw new HttpException(
        'У пользователя нет доступной семьи',
        HttpStatus.NOT_FOUND,
      );
    }
    return onlyIds
      ? await this.getUsersIdsInFamily(userFamily.family_id)
      : await this.getMembersByFamilyId(userFamily.family_id);
  }
}
