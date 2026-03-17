import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DevicesLogs } from './devices-logs.model';
import { LogActionType } from './enums';
import { Op, Transaction } from 'sequelize';

@Injectable()
export class DevicesLogsService {
  constructor(
    @InjectModel(DevicesLogs)
    private deviceLogsRepository: typeof DevicesLogs,
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
    return this.deviceLogsRepository.findAndCountAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: ['device'],
    });
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
