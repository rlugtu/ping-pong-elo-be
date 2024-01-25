import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'
import { SocketMatchTeamScore } from 'src/types/match'

@WebSocketGateway({ cors: true })
export class MatchWebSocketGateway {
    private socket: Socket

    @WebSocketServer()
    server: Server

    public constructor() {}
    @SubscribeMessage('updateScoreEvent')
    handleMessage(@MessageBody() scores: SocketMatchTeamScore): void {
        this.server.sockets.emit('matchScoreUpdated', scores)
    }
}
