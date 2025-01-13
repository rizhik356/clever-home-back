import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user-dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.userRepository.create(dto);
    return user;
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: Number(id) },
    });
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  async getUserByLogin(login: string) {
    const user = await this.userRepository.findOne({ where: { login } });
    return user;
  }

  async isLoginEmpty(login: string) {
    const user = await this.getUserByLogin(login);
    if (user) {
      throw new HttpException(
        'Пользователь с таким логином уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async isEmailEmpty(email: string) {
    const user = await this.getUserByEmail(email);
    if (user) {
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
