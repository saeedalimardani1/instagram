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

  async findOne(username: string){
    const user = await this.UserModel.findOne({username: username});
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
}