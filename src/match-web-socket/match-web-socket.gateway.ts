import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'
import { SocketMatchTeamScore } from 'src/types/match'

type MatchRoomMap = Map<string, Record<string, number>>

@WebSocketGateway({ cors: true })
export class MatchWebSocketGateway {
    private socket: Socket
    public matchRooms: MatchRoomMap = new Map()

    @WebSocketServer()
    server: Server

    public constructor() {}

    @SubscribeMessage('joinMatch')
    async handleClientJoinMatchEvent(
        @MessageBody()
        payload: {
            socketId: string
            matchId: string
        },
    ) {
        const { socketId, matchId } = payload
        await this.server.in(socketId).socketsJoin(matchId)

        const matchRoomExists = this.matchRooms.get(matchId)
        if (!matchRoomExists) {
            this.requestInitialMatchScore({
                matchId,
            })
        } else {
            const scores = this.matchRooms.get(matchId)
            this.setAndSendMatchScores({
                matchId,
                scores,
            })
        }

        const roomSize = await this.server.in(payload.matchId).fetchSockets()
        console.log(`${payload.socketId} joined. Total Sockets in room: ${roomSize.length}`)
    }

    requestInitialMatchScore(
        @MessageBody()
        payload: {
            matchId: string
        },
    ) {
        this.server.to(payload.matchId).emit('initialMatchScoreRequest', payload.matchId)
    }

    @SubscribeMessage('matchScoreUpdateEvent')
    async setAndSendMatchScores(@MessageBody() payload: SocketMatchTeamScore) {
        const { matchId, scores } = payload
        console.log('updatedScore', scores)
        this.matchRooms.set(matchId, scores)
        this.server.to(matchId).emit('matchScoreUpdated', {
            matchId,
            scores,
        })
    }

    @SubscribeMessage('leaveMatchRoom')
    async leaveMatchRoom(@MessageBody() payload: { socketId: string; matchId: string }) {
        const allSocketsInRoom = await this.server.sockets.in(payload.matchId).fetchSockets()
        const socketToLeave = allSocketsInRoom.find((socket) => socket.id === payload.socketId)

        if (!socketToLeave) {
            return
        }

        socketToLeave.leave(payload.matchId)
    }
}
