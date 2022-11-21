import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { PostsModule } from './posts/posts.module';
import { StoriesModule } from './stories/stories.module';
@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true,
  }),
  AuthModule, 
  UsersModule,
  MongooseModule.forRoot(process.env.MONGO_URI),
  PostsModule,
  StoriesModule,
  ]
})
export class AppModule {}
