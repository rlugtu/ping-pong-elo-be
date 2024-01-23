import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { plainToClass } from 'class-transformer'
import { UserEntity } from './entities/user.entity'
import { TeamService } from 'src/team/team.service'

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private teamService: TeamService,
    ) {}

    //
    async create(createUserDto: CreateUserDto, accessToken: string) {
        const user = await this.prisma.user.create({
            data: { ...createUserDto, accessToken },
        })

        this.prisma.team.create({
            data: {
                users: {
                    create: {
                        user: {
                            connect: {
                                id: user.id,
                            },
                        },
                    },
                },
                eloHistory: {
                    create: {
                        elo: 1400,
                    },
                },
            },
        })

        return user
    }

    findAll() {
        return `This action returns all users`
    }

    async findOne(id: string, accessToken: string): Promise<UserEntity> {
        const user = await this.prisma.user.findFirstOrThrow({
            where: {
                id,
            },
        })

        if (user) {
            await this.prisma.user.update({
                where: {
                    id,
                },
                data: {
                    accessToken,
                },
            })
        }

        const soloTeam = await this.teamService.findOrCreateTeam([id])

        const res = plainToClass(UserEntity, { ...soloTeam, ...user })

        return res
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`
    }

    remove(id: number) {
        return `This action removes a #${id} user`
    }
}
