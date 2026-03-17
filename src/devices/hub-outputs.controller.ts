import {
  Body,
  Controller,
  Post,
  UseGuards,
  Patch,
  Delete,
  Param,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import {
  CreateHubOutputsDTO,
  CreatePatchHubOutputsDTO,
} from './dto/create-hub-outputs-dto';
import { HubOutputsService } from './hub-outputs.service';
import { ParsedResponse } from '../auth/types';

@Controller('hub-outputs')
export class HubOutputsController {
  constructor(private hubOutputsService: HubOutputsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  addNewOutput(@Req() req: ParsedResponse, @Body() body: CreateHubOutputsDTO) {
    return this.hubOutputsService.addNewOutput(body, req?.user?.id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('/')
  patchHubOutput(
    @Req() req: ParsedResponse,
    @Body() body: CreatePatchHubOutputsDTO,
  ) {
    return this.hubOutputsService.patchHubOutput(body, req?.user?.id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  delete(@Req() req: ParsedResponse, @Param('id') id: string) {
    return this.hubOutputsService.deleteHubOutput(id, req?.user?.id);
  }
}
