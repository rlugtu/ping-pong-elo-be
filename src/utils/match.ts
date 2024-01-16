import { CreateMatchDto } from 'src/match/dto/create-match.dto'

export function prepareMatchDtoForCreate(match: CreateMatchDto): CreateMatchDto {
    return {
        ...match,
        sideAScore: 0,
        sideBScore: 0,
    }
}
