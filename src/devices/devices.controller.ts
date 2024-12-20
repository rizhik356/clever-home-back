import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateAddNewDeviceDto } from './dto/create-add-new-device-dto';

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Get('get-token/:id')
  getToken(@Param('id') id: string) {
    return this.devicesService.getToken(Number(id));
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
