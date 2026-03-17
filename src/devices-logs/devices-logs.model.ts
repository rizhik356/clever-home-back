import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { UserDevices } from '../devices/user-devices.model';
import { User } from '../users/users.model';

import { LogActionType } from './enums';

@Table({ tableName: 'devices_logs', timestamps: true, updatedAt: false })
export class DevicesLogs extends Model<DevicesLogs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @Index
  user_id: number;

  @ForeignKey(() => UserDevices)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  @Index
  device_id: number;

  @Column({
    type: DataType.ENUM(...Object.values(LogActionType)),
    allowNull: false,
  })
  @Index
  action: LogActionType;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  old_values: Record<string, any>;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  new_values: Record<string, any>;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => UserDevices)
  device: UserDevices;
}
