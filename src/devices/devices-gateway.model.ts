import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { UserDevices } from './user-devices.model';

@Table({ tableName: 'devices_gateway' })
export class DevicesGatewayModel extends Model<DevicesGatewayModel> {
  @Column({
    type: DataType.STRING,
    unique: true,
    primaryKey: true,
  })
  client_id: string;

  @ForeignKey(() => UserDevices)
  @Column({
    type: DataType.INTEGER,
    unique: true,
    allowNull: false,
  })
  device_id: number;
}
