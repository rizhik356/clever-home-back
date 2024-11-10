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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async sigIn(userDto: CreateSiginDto) {
    const user = await this.validateUser(userDto);
    return this.generateToken(user);
  }

  async signUp(userDto: CreateUserDto) {
    const hasEmail = await this.usersService.getUserByEmail(userDto.email);
    const hasLogin = await this.usersService.getUserByEmail(userDto.email);
    if (hasEmail && hasLogin) {
      throw new HttpException(
        'Пользователь с таким email уже сущетсвует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hasPassword = await bcrypt.hash(userDto.password, 5);
    const user = await this.usersService.createUser({
      ...userDto,
      password: hasPassword,
    });
    return this.generateToken(user);
  }

  private async generateToken({ email, id }: User) {
    return { token: this.jwtService.sign({ email, id }) };
  }

  private async validateUser(userDto: CreateSiginDto) {
    const user =
      (await this.usersService.getUserByEmail(userDto.login)) ||
      (await this.usersService.getUserByLogin(userDto.login));

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );

    if (user && passwordEquals) {
      return user;
    }
    throw new UnauthorizedException({ message: 'Неверный логин или пароль' });
  }
}
