import { Injectable } from '@nestjs/common';
import { HubOutputs } from './hub-outputs.model';

@Injectable()
export class HubOutputsService {
  constructor() {}
  formatHubOutputs(active: boolean, params, hubOutputs: Array<HubOutputs>) {
    return hubOutputs.map(({ id, name, room_id, device, room, output }) => {
      const currentParam = params[`power${output}`];
      return {
        id,
        name,
        roomId: room_id,
        deviceType: device.type,
        roomName: room ? room.room_name : null,
        image: device ? device.image : null,
        active,
        params: { power: currentParam },
      };
    });
  }
}
