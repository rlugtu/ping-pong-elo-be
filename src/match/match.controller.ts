import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { MatchService } from './match.service'
import { CreateMatchDto } from './dto/create-match.dto'
import { JoinMatchDto, TeamScoreDto, UpdateMatchDto } from './dto/update-match.dto'
import { MatchState } from '@prisma/client'
import { FormattedMatch } from './entities/match.entity'
import { match } from 'assert'

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) { }


  @Get('calculateMatchScores')
  async calculateMatchScores() {
    try {
      return await this.matchService.calculateMatchScores()
    } catch (error) { }
  }

  @Get()
  async getAllMatches() {
    try {
      return await this.matchService.getAllMatches()
    } catch (error) { }
  }

  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    try {
      return this.matchService.create(createMatchDto)
    } catch (error) { }
  }

  @Get('state/:matchState')
  async findByState(
    @Param('matchState') matchState: MatchState,
    @Query('userId') userId: string,
  ): Promise<FormattedMatch[]> {
    try {
      return this.matchService.findAllByState(matchState, userId)
    } catch (error) { }
  }

  @Get('lobbies')
  getAllLobbies() {
    try {
      return this.matchService.getAllOpenLobbies()
    } catch (error) { }
  }

  @Get('in-progress/user/:userId')
  async getUserCurrentMatches(@Param('userId') userId: string): Promise<FormattedMatch[]> {
    try {
      return this.matchService.getUserCurrentMatches(userId)
    } catch (error) { }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return this.matchService.findOne(id)
    } catch (error) { }
  }

  @Patch(':id/score')
  async updateMatchScore(@Param('id') id: string, @Body() scoreData: TeamScoreDto) {
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
  async remove(@Param('id') id: string) {
    try {
      const res = await this.matchService.remove(id)

      return res
    } catch (error) { }
  }
}
