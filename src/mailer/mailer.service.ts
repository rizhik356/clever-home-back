import { Injectable } from '@nestjs/common';
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
    await this.mailerService.sendMail({
      to: email,
      subject,
      template: template,
      context,
    });
  }

  async sendPasswordResetMail(email: string, recoveryCode: number) {
    await this.sendMail(email, 'Восстановление пароля', 'password-reset', {
      recoveryCode,
    });
  }

  async sendEmailConfirmation(email: string, verificationCode: number) {
    await this.sendMail(email, 'Верификация Email', 'email-confirm', {
      verificationCode,
    });
  }
}
