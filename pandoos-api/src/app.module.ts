import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PlaylistModule } from './playlist/playlist.module';
import { GamificationModule } from './gamification/gamification.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AuthModule, UserModule, PlaylistModule, GamificationModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
