import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { MatchState } from '@prisma/client'
import { Server } from 'socket.io'
import { FormattedLobby, FormattedMatch } from 'src/match/entities/match.entity'
import { MatchService } from 'src/match/match.service'
import { MatchChallenge } from 'src/types/match'
import { Notification } from 'src/types/notification'

type MatchRoomMap = Map<string, MatchRoomInfo>
type MatchRoomInfo = {
    state: MatchState
    match: FormattedMatch
    participants: string[] // string of userIds
}
@WebSocketGateway({ cors: true })
export class MatchWebSocketGateway {
    public matchRoomsById: MatchRoomMap = new Map()
    public lobbies: FormattedLobby[] = []
    public socketsByUserId: Map<string, string> = new Map()
    public challengeMatchRequestsByChallengeeId: Map<string, MatchChallenge> = new Map()

    @WebSocketServer()
    server: Server

    public constructor(private matchService: MatchService) {}

    async getOrSetMatchRoomByMatchId(matchId: string) {
        const matchRoom = this.matchRoomsById.get(matchId)

        if (!matchRoom) {
            const foundMatch = await this.matchService.findOne(matchId)

            const participants = [
                ...foundMatch.teamA.users.map((user) => user.id),
                ...foundMatch.teamB.users.map((user) => user.id),
            ]

            const matchRoomInfo = {
                state: foundMatch.state,
                participants,
                match: foundMatch,
            }

            this.matchRoomsById.set(foundMatch.id, matchRoomInfo)
            return matchRoomInfo
        }

        return matchRoom
    }

    @SubscribeMessage('newConnection')
    async saveUserToServer(
        @MessageBody()
        payload: {
            userId: string
            socketId: string
        },
    ) {
        this.socketsByUserId.set(payload.userId, payload.socketId)

        const challengeMatch = this.challengeMatchRequestsByChallengeeId.get(payload.userId)
        if (challengeMatch) {
            this.server.in(payload.socketId).emit('challengeMatchRequest', challengeMatch)
        }
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
        this.server.in(socketId).socketsJoin(matchId)

        const matchRoom = await this.getOrSetMatchRoomByMatchId(matchId)
        const { match, participants } = matchRoom

        // alert other users you're in the room
        const peopleInRoom = await this.server.in(matchId).fetchSockets()
        const matchParticpantAmount = match.mode === 'SINGLES' ? 2 : 4
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
                    link: `/match/${match.id}`,
                },
            }

            socketsToEmitTo.forEach((socketId) => {
                this.server.in(socketId).emit('notificationAlert', notificationMessage)
            })
        }
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

    /**
      OPEN LOBBIES
      Visible to all players
    */
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

    /**
      MATCH
      Match info
    */

    @SubscribeMessage('getMatchInfoRequest')
    async getAndEmitMatchInfoToUser(@MessageBody() payload: {
      matchId: string,
      socketId: string
    }) {
      const matchRoom = await this.getOrSetMatchRoomByMatchId(payload.matchId)

      const { match } = matchRoom
      this.server.in(payload.socketId).emit('getMatchInfoResponse', match)
    }

    @SubscribeMessage('anounceMatchUpdatesToParticipantsRequest')
    async getAndAnounceMatchInfoToParticipants(@MessageBody() payload: {
      matchId: string,
      socketId: string
    }) {
      const { matchId } = payload;
      const matchRoom = await this.getOrSetMatchRoomByMatchId(matchId)

      const updatedMatch = await this.matchService.findOne(matchId)
      this.matchRoomsById.set(matchId, {...matchRoom, match: updatedMatch})
      const socketsToEmitTo = matchRoom.participants
          .map((userId) => this.socketsByUserId.get(userId))

      socketsToEmitTo.forEach((socketId) => {
          this.server.in(socketId).emit('matchInfoUpdateAnouncement', updatedMatch)
      })
    }



    /**
    IN PROGRESS MATCHES
    */
    @SubscribeMessage('getInProgressMatchesByUserIdRequest')
    async getInProgressMatchesByUserId(
        @MessageBody() payload: { userId: string; socketId: string },
    ) {
        const inProgressMatches = await this.matchService.findAllByState(
            'IN_PROGRESS',
            payload.userId,
        )

        this.server
            .in(payload.socketId)
            .emit('getInProgressMatchesByUserIdResponse', inProgressMatches)
    }

    @SubscribeMessage('notifyParticipantsOnMatchProgressEvent')
    async notifyParticipantsOnMatchProgressEvent(@MessageBody() userIds: string[]) {
        userIds.forEach((userId) => {
            const socketId = this.socketsByUserId.get(userId)

            this.server.in(socketId).emit('shouldUpdateInProgressMatches', userId)
        })
    }

    // CHALLENGE MATCH
    @SubscribeMessage('challengeMatchRequest')
    async sendChallengeMatchRequestToChallengee(
        @MessageBody()
        payload: MatchChallenge,
    ) {
        this.challengeMatchRequestsByChallengeeId.set(payload.challengeeUserId, payload)

        const challengeeSocket = this.socketsByUserId.get(payload.challengeeUserId)

        this.server.in(challengeeSocket).emit('challengeMatchRequest', payload)
    }

    // CHALLENGE MATCH
    @SubscribeMessage('clearUserChallengeRequest')
    async clearChallengeMatchNotifc(
        @MessageBody()
        payload: {
            userId: string
        },
    ) {
        this.challengeMatchRequestsByChallengeeId.delete(payload.userId)

        const challengeeSocket = this.socketsByUserId.get(payload.userId)
        this.server.in(challengeeSocket).emit('challengeMatchRequest', null)
    }
}
