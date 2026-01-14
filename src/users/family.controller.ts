import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Delete,
  Query,
} from '@nestjs/common';
import { FamilyService } from './family.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { InviteUserDto } from './dto/invite-user-to-family-dto';
import { ParsedResponse } from '../auth/types';
import { AccessInviteUserDto } from './dto/access-invite-user-to-family-dto';
import { DeleteUserFromFamilyDto } from './dto/delete-user-from-family-dto';

@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @ApiOperation({ summary: 'Приглашение нового пользоватлея в семью' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Post('invite')
  inviteMember(
    @Req() req: ParsedResponse,
    @Body() inviteUserDto: InviteUserDto,
  ) {
    return this.familyService.inviteMemberToFamily(
      req?.user?.id,
      inviteUserDto,
    );
  }

  @ApiOperation({ summary: 'Добавление пользователя по токену' })
  @ApiResponse({ status: 200 })
  @Post('access-invite')
  accessInvite(@Body() accessInviteDto: AccessInviteUserDto) {
    return this.familyService.addMemberFromToken(accessInviteDto);
  }

  @ApiOperation({ summary: 'Получение всех членов семьи' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get('/')
  getFamilies(@Req() req: ParsedResponse) {
    return this.familyService.getUserFamilyMembers(req?.user.id);
  }

  @ApiOperation({ summary: 'Удаление члена семьи' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Delete('/')
  deleteUserFromFamily(
    @Query() query: DeleteUserFromFamilyDto,
    @Req() req: ParsedResponse,
  ) {
    return this.familyService.deleteUserFromFamilyByOwner(req?.user.id, query);
  }
}
