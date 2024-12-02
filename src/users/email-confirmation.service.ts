import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateConfirmEmailDto } from './dto/create-confirm-email-dto';
import { UsersService } from './users.service';
import { InjectModel } from '@nestjs/sequelize';
import { EmailConfirmation } from './email-confirmation.model';
import { createHmac } from 'crypto';
import * as process from 'node:process';
import { CreateConfirmCodeDto } from './dto/create-confirm-code-dto';
import { CreateChangePasswordDto } from './dto/create-change-password-dto';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private usersService: UsersService,
    @InjectModel(EmailConfirmation)
    private emailConfirmationRepository: typeof EmailConfirmation,
  ) {}

  async hasRowById(id: number) {
    const row = await this.emailConfirmationRepository.findOne({
      where: { user_id: id },
    });
    return row;
  }

  async confirmEmail({ email }: CreateConfirmEmailDto) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'Пользователя с таким email не существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.addConfirmationEmailRow(user.id, email);
  }

  generateRecoveryCode(): number {
    const recoveryCode = Math.floor(100000 + Math.random() * 900000);
    return recoveryCode;
  }

  generateToken(code: number): string {
    const hmac = createHmac('sha256', process.env.SECRET_KEY);
    const token = hmac.update(String(code)).digest('hex');

    return token;
  }

  async getRowById(id: number) {
    return await this.emailConfirmationRepository.findOne({ where: { id } });
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
      return { id: row.id, token: row.token };
    }
    throw new HttpException(
      'Неправильный код подтверждения, или его срок действия истек',
      HttpStatus.BAD_REQUEST,
    );
  }

  async getRowByPasswordDto({ token, id }: CreateChangePasswordDto) {
    return await this.emailConfirmationRepository.findOne({
      where: { token, id },
    });
  }

  async isVerified(id: number, email: string) {
    const verifiedRow = await this.emailConfirmationRepository.findOne({
      where: { id, email, is_used: true },
    });

    return verifiedRow;
  }

  async addConfirmationEmailRow(userId: number | null, email: string) {
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
    });

    return { id };
  }

  async confirmCode({ id, code }: CreateConfirmCodeDto) {
    const row = await this.getRowById(id);
    if (!row) {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее...',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.verifyCode(row, code);
  }
}
