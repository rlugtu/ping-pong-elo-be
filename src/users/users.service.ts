import { Injectable } from '@nestjs/common'
import { CreateUserDto, GetUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { plainToClass } from 'class-transformer'
import { UserEntity } from './entities/user.entity'

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    create(createUserDto: CreateUserDto, accessToken: string) {
        return this.prisma.user.create({
            data: { ...createUserDto, accessToken },
        })
    }

    findAll() {
        return `This action returns all users`
    }

    async findOne(id: string, accessToken: string): Promise<UserEntity> {
        // need to add accessToken here
        const user = await this.prisma.user.findFirst({
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

        return plainToClass(UserEntity, user)
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`
    }

    remove(id: number) {
        return `This action removes a #${id} user`
    }
}
