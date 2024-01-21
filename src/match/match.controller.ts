import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common'
import { MatchService } from './match.service'
import { CreateMatchDto } from './dto/create-match.dto'
import { JoinMatchDto, UpdateMatchDto, UpdateMatchScoreDto } from './dto/update-match.dto'
import { MatchState } from '@prisma/client'
import { parseBearerToken } from 'src/utils/util'
import { FormattedMatch } from './entities/match.entity'

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @Post()
    create(@Body() createMatchDto: CreateMatchDto) {
        try {
            return this.matchService.create(createMatchDto)
        } catch (error) {}
    }

    @Get('state/:matchState')
    async findByState(@Param('matchState') matchState: MatchState): Promise<FormattedMatch[]> {
        try {
            return this.matchService.findAllByState(matchState)
        } catch (error) {}
    }

    @Get('lobbies')
    getAllLobbies() {
        try {
            return this.matchService.getAllOpenLobbies()
        } catch (error) {}
    }

    @Get('in-progress')
    async getUserCurrentMatches(
        @Headers('authorization') token: string,
    ): Promise<FormattedMatch[]> {
        try {
            const authToken = parseBearerToken(token)
            return this.matchService.getUserCurrentMatches(authToken)
        } catch (error) {}
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            return this.matchService.findOne(id)
        } catch (error) {}
    }

    @Patch(':id/score')
    async updateMatchScore(@Param('id') id: string, @Body() scoreData: UpdateMatchScoreDto) {
        try {
            return await this.matchService.updateMatchScore(id, scoreData)
        } catch (error) {
            console.log({ error })
        }
    }

    @Patch(':id/join')
    async joinMatch(@Param('id') id: string, @Body() joinMatchDto: JoinMatchDto) {
        try {
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
