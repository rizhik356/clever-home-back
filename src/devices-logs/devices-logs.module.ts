import { Module } from '@nestjs/common';
import { DevicesLogsService } from './devices-logs.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DevicesLogs } from './devices-logs.model';

@Module({
  controllers: [],
  providers: [DevicesLogsService],
  imports: [SequelizeModule.forFeature([DevicesLogs])],
  exports: [DevicesLogsService],
})
export class DevicesLogsModule {}
