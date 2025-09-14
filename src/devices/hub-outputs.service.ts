import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HubOutputs } from './hub-outputs.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateHubOutputsDTO,
  CreatePatchHubOutputsDTO,
} from './dto/create-hub-outputs-dto';

@Injectable()
export class HubOutputsService {
  constructor(@InjectModel(HubOutputs) private hubOutputs: typeof HubOutputs) {}
  formatHubOutputs(
    active: boolean,
    params: JSON,
    hubOutputs: Array<HubOutputs>,
  ) {
    return hubOutputs.map(
      ({ id, name, room_id, device, room, output, hub_id }) => {
        const currentParam = params[`power${output}`];
        return {
          id,
          name,
          output,
          roomId: room_id,
          deviceType: device.type,
          roomName: room ? room.room_name : null,
          image: device ? device.image : null,
          active,
          params: { power: currentParam },
          parentId: hub_id,
        };
      },
    );
  }

  async getHubOutputById(id: number) {
    try {
      return await this.hubOutputs.findOne({ where: { id } });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async addNewOutput({ parentId, ...rest }: CreateHubOutputsDTO) {
    try {
      const newHubOutput = await this.hubOutputs.create({
        hub_id: parentId,
        ...rest,
      });
      return newHubOutput.id;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async patchHubOutput({ id, ...rest }: CreatePatchHubOutputsDTO) {
    try {
      return await this.hubOutputs.update(rest, {
        where: {
          id,
        },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteHubOutput(id: string) {
    try {
      await this.hubOutputs.destroy({ where: { id: Number(id) } });
      return;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
