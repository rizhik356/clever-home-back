import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Devices } from './devices.model';

@Table({ tableName: 'devices_params', timestamps: false })
export class DevicesParams extends Model<DevicesParams> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Devices)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  device_id: number;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  params: JSON;
}
