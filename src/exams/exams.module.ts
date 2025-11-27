import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { ExamsDAO } from './dao/exams.dao';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExamsController],
  providers: [ExamsService, ExamsDAO],
  exports: [ExamsService, ExamsDAO],
})
export class ExamsModule {}
