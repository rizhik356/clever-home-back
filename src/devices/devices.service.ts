import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAddNewDeviceDto } from './dto/create-add-new-device-dto';
import { UsersService } from '../users/users.service';
import { DeviceTokens } from './device-tokens-model';
import { InjectModel } from '@nestjs/sequelize';
import { randomBytes } from 'crypto';
import { Devices } from './devices.model';

@Injectable()
export class DevicesService {
  constructor(
    private usersService: UsersService,
    @InjectModel(DeviceTokens) private deviceTokens: typeof DeviceTokens,
    @InjectModel(Devices) private devices: typeof Devices,
  ) {}

  private makeToken(value: number = 16) {
    return randomBytes(value).toString('hex');
  }

  async getToken(id: number) {
    const user = await this.usersService.getUserById(id);
    if (!user) {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее..',
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = await this.addDeviceToken(id);
    return { token };
  }

  private async addDeviceToken(id: number) {
    const token = this.makeToken();
    await this.deviceTokens.create({ user_id: id, token, is_used: false });

    return token;
  }

  async addNewDevice({ token, id, type }: CreateAddNewDeviceDto) {
    const deviceTokenRow = await this.verifyDeviceToken({ id, token });
    if (!deviceTokenRow) {
      throw new HttpException(
        'Некорректный токен или его срок действия истек',
        HttpStatus.BAD_REQUEST,
      );
    }
    const serial = this.makeSerial(type);
    const { user_id } = deviceTokenRow;
    const newDevice = await this.devices.create({ user_id, serial, type });
    await deviceTokenRow.update({ is_used: true });
    return { serial, id: newDevice.id };
  }

  private async verifyDeviceToken({ id, token }) {
    return await this.deviceTokens.findOne({
      where: { user_id: id, token, is_used: false },
    });
  }

  private makeSerial(type: string) {
    const date = new Date();
    const day = date.getDate(); // Получаем текущий день
    const month = date.getMonth() + 1;
    const token = this.makeToken(4);

    return `${type}${day}${month}${token}`;
  }
}
