import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DevicesLogsService } from './devices-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { ParsedResponse } from '../auth/types';

@Controller('devices-logs')
export class RoomsController {
  constructor(private readonly devicesLogsService: DevicesLogsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  getRooms(@Req() req: ParsedResponse) {
    return this.devicesLogsService.getUserLogs(req?.user?.id);
  }
}
