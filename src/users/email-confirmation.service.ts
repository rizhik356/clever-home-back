import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateConfirmEmailDto } from './dto/create-confirm-email-dto';
import { UsersService } from './users.service';
import { InjectModel } from '@nestjs/sequelize';
import { EmailConfirmation } from './email-confirmation.model';
import { createHmac } from 'crypto';
import * as process from 'node:process';
import { CreateConfirmCodeDto } from './dto/create-confirm-code-dto';
import { MailerCustomService } from '../mailer/mailer.service';
import { CookieOptions, Response } from 'express';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private usersService: UsersService,
    @InjectModel(EmailConfirmation)
    private emailConfirmationRepository: typeof EmailConfirmation,
    private mailService: MailerCustomService,
  ) {}

  async hasRowById(id: number) {
    return await this.emailConfirmationRepository.findOne({
      where: { user_id: id },
    });
  }

  async confirmEmail({ email }: CreateConfirmEmailDto, res: Response) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'Пользователя с таким email не существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { id, recoveryCode } = await this.addConfirmationEmailRow(
      user.id,
      email,
      false,
    );
    await this.mailService.sendPasswordResetMail(email, recoveryCode);
    res.cookie('emailConfirmationId', id, {
      maxAge: 3600000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { id };
  }

  generateRecoveryCode(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  generateToken(code: number): string {
    const hmac = createHmac('sha256', process.env.SECRET_KEY);
    return hmac.update(String(code)).digest('hex');
  }

  async getRowById(id: number) {
    return await this.emailConfirmationRepository.findOne({ where: { id } });
  }

  async getRowByUserId(userId: number) {
    try {
      return await this.emailConfirmationRepository.findOne({
        where: { user_id: userId },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async getRowByEmail(email: string) {
    return await this.emailConfirmationRepository.findOne({ where: { email } });
  }

  async verifyCode(row: EmailConfirmation, code: number) {
    const currentTime = new Date().getTime();
    const expirationTime = new Date(row.expires_at).getTime();

    const codeTrue = row.confirmation_code === code;
    const canUse = !row.is_used;
    const timeTrue = currentTime < expirationTime;

    if (codeTrue && canUse && timeTrue) {
      row.is_used = true;
      await row.save();
      return { id: row.id, token: row.token, userId: row.user_id };
    }
    throw new HttpException(
      'Неправильный код подтверждения, или его срок действия истек',
      HttpStatus.BAD_REQUEST,
    );
  }

  async getRowByIdAndToken(id: number, token: string) {
    return await this.emailConfirmationRepository.findOne({
      where: { token, id, is_token_used: false },
    });
  }

  async isVerified(id: number, email: string) {
    return await this.emailConfirmationRepository.findOne({
      where: { id, email, is_used: true },
    });
  }

  async addConfirmationEmailRow(
    userId: number | null,
    email: string,
    needToken: boolean,
  ) {
    const currentRow = userId
      ? await this.hasRowById(userId)
      : await this.getRowByEmail(email);
    const recoveryCode = this.generateRecoveryCode();
    const token = this.generateToken(recoveryCode);
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    if (currentRow) {
      await currentRow.destroy();
    }

    const { id } = await this.emailConfirmationRepository.create({
      user_id: userId,
      email,
      confirmation_code: recoveryCode,
      is_used: false,
      token: token,
      expires_at: expiresAt,
      is_token_used: needToken,
    });

    return { id, recoveryCode };
  }

  async confirmCodeByRequest(
    dto: CreateConfirmCodeDto,
    id: number,
    res: Response,
  ) {
    const verifyRow = await this.confirmCode(dto, id);
    const cookieOptions: CookieOptions = {
      maxAge: 3600000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };
    res.cookie('id', verifyRow.id, cookieOptions);
    res.cookie('token', verifyRow.token, cookieOptions);
    return;
  }

  async confirmCode({ code }: CreateConfirmCodeDto, id: number) {
    try {
      const row = await this.getRowById(id);
      if (!row) {
        throw new HttpException(
          'Произошла ошибка, попробуйте позднее...',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.verifyCode(row, code);
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
