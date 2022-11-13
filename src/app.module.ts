import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { PostsModule } from './posts/posts.module';
@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true,
  }),
  AuthModule, 
  UsersModule,
  MongooseModule.forRoot(process.env.MONGO_URI),
  PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
