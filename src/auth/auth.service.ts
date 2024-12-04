import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user-dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/users.model';
import { CreateSiginDto } from './dto/create-sign-in-dto';
import { CreateConfirmEmailDto } from '../users/dto/create-confirm-email-dto';
import { EmailConfirmationService } from '../users/email-confirmation.service';
import { CreateConfirmCodeDto } from '../users/dto/create-confirm-code-dto';
import { MailerCustomService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailConfirmationService: EmailConfirmationService,
    private mailerService: MailerCustomService,
  ) {}

  async signIn(userDto: CreateSiginDto) {
    const user = await this.validateUser(userDto);
    return this.generateToken(user);
  }

  async createPassword(password: string) {
    return await bcrypt.hash(password, 5);
  }

  async signUp(userDto: CreateUserDto) {
    const hasEmail = await this.usersService.getUserByEmail(userDto.email);
    const hasLogin = await this.usersService.getUserByLogin(userDto.login);
    const isVerified = await this.emailConfirmationService.isVerified(
      userDto.id,
      userDto.email,
    );

    if (hasEmail || hasLogin || !isVerified) {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const formatPassword = await this.createPassword(userDto.password);
    const user = await this.usersService.createUser({
      ...userDto,
      password: formatPassword,
    });
    return this.generateToken(user);
  }

  private async generateToken({ email, id }: User) {
    return { token: this.jwtService.sign({ email, id }) };
  }

  private async validateUser({ login, password }: CreateSiginDto) {
    const user =
      (await this.usersService.getUserByEmail(login)) ||
      (await this.usersService.getUserByLogin(login));

    const passwordEquals = user
      ? await bcrypt.compare(password, user?.password)
      : false;

    if (user && passwordEquals) {
      return user;
    }
    throw new UnauthorizedException({ message: 'Неверный логин или пароль' });
  }

  async confirmEmail({ email }: CreateConfirmEmailDto) {
    const { id, recoveryCode } =
      await this.emailConfirmationService.addConfirmationEmailRow(null, email);
    await this.mailerService.sendEmailConfirmation(email, recoveryCode);
    return { id };
  }

  async confirmCode(data: CreateConfirmCodeDto) {
    const { id } = await this.emailConfirmationService.confirmCode(data);
    return { id };
  }
}
