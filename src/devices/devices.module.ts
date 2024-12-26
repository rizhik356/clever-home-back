import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { UsersModule } from '../users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { DeviceTokens } from './device-tokens-model';
import { User } from '../users/users.model';
import { UserDevices } from './user-devices.model';
import { Devices } from './devices.model';
import { DefaultRooms } from '../rooms/default-rooms.model';
import { DevicesGateway } from './devices.gateway';
import { DevicesGatewayService } from './devices-gateway.service';
import { DevicesGateway as DeviceGatewayModel } from './devices-gateway.model';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService, DevicesGateway, DevicesGatewayService],
  imports: [
    SequelizeModule.forFeature([
      DeviceTokens,
      UserDevices,
      User,
      Devices,
      DefaultRooms,
      DeviceGatewayModel,
    ]),
    UsersModule,
  ],
})
export class DevicesModule {}
