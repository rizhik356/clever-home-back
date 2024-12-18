import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { UsersModule } from '../users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { DeviceTokens } from './device-tokens-model';
import { User } from '../users/users.model';
import { Devices } from './devices.model';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService],
  imports: [
    SequelizeModule.forFeature([DeviceTokens, User, Devices]),
    UsersModule,
  ],
})
export class DevicesModule {}
