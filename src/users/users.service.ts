import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user-dto';
import { FamilyService } from './family.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @Inject(forwardRef(() => FamilyService))
    private familyService: FamilyService,
  ) {}

  async createUser(dto: CreateUserDto) {
    try {
      const newUser = await this.userRepository.create(dto);xxxx
      await this.familyService.createFamilyForUser(newUser.id);
      return newUser;
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async getUserById(id: number) {
    try {
      return await this.userRepository.findOne({
        where: { id: Number(id) },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async getUserByLogin(login: string) {
    try {
      return await this.userRepository.findOne({ where: { login } });
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async isLoginEmpty(login: string) {
    const user = await this.getUserByLogin(login);
    if (user) {
      throw new HttpException(
        'Пользователь с таким логином уже существует',
        HttpStatus.CONFLICT,
      );
    }
  }

  async isEmailEmpty(email: string) {
    const user = await this.getUserByEmail(email);
    if (user) {
      throw new HttpException(
        'Пользователь с таким email уже существует',
        HttpStatus.CONFLICT,
      );
    }
  }
}
