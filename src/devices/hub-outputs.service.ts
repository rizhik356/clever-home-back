import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { HubOutputs } from './hub-outputs.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateHubOutputsDTO,
  CreatePatchHubOutputsDTO,
} from './dto/create-hub-outputs-dto';
import { DevicesService } from './devices.service';

@Injectable()
export class HubOutputsService {
  constructor(
    @InjectModel(HubOutputs) private hubOutputs: typeof HubOutputs,
    @Inject(forwardRef(() => DevicesService))
    private devicesService: DevicesService,
  ) {}

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
          deviceId: device.id,
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
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async getAllHubs(id: number) {
    const parentDevice = await this.devicesService.getDeviceFullById(id);
    return this.formatHubOutputs(
      parentDevice.active,
      parentDevice.params,
      parentDevice.hubOutputs,
    );
  }

  async addNewOutput({
    parentId,
    roomId,
    deviceId,
    ...rest
  }: CreateHubOutputsDTO) {
    try {
      await this.hubOutputs.create({
        hub_id: parentId,
        room_id: roomId,
        device_id: deviceId,
        ...rest,
      });
      return await this.getAllHubs(parentId);
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async patchHubOutput({ id, ...rest }: CreatePatchHubOutputsDTO) {
    try {
      const record = await this.hubOutputs.findOne({ where: { id } });
      await record.update(rest);
      return this.getAllHubs(record.hub_id);
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async deleteHubOutput(id: string) {
    const formatId = Number(id);
    try {
      const record = await this.hubOutputs.findOne({ where: { id: formatId } });
      await record.destroy();
      return await this.getAllHubs(record.hub_id);
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
