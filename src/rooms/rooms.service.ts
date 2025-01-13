import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DefaultRooms } from './default-rooms.model';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(DefaultRooms) private defaultRooms: typeof DefaultRooms,
  ) {}

  async getAllRooms() {
    const rooms = await this.defaultRooms.findAll();
    return rooms.map(({ id, room_name }) => ({ value: id, label: room_name }));
  }
}
