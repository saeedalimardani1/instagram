import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { createUserDto } from './dto/user.dto';
import { User, UserData } from './types/user.types';
import * as bcrypt from 'bcrypt';


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

  async findOne(username: string): Promise<any> {
    const user = await this.UserModel.findOne({username: username});
    return user
  }
  async userCreation(userCreateData: createUserDto){
    const {username, password} = userCreateData
    const hashedPass = await bcrypt.hash(password, 10)
    const user = await this.UserModel.create({username, password: hashedPass})
    return user
  }
}