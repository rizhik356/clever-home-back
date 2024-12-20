import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'devices_types', timestamps: false })
export class DevicesTypes extends Model<DevicesTypes> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  type: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  name: string;
}
