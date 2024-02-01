import { Global, Module } from '@nestjs/common'
import { MatchWebSocketGateway } from './match-web-socket.gateway'

@Global()
@Module({
    providers: [MatchWebSocketGateway],
})
export class SocketModule {}
