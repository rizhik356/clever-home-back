import {
  Body,
  Controller,
  Post,
  UseGuards,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import {
  CreateHubOutputsDTO,
  CreatePatchHubOutputsDTO,
} from './dto/create-hub-outputs-dto';
import { HubOutputsService } from './hub-outputs.service';

@Controller('hub-outputs')
export class HubOutputsController {
  constructor(private hubOutputsService: HubOutputsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  addNewOutput(@Body() body: CreateHubOutputsDTO) {
    return this.hubOutputsService.addNewOutput(body);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('/')
  patchHubOutput(@Body() body: CreatePatchHubOutputsDTO) {
    return this.hubOutputsService.patchHubOutput(body);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.hubOutputsService.deleteHubOutput(id);
  }
}
