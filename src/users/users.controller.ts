import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto, @Headers('authorization') token: string) {
        console.log(token)
        const test = { ...createUserDto, accessToken: token }
        return this.usersService.create(test)
    }

    @Get()
    findAll() {
        return this.usersService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Headers('authorization') token: string) {
        try {
            return this.usersService.findOne(id, token)
        } catch (error) {
            console.log({ error, id, token })
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
