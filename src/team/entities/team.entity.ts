import { Elo, User } from '@prisma/client'
import { Exclude } from 'class-transformer'

export class Team {
    id: string
    users: User[]
    elo: number

    @Exclude()
    eloHistory: Elo[]
}
