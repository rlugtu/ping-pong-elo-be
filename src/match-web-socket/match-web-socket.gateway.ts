import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { FormattedLobby } from 'src/match/entities/match.entity'
import { MatchService } from 'src/match/match.service'
import { SocketMatchTeamScore } from 'src/types/match'

type MatchRoomMap = Map<string, Record<string, number>>
@WebSocketGateway({ cors: true })
export class MatchWebSocketGateway {
    public matchRoomsById: MatchRoomMap = new Map()
    public lobbies: FormattedLobby[] = []
    public socketsByUserId: Map<string, string> = new Map()

    @WebSocketServer()
    server: Server

    public constructor(private matchService: MatchService) {}

    @SubscribeMessage('newConnection')
    async saveUserToServer(
        @MessageBody()
        payload: {
            userId: string
            socketId: string
        },
    ) {
        this.socketsByUserId.set(payload.userId, payload.socketId)
    }

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

        const matchRoomExists = this.matchRoomsById.get(matchId)
        if (!matchRoomExists) {
            const foundMatch = await this.matchService.findOne(matchId)
            const scores = {
                [foundMatch.teamA.id]: foundMatch.teamA.score,
                [foundMatch.teamB.id]: foundMatch.teamB.score,
            }

            this.matchRoomsById.set(foundMatch.id, scores)
            this.server.to(matchId).emit('matchScoreUpdated', {
                matchId,
                scores,
            })
        } else {
            const scores = this.matchRoomsById.get(matchId)
            this.setAndSendScoresToMatchClients({
                matchId,
                scores,
            })
        }
    }

    @SubscribeMessage('matchScoreUpdateEvent')
    async setAndSendScoresToMatchClients(@MessageBody() payload: SocketMatchTeamScore) {
        const { matchId, scores } = payload

        this.matchRoomsById.set(matchId, scores)
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

    // IN PROGRESS MATCHES
    @SubscribeMessage('getInProgressMatchesByUserIdRequest')
    async getInProgressMatchesByUserId(
        @MessageBody() payload: { userId: string; socketId: string },
    ) {
        const inProgressMatches = await this.matchService.findAllByState(
            'IN_PROGRESS',
            payload.userId,
        )

        this.server.emit('getInProgressMatchesByUserIdResponse', inProgressMatches)
    }

    @SubscribeMessage('notifyParticipantsOnMatchProgressEvent')
    async notifyParticipantsOnMatchProgressEvent(@MessageBody() userIds: string[]) {
        userIds.forEach((userId) => {
            const socketId = this.socketsByUserId.get(userId)

            this.server.in(socketId).emit('shouldUpdateInProgressMatches', userId)
        })
    }
}
