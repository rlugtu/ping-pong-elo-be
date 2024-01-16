import { Exclude } from 'class-transformer'

export class UserEntity {
    firstName: string
    lastName: string
    elo: number
    department: string
    email: string

    @Exclude()
    accessToken: string

    @Exclude()
    createdAt: Date

    @Exclude()
    updatedAt: Date
}
