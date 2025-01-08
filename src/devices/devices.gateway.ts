import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { DevicesGatewayService } from './devices-gateway.service';
import { DeviceParams } from './types';
import { HttpException, HttpStatus } from '@nestjs/common';

@WebSocketGateway(Number(process.env.WEB_SOCKET_PORT), {
  cors: {
    origin: '*',
  },
})
export class DevicesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private devicesGatewayService: DevicesGatewayService) {}

  @WebSocketServer() server: Server;
  private clients: Map<string, NodeJS.Timeout> = new Map();
  private clientSockets: Map<string, Socket> = new Map();

  afterInit() {
    console.log(
      `Server is running onGateway port: ${process.env.WEB_SOCKET_PORT}`,
    );
  }

  async handleConnection(client: Socket) {
    const connectionSuccess =
      await this.devicesGatewayService.startConnection(client);
    if (connectionSuccess) {
      this.startHeartbeat(client);
      this.clientSockets.set(client.id, client);
    } else {
      client.disconnect();
    }
  }

  async handleDisconnect(client: any): Promise<void> {
    this.stopHeartbeat(client);
    await this.devicesGatewayService.endConnection(client);
    this.clientSockets.delete(client.id);
  }

  startHeartbeat(client: Socket) {
    const interval = setInterval(() => {
      client.emit('ping'); // Отправляем пинг клиенту
    }, 30000);

    this.clients.set(client.id, interval);
  }

  stopHeartbeat(client: Socket) {
    const interval = this.clients.get(client.id);
    if (interval) {
      clearInterval(interval);
      this.clients.delete(client.id);
    }
  }

  @SubscribeMessage('pong') // Обработка ответа от клиента
  handlePong(client: Socket) {
    console.log(`Received pong from ${client.id}`);
    console.log(this.clients);
    // Здесь можно добавить логику для обработки ответа от клиента
  }

  getClientById(clientId: string) {
    return this.clientSockets.get(clientId);
  }

  async setNewParams(clientId: string, params: DeviceParams): Promise<JSON> {
    //   console.log(clientId);
    const client = this.getClientById(clientId);
    //   console.log(client);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(
          new HttpException(
            'Устройство недоступно, поробуйте поздне...',
            HttpStatus.BAD_REQUEST,
          ),
        );
      }, 30000);

      client.emit('newParams', params);

      client.once('newParams', (response: string) => {
        resolve(JSON.parse(response));
        clearTimeout(timer);
      });
    });
  }
}
