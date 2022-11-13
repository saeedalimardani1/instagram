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

  async update(userId: string, id: string, updatePostDto: UpdatePostDto) {
    const postOld = await this.postModel.findOne({_id: id, author: userId})
    console.log(postOld);
    try {
      console.log(updatePostDto);
      
      const updatedPost = await this.postModel.updateOne(
        {
          _id: id,
          author : userId
        },
        {
          $set: {
            'title':
                updatePostDto.title !== undefined
                  ? updatePostDto.title
                  : postOld.title,
            'description':
                updatePostDto.description !== undefined
                  ? updatePostDto.description
                  : postOld.description,
          }, 
          $push: {
            'tags':
            updatePostDto.tags !== undefined
              ? updatePostDto.tags
              : undefined,
          },
          $pull: {
            'tags':
            updatePostDto.deletetags !== undefined
              ? updatePostDto.deletetags
              : undefined,
          }
      })
      
      return updatedPost
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async remove(id: string, userId: string) {
    try {
      await this.postModel.deleteOne({_id: id, author: userId})
      return `post with ${id} has been deleted`
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async postLike(id: string, userId: string) {
   
   try {
     const post = await this.postModel.updateOne(
       {_id: id},
       {
         $push: {
           'likes': userId
         },
       }
     )
     return 'ok'
    
   } catch (error) {
    throw new Error(error.message)
   }
  }

  async postUnlike(id: string, userId: string) {
    try {
      const post = await this.postModel.updateOne(
         {_id: id},
         {
           $pull: {
             'likes': userId
           },
         }
       )
       return `ok`
     
    } catch (error) {
     throw new Error(error.message)
    }
  }

  async findPost(id: string) :Promise<UpdatePostDto>{
    return await this.postModel.findOne({_id: id})
  }
}
