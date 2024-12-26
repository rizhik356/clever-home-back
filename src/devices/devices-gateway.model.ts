import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { UserDevices } from './user-devices.model';

@Table({ tableName: 'devices_gateway' })
export class DevicesGateway extends Model<DevicesGateway> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
  })
  client_id: string;

  @ForeignKey(() => UserDevices)
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  device_id: number;
}
