import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { UsersModule } from '../users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { DeviceTokens } from './device-tokens.model';
import { User } from '../users/users.model';
import { UserDevices } from './user-devices.model';
import { Devices } from './devices.model';
import { DefaultRooms } from '../rooms/default-rooms.model';
import { DevicesGateway } from './devices.gateway';
import { DevicesGatewayService } from './devices-gateway.service';
import { DevicesGatewayModel } from './devices-gateway.model';
import { ConfigModule } from '@nestjs/config';
import { DevicesParams } from './devices-params.model';
import { AuthModule } from '../auth/auth.module';
import { HubOutputs } from './hub-outputs.model';
import { HubOutputsService } from './hub-outputs.service';
import { HubOutputsController } from './hub-outputs.controller';

@Module({
  controllers: [DevicesController, HubOutputsController],
  providers: [
    DevicesService,
    DevicesGateway,
    DevicesGatewayService,
    HubOutputsService,
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    SequelizeModule.forFeature([
      DeviceTokens,
      UserDevices,
      User,
      Devices,
      DefaultRooms,
      DevicesGatewayModel,
      DevicesParams,
      HubOutputs,
    ]),
    UsersModule,
    AuthModule,
  ],
})
export class DevicesModule {}
