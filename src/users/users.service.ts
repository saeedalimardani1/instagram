import { Injectable } from '@nestjs/common';
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

  async findOne(userId: string, id?:string){
    if(id){
      const user = await this.UserModel.findOne({_id: id})
      if(user.status == 'Private'){
        if(!user.followers.includes(userId)){          
          return await this.UserModel.findOne({_id: id}, 'username nickname description photo')
        }
        return await this.UserModel.findOne({_id: id},'username nickname description photo').populate('posts')
      }
    }
    const user = await this.UserModel.findOne({_id: userId});
    return user
  }

  async findUserPosts(username: string, id? : string){
    if(id){
      console.log(id);
      
      const user = await this.UserModel.findOne({username: username}).populate({
        path: 'posts',
        match: { _id: id },
      })
      return user.posts
    }
    const users = await this.UserModel.findOne({username: username}).populate('posts');
    return users.posts
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

  async follow(userId: string , id: string){
    try {
      const userToFollow = await this.UserModel.findOne({_id: id})
      const user = await this.UserModel.findOne({_id: userId})
      console.log(user, userToFollow);
      
      if(user && userToFollow){
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
          return `request sent to user with ${id} id`
        }
      } return 'no such user'
      
    } catch (error) {
      throw new Error(error.message)
    }
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
            'following': userId
          }
        }
        )
      const user = await this.UserModel.updateOne(
        {_id: userId},
        {
          $pull: {
            'followers': id
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
    } catch (error) {
      throw new Error(error.message)
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

  async getPostsOfFollowing(userId: string){
    const user =  await this.UserModel.findOne({_id: userId}).select('username -_id').populate({
      path: 'following',
      select: 'posts -_id',
      populate: { path: 'posts',perDocumentLimit: 2 }
    })
    let posts = user.following.map((obj) => {return obj.posts} )
    return posts
  }
}