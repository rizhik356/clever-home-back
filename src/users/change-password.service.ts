import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmailConfirmationService } from './email-confirmation.service';
import { CreateChangePasswordDto } from './dto/create-change-password-dto';
import { UsersService } from './users.service';
import { User } from './users.model';
import { AuthService } from '../auth/auth.service';
import { CookieOptions, Response } from 'express';

@Injectable()
export class ChangePasswordService {
  constructor(
    private emailConfirmationService: EmailConfirmationService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  private async changePassword(user: User, password: string) {
    user.password = await this.authService.createPassword(password);
    await user.save();
  }

  async updatePasswordFromDto(
    dto: CreateChangePasswordDto,
    id: number,
    token: string,
    res: Response,
  ) {
    const row = await this.emailConfirmationService.getRowByIdAndToken(
      id,
      token,
    );
    if (row) {
      const user = await this.usersService.getUserById(row.user_id);
      if (user) {
        await this.changePassword(user, dto.password);
        console.log(process.env.NODE_ENV);
        const cookieOptions: CookieOptions = {
          maxAge: -1,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        };
        res.cookie('id', id, cookieOptions);
        res.cookie('token', token, cookieOptions);
        return { message: 'Пароль был успешно изменен' };
      }
    }
    throw new HttpException(
      'Код подтверждения был использован, или его срок действия истек',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
