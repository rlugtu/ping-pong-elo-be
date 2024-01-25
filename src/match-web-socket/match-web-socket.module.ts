import { Module } from '@nestjs/common'
import { MatchWebSocketGateway } from './match-web-socket.gateway'

@Module({
    providers: [MatchWebSocketGateway],
})
export class SocketModule {}
