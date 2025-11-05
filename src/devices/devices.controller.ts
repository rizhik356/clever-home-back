import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateAddNewDeviceDto } from './dto/create-add-new-device-dto';
import { CreateNewGetTokenDto } from './dto/create-new-get-token-dto';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { CreateNewParamsDto } from './dto/create-new-params-dto';

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add-user-device')
  getToken(@Req() req: any, @Body() getTokenDto: CreateNewGetTokenDto) {
    return this.devicesService.addUserDevice({
      ...getTokenDto,
      userId: req?.user?.id,
    });
  }

  @Post('add-new-device')
  addNewDevice(@Body() newDeviceDto: CreateAddNewDeviceDto) {
    return this.devicesService.addNewDevice(newDeviceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/types')
  getDevicesTypes() {
    return this.devicesService.getDevicesTypes();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  getDevices(@Req() req: any) {
    return this.devicesService.getAllUserDevices(req?.user?.id);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('/params')
  postParams(@Body() newParamsDto: CreateNewParamsDto) {
    return this.devicesService.setNewDeviceParams(newParamsDto);
  }
}
