import { Test, TestingModule } from '@nestjs/testing'
import { MatchService } from './match.service'
import { UpdateEloRatingDto } from './dto/update-match.dto'
import { PrismaService } from 'src/prisma/prisma.service'

describe.only('MatchService', () => {
    let service: MatchService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchService, PrismaService],
        }).compile()

        service = module.get<MatchService>(MatchService)
    })

    it.only('should be defined', async () => {
        const temp: UpdateEloRatingDto = {
            teamA: {
                teamId: '1',
                score: 11,
                isFinalScore: true,
            },
            teamB: {
                teamId: '2',
                score: 0,
                isFinalScore: true,
            },
        }

        await service.updateEloRatings(temp)
    })
})
