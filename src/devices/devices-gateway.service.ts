import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DevicesGatewayModel } from './devices-gateway.model';
import { Socket } from 'socket.io';
import { DevicesService } from './devices.service';
import { DevicesLogsService } from '../devices-logs/devices-logs.service';
import { LogActionType } from '../devices-logs/enums';

@Injectable()
export class DevicesGatewayService {
  constructor(
    @InjectModel(DevicesGatewayModel)
    private devicesGatewayRepository: typeof DevicesGatewayModel,
    @Inject(forwardRef(() => DevicesService))
    private devicesService: DevicesService,
    private devicesLogsService: DevicesLogsService,
  ) {}

  async addDeviceGateWay(id: number, clientId: string) {
    await this.devicesGatewayRepository.create({
      device_id: id,
      client_id: clientId,
    });
  }

  async getDeviceGateWay(clientId: string) {
    return await this.devicesGatewayRepository.findOne({
      where: { client_id: clientId },
    });
  }

  async getDeviceGatewayByDeviceId(id: number) {
    return await this.devicesGatewayRepository.findOne({
      where: { device_id: id },
    });
  }

  async startConnection(client: Socket) {
    const id = Number(client.handshake.query.id);
    const serial = String(client.handshake.query.serial);
    const clientId = client.id;

    if (id && serial) {
      const device = await this.devicesService.verifyDevice(id, serial);
      const deviceGateway = await this.getDeviceGatewayByDeviceId(id);
      if (!device) {
        return false;
      } else if (deviceGateway) {
        await deviceGateway.destroy();
      }
      await this.addDeviceGateWay(id, clientId);
      await device.update({ active: true });
      await this.devicesLogsService.log(
        device.user_id,
        LogActionType.DEVICE_CONNECTED,
        {
          newValues: {
            name: device.name,
            roomId: device.room_id,
            deviceId: device.device_id,
          },
        },
      );
      return true;
    }
    return false;
  }

  async endConnection(client: Socket) {
    const clientId = client.id;
    const deviceGateway = await this.getDeviceGateWay(clientId);
    if (deviceGateway) {
      const device = await this.devicesService.getDeviceById(
        deviceGateway.device_id,
      );
      await device.update({ active: false });
      await deviceGateway.destroy();

      await this.devicesLogsService.log(
        device.user_id,
        LogActionType.DEVICE_DISCONNECTED,
        {
          newValues: {
            name: device.name,
            roomId: device.room_id,
            deviceId: device.device_id,
          },
        },
      );
    }
    return;
  }
}
