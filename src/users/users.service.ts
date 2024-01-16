import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { plainToClass } from 'class-transformer'
import { UserEntity } from './entities/user.entity'

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    create(createUserDto: CreateUserDto) {
        return this.prisma.user.create({
            data: createUserDto,
        })
    }

    findAll() {
        return `This action returns all users`
    }

    findOne(id: string): UserEntity {
        const user = this.prisma.user.findFirstOrThrow({
            where: {
                id,
            },
        })

        return plainToClass(UserEntity, user)
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`
    }

    remove(id: number) {
        return `This action removes a #${id} user`
    }
}
