import { CreateNewParamsDto } from './dto/create-new-params-dto';
import { UserDevices } from './user-devices.model';
import { DefaultRooms } from '../rooms/default-rooms.model';

export type DeviceParams = Omit<CreateNewParamsDto, 'id'>;

export type UserDevicesReturn = UserDevices & Omit<DefaultRooms, 'id'>;
