import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DevicesLogs } from './devices-logs.model';
import { LogActionType } from './enums';
import { Op, Transaction } from 'sequelize';
import { UserDevices } from '../devices/user-devices.model';
import { DefaultRooms } from '../rooms/default-rooms.model';

@Injectable()
export class DevicesLogsService {
  constructor(
    @InjectModel(DevicesLogs)
    private deviceLogsRepository: typeof DevicesLogs,
    @InjectModel(UserDevices) private userDevicesRepository: typeof UserDevices,
    @InjectModel(DefaultRooms)
    private defaultRoomsRepository: typeof DefaultRooms,
  ) {}
  async log(
    userId: number,
    action: LogActionType,
    data: {
      deviceId?: number;
      oldValues?: any;
      newValues?: any;
    },
    transaction?: Transaction,
  ) {
    try {
      await this.deviceLogsRepository.create(
        {
          user_id: userId,
          device_id: data.deviceId,
          action,
          old_values: data.oldValues,
          new_values: data.newValues,
        },
        { transaction },
      );
    } catch (error) {
      console.error('Failed to create device log:', error);
      // Не бросаем ошибку, чтобы не прерывать основное действие
    }
  }
  async getDeviceLogs(deviceId: number, limit = 100, offset = 0) {
    return this.deviceLogsRepository.findAndCountAll({
      where: { device_id: deviceId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: ['user'],
    });
  }

  async getUserLogs(userId: number, limit = 100, offset = 0) {
    const logs = await this.deviceLogsRepository.findAndCountAll({
      where: { user_id: userId },
      attributes: ['id', 'action', 'createdAt', 'user_id', 'device_id'],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: UserDevices,
          as: 'device',
          attributes: ['id', 'name', 'room_id'], // Добавляем room_id
          required: false,
          include: [
            {
              model: DefaultRooms, // Включаем модель комнат
              as: 'room', // Укажите правильный алиас (может быть 'room' или 'defaultRoom')
              attributes: ['id', 'room_name'], // Получаем room_name
              required: false,
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });

    // Трансформируем в camelCase
    const transformedRows = logs.rows.map((log: any) => ({
      id: log.id,
      action: log.action,
      createdAt: log.createdAt,
      userId: log.user_id,
      roomName: log.device?.room?.room_name || null, // Получаем room_name через вложенную связь
      deviceName: log.device?.name || null, // Можем вернуть название устройства
    }));

    return {
      rows: transformedRows,
      count: logs.count,
    };
  }

  async getLogsByDateRange(startDate: Date, endDate: Date, limit = 1000) {
    return this.deviceLogsRepository.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [['createdAt', 'DESC']],
      limit,
      include: ['user', 'device'],
    });
  }
}
