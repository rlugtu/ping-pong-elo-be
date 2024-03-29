import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        try {
            return this.usersService.create(createUserDto)
        } catch (error) {
            console.log('create error:', error)
        }
    }

    @Get()
    async findAll() {
        try {
            const response = await this.usersService.findAll()
            return response
        } catch (error) {}
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            return await this.usersService.findOne(id)
        } catch (error) {}
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
