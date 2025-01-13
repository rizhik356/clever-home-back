import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'devices', timestamps: false })
export class Devices extends Model<Devices> {
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
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  image: string;
}
