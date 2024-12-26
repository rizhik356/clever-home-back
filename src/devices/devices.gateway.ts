import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { DevicesGatewayService } from './devices-gateway.service';

@WebSocketGateway(7010, {
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

  afterInit() {
    console.log('Server is running onGateway');
  }

  async handleConnection(client: Socket) {
    const connectionSuccess =
      await this.devicesGatewayService.startConnection(client);
    if (connectionSuccess) {
      this.startHeartbeat(client);
    } else {
      client.disconnect();
    }
  }

  async handleDisconnect(client: any): Promise<void> {
    this.stopHeartbeat(client);
    await this.devicesGatewayService.endConnection(client);
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
}
