import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserDevices } from './user-devices.model';
import { DevicesGateway } from './devices-gateway.model';
import { Socket } from 'socket.io';
import { DevicesService } from './devices.service';

@Injectable()
export class DevicesGatewayService {
  constructor(
    @InjectModel(DevicesGateway) private devicesGateway: typeof DevicesGateway,
    @InjectModel(UserDevices) private userDevices: typeof UserDevices,
    private devicesService: DevicesService,
  ) {}

  async addDeviceGateWay(id: number, clientId: string) {
    await this.devicesGateway.create({ id, client_id: clientId });
  }

  async startConnection(client: Socket) {
    const id = Number(client.handshake.query.id);
    const serial = String(client.handshake.query.serial);
    const clientId = client.id;

    const device = await this.devicesService.verifyDevice(id, serial);

    if (!device) {
      return false;
    }
    await this.addDeviceGateWay(id, clientId);
    await device.update({ active: true });
    return true;
  }

  async endConnection(client: Socket) {
    const clientId = client.id;
    await this.devicesGateway.destroy({
      where: { client_id: clientId },
    });
    return;
  }
}
