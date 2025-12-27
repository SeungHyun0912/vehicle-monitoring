import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/vehicles',
})
export class VehiclePositionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VehiclePositionGateway.name);
  private readonly clientSubscriptions = new Map<string, Set<string>>();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clientSubscriptions.set(client.id, new Set());
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const subscriptions = this.clientSubscriptions.get(client.id);
    if (subscriptions) {
      subscriptions.forEach((vehicleId) => {
        client.leave(`vehicle:${vehicleId}`);
      });
    }

    this.clientSubscriptions.delete(client.id);
  }

  @SubscribeMessage('subscribeVehicle')
  handleSubscribeVehicle(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vehicleId: string },
  ) {
    const { vehicleId } = data;

    if (!vehicleId) {
      return { error: 'vehicleId is required' };
    }

    const room = `vehicle:${vehicleId}`;
    client.join(room);

    const subscriptions = this.clientSubscriptions.get(client.id);
    if (subscriptions) {
      subscriptions.add(vehicleId);
    }

    this.logger.log(`Client ${client.id} subscribed to vehicle ${vehicleId}`);
    return { success: true, vehicleId };
  }

  @SubscribeMessage('unsubscribeVehicle')
  handleUnsubscribeVehicle(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vehicleId: string },
  ) {
    const { vehicleId } = data;

    if (!vehicleId) {
      return { error: 'vehicleId is required' };
    }

    const room = `vehicle:${vehicleId}`;
    client.leave(room);

    const subscriptions = this.clientSubscriptions.get(client.id);
    if (subscriptions) {
      subscriptions.delete(vehicleId);
    }

    this.logger.log(`Client ${client.id} unsubscribed from vehicle ${vehicleId}`);
    return { success: true, vehicleId };
  }

  @SubscribeMessage('subscribeAll')
  handleSubscribeAll(@ConnectedSocket() client: Socket) {
    const room = 'all-vehicles';
    client.join(room);

    this.logger.log(`Client ${client.id} subscribed to all vehicles`);
    return { success: true };
  }

  @SubscribeMessage('unsubscribeAll')
  handleUnsubscribeAll(@ConnectedSocket() client: Socket) {
    const room = 'all-vehicles';
    client.leave(room);

    this.logger.log(`Client ${client.id} unsubscribed from all vehicles`);
    return { success: true };
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { pong: Date.now() };
  }

  broadcastPositionUpdate(vehicleId: string, data: any) {
    this.server.to(`vehicle:${vehicleId}`).emit('positionUpdate', {
      vehicleId,
      ...data,
      timestamp: Date.now(),
    });

    this.server.to('all-vehicles').emit('positionUpdate', {
      vehicleId,
      ...data,
      timestamp: Date.now(),
    });
  }

  broadcastStateChange(vehicleId: string, data: any) {
    this.server.to(`vehicle:${vehicleId}`).emit('stateChange', {
      vehicleId,
      ...data,
      timestamp: Date.now(),
    });

    this.server.to('all-vehicles').emit('stateChange', {
      vehicleId,
      ...data,
      timestamp: Date.now(),
    });
  }

  broadcastVehicleError(vehicleId: string, error: any) {
    this.server.to(`vehicle:${vehicleId}`).emit('vehicleError', {
      vehicleId,
      ...error,
      timestamp: Date.now(),
    });

    this.server.to('all-vehicles').emit('vehicleError', {
      vehicleId,
      ...error,
      timestamp: Date.now(),
    });
  }

  getConnectedClients(): number {
    return this.server.sockets.sockets.size;
  }

  getClientSubscriptions(clientId: string): Set<string> | undefined {
    return this.clientSubscriptions.get(clientId);
  }
}
