import { Module } from '@nestjs/common';
import { ExamsModule } from './exams/exams.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ExamsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
