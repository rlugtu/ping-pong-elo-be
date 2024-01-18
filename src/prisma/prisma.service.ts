import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient, Team } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient {
    async onModuleInit() {
        await this.$connect()
    }
}
