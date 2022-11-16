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

  async getPostsOfFollowing(userId: string){    
    return this.usersService.getPostsOfFollowing(userId)
  }

  //comments .........................................
  async getCommentsOfPost(id: string, userId: string){
    const user = await this.usersService.findOne(userId)
    const post = await this.postModel.findOne({_id: id}).populate('author')
    if(post.author.status == "Private" && JSON.stringify(post.author._id) !== JSON.stringify(userId)){
      if(user.following.includes(post.author._id)){
        return post.comments
      }
      else{
        return 'you dont have access to this post'
      }
    }
    else{
      return post.comments
    }
  }

  async createCommentForPost(id: string, text: string, userId: string){
    const user = await this.usersService.findOne(userId)
    const post = await this.postModel.findOne({_id: id}).populate('author')
    if(post.author.status == "Private" && JSON.stringify(post.author._id) !== JSON.stringify(userId)){
      if(user.following == undefined || !user.following.includes(post.author._id) ){
        return 'you dont have access to this post' 
      }
    }
    
    return await this.postModel.updateOne(
      {_id: id},
      {
        $push: {
          'comments': {author: userId, text}
        }
      }
    )
  }

  async deleteCommentOfPosts(id: string,commentId: string, userId: string){
    try {
      const post = await this.postModel.findOne({_id: id})
      console.log(post);
      
      if(post.author._id &&  JSON.stringify(post.author._id) == JSON.stringify(userId)){
        return await this.postModel.updateOne(
          {_id: id},
          {
            $pull: {
              'comments': { _id: commentId}
            }
          }
        )
      }
      return await this.postModel.updateOne(
        {_id: id},
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
      const post = await this.findPost(postId)
      if(post){
        return this.usersService.unsavePostForUser(postId, userId)
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }
  
}
