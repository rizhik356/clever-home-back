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

@Module({
  controllers: [DevicesController],
  providers: [DevicesService],
  imports: [
    SequelizeModule.forFeature([
      DeviceTokens,
      UserDevices,
      User,
      Devices,
      DefaultRooms,
    ]),
    UsersModule,
  ],
})
export class DevicesModule {}
