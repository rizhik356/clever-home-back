import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'default_rooms', timestamps: false })
export class DefaultRooms extends Model<DefaultRooms> {
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
  room_name: string;
}
