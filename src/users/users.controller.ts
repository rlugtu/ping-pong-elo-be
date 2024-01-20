import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { parseBearerToken } from 'src/utils/util'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto, @Headers('authorization') accessToken: string) {
        try {
            accessToken = parseBearerToken(accessToken)

            return this.usersService.create(createUserDto, accessToken)
        } catch (error) {
            console.log(error)
        }
    }

    @Get()
    findAll() {
        return this.usersService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Headers('authorization') accessToken: string) {
        try {
            accessToken = parseBearerToken(accessToken)
            return this.usersService.findOne(id, accessToken)
        } catch (error) {
            console.log(error)
            // console.log({ error, id, accessToken })
        }
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id)
    }
}
