import { Injectable } from '@nestjs/common'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { Team } from '@prisma/client'
import { Team as FormattedTeam } from './entities/team.entity'
import { plainToClass } from 'class-transformer'
import { TeamQueryParams } from './dto/query-param.dto'
import { flattenPrismaTeamUsers } from 'src/utils/team'
import { STARTING_ELO } from 'src/elo-config'

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) { }
  create(createTeamDto: CreateTeamDto) {
    return 'This action adds a new team'
  }

  async findAll(qp: TeamQueryParams) {
    const teams = await this.prisma.team.findMany({
      // ...(qp.limit && { take: qp.limit }),
      where: {
        completedSeasonPlacements: true
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
        eloHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    const filteredTeams = teams.filter((team) => {
      const teamSize = qp.matchMode === 'SINGLES' ? 1 : 2
      return team.users.length === teamSize
    })

    const flattenedUsers = filteredTeams
      .map((team) => {
        return plainToClass(FormattedTeam, {
          ...team,
          users: flattenPrismaTeamUsers(team),
          elo: team.eloHistory[0].elo,
        })
      })
      .sort((a, b) => b.elo - a.elo)

    if (qp.limit) {
      return flattenedUsers.slice(0, qp.limit)
    }

    return flattenedUsers
  }

  findOne(id: number) {
    return `This action returns a #${id} team`
  }

  // In the future: add a limit
  async getEloHistory(id: string) {
    return await this.prisma.elo.findMany({
      where: {
        teamId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  update(id: number, updateTeamDto: UpdateTeamDto) {
    return `This action updates a #${id} team`
  }

  remove(id: number) {
    return `This action removes a #${id} team`
  }

  async findOrCreateTeam(userIds: string[]): Promise<Team> {
    // find teams associated with every user
    const userTeams = await this.prisma.team.findMany({
      include: {
        users: {
          where: {
            userId: { in: userIds },
          },
        },
        eloHistory: {
          include: {
            team: true,
          },
          orderBy: {
            elo: 'desc',
          },
        },
      },
    })

    // check if the team composition already exists
    const foundTeam = userTeams.filter((team) => {
      return (
        team.users.length === userIds.length &&
        team.users.every((user) => {
          return userIds.includes(user.userId)
        })
      )
    })

    if (!foundTeam.length) {
      return await this.prisma.team.create({
        data: {
          users: {
            create: userIds.map((userId) => {
              return {
                user: {
                  connect: { id: userId },
                },
              }
            }),
          },
          eloHistory: {
            create: {
              elo: STARTING_ELO,
            },
          },
        },
      })
    }

    if (foundTeam.length > 1) {
      // Temporary error just for development

      throw new Error(
        `found more than one team for the associated ids ${foundTeam.length}, ${foundTeam[0].users[0]}, ${foundTeam[1].users[0]}`,
      )
    }

    return foundTeam[0]
  }
}
