import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common'
import { MatchService } from './match.service'
import { CreateMatchDto } from './dto/create-match.dto'
import { JoinMatchDto, UpdateMatchDto } from './dto/update-match.dto'
import { Match } from '@prisma/client'

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @Post()
    create(@Body() createMatchDto: CreateMatchDto) {
        try {
            return this.matchService.create(createMatchDto)
        } catch (error) {}
    }

    @Get('lobbies')
    getAllLobbies() {
        try {
            return this.matchService.getAllOpenLobbies()
        } catch (error) {}
    }

    @Get('current-matches')
    async getUserCurrentMatches(@Headers('authorization') token: string): Promise<Match[]> {
        try {
            return this.matchService.getUserCurrentMatches(token)
        } catch (error) {}
    }

    @Get()
    findAll() {
        return this.matchService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.matchService.findOne(+id)
    }

    @Patch(':id/join')
    async joinMatch(@Param('id') id: string, @Body() joinMatchDto: JoinMatchDto) {
        try {
            console.log('trying')
            return await this.matchService.joinMatch(id, joinMatchDto)
        } catch (error) {
            console.log({ error })
        }
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMatchDto: UpdateMatchDto) {
        return this.matchService.update(+id, updateMatchDto)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.matchService.remove(+id)
    }
}
