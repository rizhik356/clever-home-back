import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAddNewDeviceDto } from './dto/create-add-new-device-dto';
import { UsersService } from '../users/users.service';
import { DeviceTokens } from './device-tokens-model';
import { InjectModel } from '@nestjs/sequelize';
import { randomBytes } from 'crypto';
import { UserDevices } from './user-devices.model';
import { Devices } from './devices.model';
import { CreateNewGetTokenDto } from './dto/create-new-get-token-dto';

@Injectable()
export class DevicesService {
  constructor(
    private usersService: UsersService,
    @InjectModel(DeviceTokens) private deviceTokens: typeof DeviceTokens,
    @InjectModel(UserDevices) private userDevices: typeof UserDevices,
    @InjectModel(Devices) private devicesTypes: typeof Devices,
  ) {}

  private makeToken(value: number = 16) {
    return randomBytes(value).toString('hex');
  }

  async addUserDevice(getTokenData: CreateNewGetTokenDto) {
    const user = await this.usersService.getUserById(getTokenData.userId);
    if (!user) {
      throw new HttpException(
        'Произошла ошибка, попробуйте позднее..',
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = await this.addDeviceToken(getTokenData);
    return { token };
  }

  private async addDeviceToken(data: CreateNewGetTokenDto) {
    const { userId, deviceId, name, roomId } = data;
    const token = this.makeToken();
    await this.deviceTokens.create({
      user_id: userId,
      token,
      device_id: deviceId,
      name: name,
      room_id: roomId,
      is_used: false,
    });

    return token;
  }

  async addNewDevice({ token, userId, deviceId }: CreateAddNewDeviceDto) {
    const deviceTokenRow = await this.verifyDeviceToken({
      userId,
      token,
    });
    if (!deviceTokenRow) {
      throw new HttpException(
        'Некорректный токен или его срок действия истек',
        HttpStatus.BAD_REQUEST,
      );
    }
    const serial = this.makeSerial(deviceId);
    const { user_id, room_id, name, device_id } = deviceTokenRow;
    const newDevice = await this.userDevices.create({
      user_id,
      serial,
      room_id,
      name,
      device_id,
      active: false,
    });
    await deviceTokenRow.update({ is_used: true });
    return { serial, id: newDevice.id };
  }

  private async verifyDeviceToken({ userId, token }) {
    return await this.deviceTokens.findOne({
      where: { user_id: userId, token, is_used: false },
    });
  }

  private makeSerial(deviceId: number) {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const token = this.makeToken(4);

    return `${deviceId}${day}${month}${token}`;
  }

  async getDevicesTypes() {
    const devices = await this.devicesTypes.findAll();
    return devices.map(({ id, name }) => ({ value: id, label: name }));
  }

  async verifyDevice(id: number, serial: string) {
    return await this.userDevices.findOne({ where: { id, serial } });
  }

  async getDeviceById(id: number) {
    return await this.userDevices.findOne({ where: { id } });
  }
}
