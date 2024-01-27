import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'
import { FormattedLobby } from 'src/match/entities/match.entity'
import { MatchService } from 'src/match/match.service'
import { SocketMatchTeamScore } from 'src/types/match'

type MatchRoomMap = Map<string, Record<string, number>>
type lobbies = FormattedLobby[]

@WebSocketGateway({ cors: true })
export class MatchWebSocketGateway {
    private socket: Socket
    public matchRooms: MatchRoomMap = new Map()
    public lobbies: lobbies = []

    @WebSocketServer()
    server: Server

    public constructor(private matchService: MatchService) {}

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
        // console.log('updatedScore', scores)
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

    // LOBBIES
    @SubscribeMessage('getLobbiesRequestByClient')
    async getLobbiesRequest(@MessageBody() payload: { socketId: string }) {
        const lobbies = await this.matchService.getAllOpenLobbies()
        this.server.to(payload.socketId).emit('getLobbiesResponse', lobbies)
    }

    @SubscribeMessage('getLobbiesByServer')
    async lobbiesCreatedEvent() {
        const lobbies = await this.matchService.getAllOpenLobbies()

        this.server.emit('getLobbiesResponse', lobbies)
    }
}
