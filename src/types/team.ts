import { MatchMode } from '@prisma/client'

export interface TeamQueryParams {
    matchMode: MatchMode
    sort?: 'asc' | 'desc'
    limit?: number
}
