import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { EmailConfirmation } from './email-confirmation.model';
import { EmailConfirmationService } from './email-confirmation.service';
import { ChangePasswordService } from './change-password.service';
import { AuthModule } from '../auth/auth.module';
import { MailerCustomModule } from '../mailer/mailer.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, EmailConfirmationService, ChangePasswordService],
  imports: [
    SequelizeModule.forFeature([User, EmailConfirmation]),
    forwardRef(() => AuthModule),
    MailerCustomModule,
  ],
  exports: [UsersService, EmailConfirmationService],
})
export class UsersModule {}
