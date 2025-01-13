import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DevicesGatewayModel } from './devices-gateway.model';
import { Socket } from 'socket.io';
import { DevicesService } from './devices.service';

@Injectable()
export class DevicesGatewayService {
  constructor(
    @InjectModel(DevicesGatewayModel)
    private devicesGatewayRepository: typeof DevicesGatewayModel,
    @Inject(forwardRef(() => DevicesService))
    private devicesService: DevicesService,
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
      return true;
    }
    console.log('error');
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
    }
    return;
  }
}
