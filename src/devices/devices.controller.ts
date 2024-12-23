import { Body, Controller, Post, Get } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateAddNewDeviceDto } from './dto/create-add-new-device-dto';
import { CreateNewGetTokenDto } from './dto/create-new-get-token-dto';

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Post('add-user-device')
  getToken(@Body() getTokenDto: CreateNewGetTokenDto) {
    return this.devicesService.addUserDevice(getTokenDto);
  }

  @Post('add-new-device')
  addNewDevice(@Body() newDeviceDto: CreateAddNewDeviceDto) {
    return this.devicesService.addNewDevice(newDeviceDto);
  }

  @Get('/types')
  getDevicesTypes() {
    return this.devicesService.getDevicesTypes();
  }
}
