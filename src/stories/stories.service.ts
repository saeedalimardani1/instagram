import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { CreateStoryDto } from './dto/create-story.dto';

@Injectable()
export class StoriesService {
  
  constructor(private usersService: UsersService, @InjectModel('Story') private readonly storyModel: Model<any>){}

  async create(createStoryDto: CreateStoryDto,userId: string, file: Express.Multer.File) {
    try {
      const storyWithImgAndAuthor = { ...createStoryDto }
      storyWithImgAndAuthor["media"] = file.path
      storyWithImgAndAuthor["author"] = userId
      const story = await this.storyModel.create(storyWithImgAndAuthor)
      return story
    } catch (error) {
      throw new Error(error.message)
    }
  }

  findAll(userId: string) {
    return this.usersService.findUserStories(userId)
  }

  async findStory( userId: string, id: string) {
    const story = await this.storyModel.findOne({_id: id})
    if(await this.usersService.userAccess(userId, story.author._id)){           
      return story
    }
    throw new HttpException('be in post dastresi nadari', HttpStatus.FORBIDDEN);
  }

  async getStoriesOfFollowing(userId: string){    
    return this.usersService.getStoriesOfFollowing(userId)
  }

  async remove(userId: string,id: string ) {
    try {
      await this.storyModel.deleteOne({_id: id, author: userId})
      return `post with ${id} has been deleted`
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
