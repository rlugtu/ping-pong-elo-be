import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { TeamService } from './team.service'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { TeamQueryParams } from './dto/query-param.dto'

@Controller('team')
export class TeamController {
    constructor(private readonly teamService: TeamService) {}

    @Post()
    create(@Body() createTeamDto: CreateTeamDto) {
        return this.teamService.create(createTeamDto)
    }

    @Get()
    async findAll(@Query() qp: TeamQueryParams) {
        try {
            return this.teamService.findAll(qp)
        } catch (error) {}
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.teamService.findOne(+id)
    }

    @Get(':id/elo')
    getEloHistory(@Param('id') id: string) {
        return this.teamService.getEloHistory(id)
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
        return this.teamService.update(+id, updateTeamDto)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.teamService.remove(+id)
    }
}
