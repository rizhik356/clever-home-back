import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateAddNewDeviceDto } from './dto/create-add-new-device-dto';
import { UsersService } from '../users/users.service';
import { DeviceTokens } from './device-tokens.model';
import { InjectModel } from '@nestjs/sequelize';
import { randomBytes } from 'crypto';
import { UserDevices } from './user-devices.model';
import { Devices } from './devices.model';
import { CreateNewGetTokenDto } from './dto/create-new-get-token-dto';
import { DevicesParams } from './devices-params.model';
import { CreateNewParamsDto } from './dto/create-new-params-dto';
import { DevicesGatewayService } from './devices-gateway.service';
import { DevicesGateway } from './devices.gateway';
import { DefaultRooms } from '../rooms/default-rooms.model';
import { HubOutputs } from './hub-outputs.model';
import { HubOutputsService } from './hub-outputs.service';
import { DeviceParams } from './types';

@Injectable()
export class DevicesService {
  private readonly defaultRoomAttributes: string[];
  private readonly deviceAttributes: string[];
  constructor(
    private usersService: UsersService,
    @Inject(forwardRef(() => DevicesGatewayService))
    private devicesGatewayService: DevicesGatewayService,
    @Inject(forwardRef(() => HubOutputsService))
    private hubOutputsService: HubOutputsService,
    private devicesGateway: DevicesGateway,
    @InjectModel(DeviceTokens) private deviceTokens: typeof DeviceTokens,
    @InjectModel(UserDevices) private userDevices: typeof UserDevices,
    @InjectModel(DevicesParams) private devicesParams: typeof DevicesParams,
    @InjectModel(Devices) private devicesTypes: typeof Devices,
    @InjectModel(DefaultRooms) private defaultRooms: typeof DefaultRooms,
    @InjectModel(HubOutputs) private hubOutputs: typeof HubOutputs,
  ) {
    this.defaultRoomAttributes = ['room_name'];
    this.deviceAttributes = ['image', 'type', 'id'];
  }

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
    const { params } = await this.getDeviceParams(device_id);
    const newDevice = await this.userDevices.create({
      user_id,
      serial,
      room_id,
      name,
      device_id,
      params,
      active: false,
    });
    await deviceTokenRow.update({ is_used: true });
    return { serial, id: newDevice.id, params };
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

  async getDeviceParams(id: number) {
    return await this.devicesParams.findOne({ where: { device_id: id } });
  }

  private getDeviceIncludes(id?: number) {
    console.log(id);
    return [
      {
        model: DefaultRooms,
        attributes: this.defaultRoomAttributes,
      },
      {
        model: Devices,
        attributes: this.deviceAttributes,
      },
      {
        model: HubOutputs,
        where: id ? { id } : {},
        required: !!id,
        include: [
          {
            model: DefaultRooms,
            attributes: this.defaultRoomAttributes,
          },
          {
            model: Devices,
            attributes: this.deviceAttributes,
          },
        ],
      },
    ];
  }

  async getUserDevicesById(userId: number) {
    try {
      return await UserDevices.findAll({
        where: { user_id: userId },
        include: this.getDeviceIncludes(),
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getDeviceFullById(id: number, outputId?: number) {
    try {
      return await this.userDevices.findOne({
        where: { id },
        include: this.getDeviceIncludes(outputId),
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getAllUserDevices(userId: number) {
    const userDevices = await this.getUserDevicesById(userId);

    if (!userDevices.length) {
      return [];
    }

    return userDevices.map(
      ({ id, room_id, name, active, params, room, device, hubOutputs }) => {
        const formatDeviceRow = {
          id,
          roomId: room_id,
          name,
          deviceType: device.type,
          deviceId: device.id,
          active,
          params,
          roomName: room ? room.room_name : null,
          image: device ? device.image : null,
        };

        const hubOutputRows =
          hubOutputs && hubOutputs.length
            ? this.hubOutputsService.formatHubOutputs(
                active,
                params,
                hubOutputs,
              )
            : [];

        return !hubOutputRows?.length
          ? formatDeviceRow
          : { ...formatDeviceRow, children: hubOutputRows };
      },
    );
  }

  makeChildrenFormatParams(params: DeviceParams, output: number) {
    const entries = Object.entries(params);
    const formatEntries = entries.map(([key, value]) => {
      return [`${key}${output}`, value];
    });
    return Object.fromEntries(formatEntries);
  }

  async setNewDeviceParams({ id, parentId, ...rest }: CreateNewParamsDto) {
    const currentId = parentId || id;

    const deviceGateway =
      await this.devicesGatewayService.getDeviceGatewayByDeviceId(currentId);
    const device = await this.getDeviceById(currentId);

    if (parentId) {
      const outputRow = await this.hubOutputsService.getHubOutputById(id);
      const params = this.makeChildrenFormatParams(rest, outputRow.output);
      const newParams = await this.devicesGateway.setNewParams(
        deviceGateway.client_id,
        params,
      );
      await device.update({ params: newParams });
      const updatedParent = await this.getDeviceFullById(currentId, id);
      return this.hubOutputsService.formatHubOutputs(
        updatedParent.active,
        updatedParent.params,
        updatedParent.hubOutputs,
      )[0];
    }

    const newParams = await this.devicesGateway.setNewParams(
      deviceGateway.client_id,
      rest,
    );
    await device.update({ params: newParams });
    return device;
  }
}
