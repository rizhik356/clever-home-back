import { Injectable } from '@nestjs/common';
import { EmailConfirmationService } from './email-confirmation.service';
import { CreateChangePasswordDto } from './dto/create-change-password-dto';
import { UsersService } from './users.service';
import { User } from './users.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ChangePasswordService {
  constructor(
    private emailConfirmationService: EmailConfirmationService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  private async changePassword(user: User, password: string) {
    const formatPassword = await this.authService.createPassword(password);
    user.password = formatPassword;
    await user.save();
  }

  async updatePasswordFromDto(dto: CreateChangePasswordDto) {
    const row = await this.emailConfirmationService.getRowByPasswordDto(dto);
    if (row) {
      const user = await this.usersService.getUserById(row.user_id);
      await this.changePassword(user, dto.password);
    }
  }
}
