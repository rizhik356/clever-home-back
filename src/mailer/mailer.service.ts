import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerCustomService {
  constructor(private readonly mailerService: MailerService) {}

  private async sendMail(
    email: string,
    subject: string,
    template: string,
    context: object,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        template: template,
        context,
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async sendPasswordResetMail(email: string, recoveryCode: number) {
    await this.sendMail(email, 'Восстановление пароля', 'password-reset', {
      recoveryCode,
    });
    return;
  }

  async sendEmailConfirmation(email: string, verificationCode: number) {
    await this.sendMail(email, 'Верификация Email', 'email-confirm', {
      verificationCode,
    });
    return;
  }

  async sendFamilyInvite(email: string, userName: string, url: string) {
    await this.sendMail(email, 'Приглашение в семью', 'family-invite', {
      userName,
      url,
    });
    return;
  }
}
