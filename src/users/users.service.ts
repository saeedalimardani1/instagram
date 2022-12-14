import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { createUserDto } from './dto/user.dto';
import { User, UserData } from './types/user.types';
import * as bcrypt from 'bcrypt';
import { UpdatePostDto } from 'src/posts/dto/update-post.dto';
import { UpdateUserDto } from './dto/updateUser.dto';


@Injectable()
export class UsersService {
  
  constructor(@InjectModel('User') private readonly UserModel: Model<any>) {}

  userData(user: User): UserData {
    return {
      id: user._id,
      username: user.username,
      password: user.password
    };
  }

  //login find user..........
  async findUser(username: string){
    return await this.UserModel.findOne({username})
  }

  async userAccess(userId: string, id: string){
    const user = await this.UserModel.findOne({_id: id})
    
    if(user.status == 'Private'){
      if(user.followers.includes(userId) || userId == id){ 
        return true
      }
      else{
        return false
      }
    }else{
      return true
    }
  }
  async findOne(userId: string, id?:string){
    if(id){
        if(!this.userAccess(userId, id)){
          return await this.UserModel.findOne({_id: id}, 'username nickname description photo')
        }  
        return await this.UserModel.findOne({_id: id},'username nickname description photo').populate('posts')
      }
    const user = await this.UserModel.findOne({_id: userId});
    return user
    }



  async findUserPosts(userId: string, id? : string){
    if(id){
      console.log(id);
      
      const user = await this.UserModel.findOne({_Id: userId}).populate({
        path: 'posts',
        match: { _id: id },
      })
      return user.posts
    }
    const users = await this.UserModel.findOne({_Id: userId}).populate('posts');
    return users.posts
  }

  async findUserStories(userId: string, id? : string){
    if(id){
      
      const user = await this.UserModel.findOne({_id: userId}).populate({
        path: 'stories',
        match: { _id: id },
      })
      return user.stories
    }
    const users = await this.UserModel.findOne({_id: userId}).populate('stories');
    return users.stories
  }

  async userCreation(userCreateData: createUserDto){
    const {username, password} = userCreateData
    const hashedPass = await bcrypt.hash(password, 10)
    const user = await this.UserModel.create({username, password: hashedPass})
    return user
  }
  async update(id: string, updateUserDto: UpdateUserDto, file: Express.Multer.File){
    try {
      const oldUser = await this.UserModel.findOne({_id: id })
      if(file){
        updateUserDto["photo"] = file.path
      }
      await this.UserModel.updateOne(
        {_id: id},
        {
          $set: {
            'nickname': 
              updateUserDto.nickname !== undefined ?
                updateUserDto.nickname : oldUser.nickname,
            'description': 
              updateUserDto.description !== undefined ?
               updateUserDto.description : oldUser.description,
            'photo': 
              updateUserDto.photo !== undefined ?
               updateUserDto.photo : oldUser.photo,
            'age': 
              updateUserDto.age !== undefined ?
               updateUserDto.age : oldUser.age,
            'status':
              updateUserDto.status !== undefined ?
               updateUserDto.status : oldUser.status, 
          }
        }
      )
      return `user update shod`
      
    } catch (error) {
      throw new Error(error.message)
    }
  }

  //follow and unfollow ..............................................
  async follow(userId: string , id: string){
      const userToFollow = await this.UserModel.findOne({_id: id})
      const user = await this.UserModel.findOne({_id: userId})
      
      if(user && userToFollow && !user.following.includes(id) && !user.followingRequests.includes(id)){
        if(userToFollow.status == 'Public'){
          userToFollow.followers.push(userId)
          user.following.push(id)
          await userToFollow.save()
          await user.save()
          return `you are following ${id}`
        }
        else{
          userToFollow.followRequests.push(userId)
          user.followingRequests.push(id)
          await userToFollow.save()
          await user.save()
          return `request sent to user with ${userToFollow.username} id`
        }
      } 
      throw new HttpException('follow request error', HttpStatus.FORBIDDEN);
  }
  async unfollow(userId: string , id: string){
    try {
      const userToUnfollow = await this.UserModel.updateOne(
        {_id: id},
        {
          $pull: {
            'followers': userId
          }
        }
        )
      const user = await this.UserModel.updateOne(
        {_id: userId},
        {
          $pull: {
            'following': id
          }
        }
        )
      return user

    } catch (error) {
      throw new Error(error.message)
    }
  }

  async blockFollower(userId: string , id: string){
    try {
      const userToBlock = await this.UserModel.updateOne(
        {_id: id},
        {
          $pull: {
            'following': userId,
          }
        }
        )
      const user = await this.UserModel.updateOne(
        {_id: userId},
        {
          $pull: {
            'followers': id,
          }
        }
        )
      return user

    } catch (error) {
      throw new Error(error.message)
    }
  }

  async followAccept(userId: string, id: string){
    try {
      const user = await this.UserModel.findOne({_id: userId})
      if(user.followRequests.includes(id)){
        const updatedUserFollowers = await this.UserModel.updateOne(
          {_id: userId},
          {
            $pull: {
              'followRequests': id
            },
            $push: {
              'followers': id
            }
          }
        )
        await this.UserModel.updateOne(
          {_id: id},
          {
            $pull: {
              'followingRequests': userId
            },
            $push: {
              'following': userId
            }
          }
        )
        return updatedUserFollowers
      }
      throw new HttpException('error accepting follow request', HttpStatus.BAD_REQUEST)

    } catch (error) {
      throw new HttpException('error accepting follow request', HttpStatus.BAD_REQUEST)
    }
  }

  async followDecline(userId: string, id: string){
    try {
      const updatedUserFollowers = await this.UserModel.updateOne(
        {_id: userId},
        {
          $pull: {
            'followRequests': id
          }
        }
      )
      await this.UserModel.updateOne(
        {_id: id},
        {
          $pull: {
            'followingRequests': userId
          }
        }
      )
      return updatedUserFollowers
    } catch (error) {
      throw new Error(error.message)
    }
  }

  //home page ....................................................
  async getPostsOfFollowing(userId: string){
    const user =  await this.UserModel.findOne({_id: userId}).select('username -_id').populate({
      path: 'following',
      select: 'posts -_id',
      populate: { path: 'posts',perDocumentLimit: 2 }
    })
    let posts = user.following.map((obj) => {return obj.posts} )
    return posts
  }

  async getStoriesOfFollowing(userId: string){
    const user =  await this.UserModel.findOne({_id: userId}).select('username -_id').populate({
      path: 'following',
      select: 'stories -_id',
      populate: { path: 'stories' }
    })
    let stories = user.following.map((obj) => {return obj.stories} )
    return stories
  }

  //save and delete saved post for user............................
  async savePostForUser(postId: string, userId: string){
    const user = await this.UserModel.findOne({_id: userId}, 'savedPosts')
    if(user.savedPosts.includes(postId)){
      return 'ghablan save kardi'
    }
    const updateUser = await this.UserModel.updateOne(
      {_id: userId},
      {
        $push: {
          'savedPosts': postId
        }
      }
    )
    return updateUser
  }

  async unsavePostForUser(postId: string, userId: string){
    const updateUser = await this.UserModel.updateOne(
      {_id: userId},
      {
        $pull: {
          'savedPosts': postId
        }
      }
    )
    return updateUser
  }
}