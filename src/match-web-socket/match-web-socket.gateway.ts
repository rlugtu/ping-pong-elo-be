import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { MatchState } from '@prisma/client'
import { Server } from 'socket.io'
import { FormattedLobby } from 'src/match/entities/match.entity'
import { MatchService } from 'src/match/match.service'
import { Notification } from 'src/types/notification'

type MatchRoomMap = Map<string, MatchRoomInfo>
type MatchRoomInfo = {
    scores: {
        [teamId: string]: number
    }
    state: MatchState
    participants: string[] // string of userIds
}
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

            const participants = [
                ...foundMatch.teamA.users.map((user) => user.id),
                ...foundMatch.teamB.users.map((user) => user.id),
            ]

            const matchRoomInfo = {
                scores,
                state: foundMatch.state,
                participants,
            }

            this.matchRoomsById.set(foundMatch.id, matchRoomInfo)

            this.server.to(matchId).emit('matchScoreUpdated', {
                matchId,
                ...matchRoomInfo,
            })

            // alert other users you're in the room
            const peopleInRoom = await this.server.in(matchId).fetchSockets()
            const matchParticpantAmount = foundMatch.mode === 'SINGLES' ? 2 : 4
            if (peopleInRoom.length < matchParticpantAmount) {
                const socketsToEmitTo = participants
                    .map((userId) => this.socketsByUserId.get(userId))
                    .filter((socketId) => socketId !== payload.socketId)

                const notificationMessage: Notification = {
                    title: 'Opponent has checked in',
                    description:
                        'Your opponent is waiting for you in your match. Head over there to start recording your score.',
                    cta: {
                        name: 'Go',
                        link: `/match/${foundMatch.id}`,
                    },
                }

                socketsToEmitTo.forEach((socketId) => {
                    this.server.in(socketId).emit('notificationAlert', notificationMessage)
                })
            }
        } else {
            const matchRoomInfo = this.matchRoomsById.get(matchId)
            this.setAndSendScoresToMatchClients({
                matchId,
                matchRoomInfo,
            })
        }
    }

    @SubscribeMessage('matchScoreUpdateEvent')
    async setAndSendScoresToMatchClients(
        @MessageBody()
        payload: {
            matchId: string
            matchRoomInfo: MatchRoomInfo
        },
    ) {
        const { matchId } = payload

        this.matchRoomsById.set(matchId, payload.matchRoomInfo)
        this.server.to(matchId).emit('matchScoreUpdated', {
            matchId,
            matchRoomInfo: payload.matchRoomInfo,
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
