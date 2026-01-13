import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

@Injectable()
export class FamilyService {
  private readonly memberOwnerId: number;
  private readonly inviteSubPath: string;
  constructor(
    @InjectModel(Family) private familyRepository: typeof Family,
    @InjectModel(FamilyMember)
    private familyMemberRepository: typeof FamilyMember,
    @InjectModel(InviteFamilyMembers)
    private inviteFamilyMembers: typeof InviteFamilyMembers,
    private usersService: UsersService,
    private mailerService: MailerCustomService,
    private jwtService: JwtService,
  ) {
    this.memberOwnerId = 1;
    this.inviteSubPath = '/invite';
  }

  async createFamilyForUser(userId: number) {
    const family = await this.createFamily(userId);
    return await this.addMemberToFamily(userId, family.id, this.memberOwnerId);
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
    } catch {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createFamily(userId: number) {
    try {
      return await this.familyRepository.create({
        owner_id: userId,
        is_using: true,
        name: 'Новая семья',
      });
    } catch {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteUserFromFamily(
    userId: number,
    familyId: number,
    ownerDelete: false,
  ) {
    try {
      const familyMember = await this.familyMemberRepository.findOne({
        where: { user_id: userId, family_id: familyId, is_using: true },
      });

      if (familyMember?.member_id === this.memberOwnerId && !ownerDelete) {
        throw new HttpException(
          'Нельзя удалить админимтратора',
          HttpStatus.BAD_REQUEST,
        );
      }
      await familyMember.update({ is_using: false });
      await this.createFamilyForUser(familyMember.user_id);
    } catch {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее',
        HttpStatus.BAD_REQUEST,
      );
    }
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
    } catch {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее',
        HttpStatus.BAD_REQUEST,
      );
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
    const inviteUrl = `${process.env.FRONTEND_URL}${this.inviteSubPath}/${token}`;
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
    } catch {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async addMemberFromToken({ token }: AccessInviteUserDto) {
    const { userId, familyId, memberId } = this.makeParsedToken(token);
    const inviteTokenRow = await this.isUsedToken(token);

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
        },
        attributes: ['id', 'name', ['owner_id', 'ownerId']],
        include: [
          {
            model: FamilyMember,
            as: 'members',
            attributes: ['id'],
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
    } catch {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserFamilyMembers(userId: number) {
    try {
      const userFamily = await this.familyMemberRepository.findOne({
        where: {
          user_id: userId,
          is_using: true,
        },
      });
      if (!userFamily) {
        throw new HttpException(
          'У пользователя нет доступной семьи',
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.getMembersByFamilyId(userFamily.family_id);
    } catch {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
