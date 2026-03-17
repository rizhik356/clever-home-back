import { Module } from '@nestjs/common';
import { DevicesLogsService } from './devices-logs.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DevicesLogs } from './devices-logs.model';
import { UserDevices } from '../devices/user-devices.model';
import { DevicesLogsController } from './devices-logs.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [DevicesLogsController],
  providers: [DevicesLogsService],
  imports: [SequelizeModule.forFeature([DevicesLogs, UserDevices]), AuthModule],
  exports: [DevicesLogsService],
})
export class DevicesLogsModule {}
