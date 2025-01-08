import { CreateNewParamsDto } from './dto/create-new-params-dto';

export type DeviceParams = Omit<CreateNewParamsDto, 'id'>;
