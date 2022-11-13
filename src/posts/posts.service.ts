import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private usersService: UsersService, @InjectModel('Post') private readonly postModel: Model<any>){}

  async create(createPostDto: CreatePostDto, user, file: Express.Multer.File,) {
    
    try {
      const PostWithImgAndAuthor = { ...createPostDto }
      PostWithImgAndAuthor["photo"] = file.path
      PostWithImgAndAuthor["author"] = user.userId
      console.log(PostWithImgAndAuthor);
      
      const post = await this.postModel.create(PostWithImgAndAuthor)
      return post
    } catch (error) {
      throw new Error(error.message)
    }

  }

  async findAll(username: string) {
    const userPosts = await this.usersService.findUserPosts(username)    
    return userPosts
  }

  async findOnePost(username: string, id: string) {
    const userPost = await this.usersService.findUserPosts(username, id)    
    return userPost
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
