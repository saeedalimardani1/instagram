import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
      const post = await this.postModel.create(PostWithImgAndAuthor)
      return post
    } catch (error) {
      throw new Error(error.message)
    }

  }

  async findAll(userId: string) {
    const userPosts = await this.usersService.findUserPosts(userId)    
    return userPosts
  }
  async findPost( userId: string, id: string) {
    const post = await this.postModel.findOne({_id: id})
    if(await this.usersService.userAccess(userId, post.author._id)){           
      return post
    }
    throw new HttpException('be in post dastresi nadari', HttpStatus.FORBIDDEN);
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
      const post = await this.postModel.findOne({_id: id})
      if(await this.usersService.userAccess(userId, post.author._id)){
        await this.postModel.updateOne(
        {_id: id},
        {
          $push: {
            'likes': userId
          },
        }
        )
        return 'ok'
      }
      else{
        throw new HttpException('be in post dastresi nadari', HttpStatus.FORBIDDEN);
      }
    
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


  async getPostsOfFollowing(userId: string){    
    return this.usersService.getPostsOfFollowing(userId)
  }

  //comments .........................................
  async getCommentsOfPost(id: string, userId: string){
    const user = await this.usersService.findOne(userId)
    const post = await this.postModel.findOne({_id: id}).populate('author')
    if(await this.usersService.userAccess(userId, post.author._id)){
      return post.comments
    }
    else{
      throw new HttpException('be in post dastresi nadari', HttpStatus.FORBIDDEN);
    }
  }

  async createCommentForPost(id: string, text: string, userId: string){
    
    const user = await this.usersService.findOne(userId)
    const post = await this.postModel.findOne({_id: id}).populate('author')
    if(await this.usersService.userAccess(userId, post.author._id)){
      return await this.postModel.updateOne(
        {_id: id},
        {
          $push: {
            'comments': {author: userId, text}
          }
        }
      )
    }
    else{
      throw new HttpException('be in post dastresi nadari', HttpStatus.FORBIDDEN);
    }
  }

  async deleteCommentOfPosts(commentId: string, userId: string){
    try {
      const post = await this.postModel.findOne({"comments._id": commentId})
      console.log(post)
      if(userId == post.author._id){
        return await this.postModel.updateOne(
          {_id: post._id},
          {
            $pull: {
              'comments': { _id: commentId}
            }
          }
        )
      }
      return await this.postModel.updateOne(
        {_id: post._id},
        {
          $pull: {
            'comments': {author: userId, _id: commentId}
          }
        }
      )
      
    } catch (error) {
      throw new Error(error.message)
    }
  }

  //saving post for one user.........................
  async savePost(postId: string, userId: string){
    try {
      const post = await this.postModel.findOne({_id:postId}).populate('author')
      if(post){
        if(post.author.status == 'Private'){
          if(!post.author.followers.includes(userId)){
            return 'be in post dastresi nadari'
          }
        }
        return this.usersService.savePostForUser(postId, userId)
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async unsavePost(postId: string, userId: string){
    try {
      const post = await this.findPost(userId, postId)
      if(post){
        return this.usersService.unsavePostForUser(postId, userId)
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }
  
}
