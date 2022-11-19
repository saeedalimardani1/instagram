import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StorySchema } from './schema/story.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Story', schema: StorySchema }]), UsersModule],
  controllers: [StoriesController],
  providers: [StoriesService]
})
export class StoriesModule {}
