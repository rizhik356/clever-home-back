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
import { randomBytes } from 'crypto';
import { AccessTokenData, GetUserTokenDataProps, UserTokenData } from './types';
import { InjectModel } from '@nestjs/sequelize';
import { AuthTokens } from './auth.model';
import { Op } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailConfirmationService: EmailConfirmationService,
    private mailerService: MailerCustomService,
    @InjectModel(AuthTokens) private authTokens: typeof AuthTokens,
  ) {}

  async signIn(userDto: CreateSiginDto) {
    const user = await this.validateUser(userDto);
    return await this.addNewTokens(user);
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
    const tokens = this.generateTokens(user);
    await this.addUserTokenRow({ ...tokens, user_id: user.id });

    return tokens;
  }

  private makeRefreshExpires() {
    return new Date(Date.now() + 86400000).toISOString();
  }

  private generateAccessToken(data: AccessTokenData) {
    return this.jwtService.sign(data, { expiresIn: '15m' });
  }

  private generateRefreshToken() {
    return randomBytes(32).toString('hex');
  }

  private async getUserTokenRow({
    access_token,
    user_id,
    refresh_token,
  }: GetUserTokenDataProps) {
    return await this.authTokens.findOne({
      where: {
        access_token,
        refresh_token,
        user_id,
        refresh_token_expires_at: {
          [Op.gt]: Date.now(), // Проверка, что expires_at больше текущего времени
        },
      },
    });
  }

  private async updateUserTokenRow(
    userTokenRow: AuthTokens,
    data: UserTokenData,
  ) {
    await userTokenRow.update(data);
  }

  private async addUserTokenRow(data: UserTokenData) {
    await this.authTokens.create({
      ...data,
      refresh_token_expires_at: this.makeRefreshExpires(),
    });
  }

  private generateTokens({ login, id, email }: User) {
    const access_token = this.generateAccessToken({ login, id, email });
    const refresh_token = this.generateRefreshToken();

    return { access_token, refresh_token };
  }

  private async addNewTokens(user: User) {
    const userTokenRow = await this.authTokens.findOne({
      where: { user_id: user.id },
    });
    const tokens = this.generateTokens(user);

    await userTokenRow.update({
      ...tokens,
      refresh_token_expires_at: this.makeRefreshExpires(),
    });

    return tokens;
  }

  async refreshTokens(data: GetUserTokenDataProps) {
    const userTokenRow = await this.getUserTokenRow(data);
    if (userTokenRow) {
      const user = await this.usersService.getUserById(data.user_id);
      const tokens = this.generateTokens(user);
      await this.updateUserTokenRow(userTokenRow, tokens);

      return tokens;
    }
    throw new HttpException('Невалидный refresh_token', HttpStatus.BAD_REQUEST);
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
    const user = await this.usersService.getUserByEmail(email);
    if (user) {
      throw new HttpException(
        'Пользователь с таким Email уже существует',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
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
