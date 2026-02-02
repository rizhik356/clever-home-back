import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { EmailConfirmation } from './email-confirmation.model';
import { EmailConfirmationService } from './email-confirmation.service';
import { ChangePasswordService } from './change-password.service';
import { AuthModule } from '../auth/auth.module';
import { MailerModule } from '../mailer/mailer.module';
import { Family } from './family.model';
import { FamilyService } from './family.service';
import { FamilyMember } from './family-members.model';
import { Member } from './member.model';
import { InviteFamilyMembers } from './invite-family-members.model';
import { FamilyController } from './family.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [UsersController, FamilyController],
  providers: [
    UsersService,
    EmailConfirmationService,
    ChangePasswordService,
    FamilyService,
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    SequelizeModule.forFeature([
      User,
      EmailConfirmation,
      Family,
      FamilyMember,
      Member,
      InviteFamilyMembers,
    ]),
    forwardRef(() => AuthModule),
    MailerModule,
  ],
  exports: [UsersService, EmailConfirmationService, FamilyService],
})
export class UsersModule {}
