import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { ExamsDAO } from './dao/exams.dao';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({isGlobal: true}),
    ClientsModule.registerAsync([
      {
        name: 'COURSE_GRPC',
        imports: [ConfigModule],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'course',
            protoPath: require.resolve('ulms-contracts/protos/course.proto'),
            url: cfg.get<string>('COURSE_GRPC_URL') ?? '0.0.0.0:50053',
            loader: {
              longs: String,
              enums: String,
              defaults: false,
              objects: true,
              arrays: true
            }
          }
        }),
        inject: [ConfigService]
      },
    ])
  ],
  controllers: [ExamsController],
  providers: [ExamsService, ExamsDAO],
  exports: [ExamsService, ExamsDAO],
})
export class ExamsModule {}
