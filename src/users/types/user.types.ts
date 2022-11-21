import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';


export class User extends Document {
    @ApiProperty()
    username: string;
    @ApiProperty()
    password: string;
}
export class UserData {
    id: string;
    username: string;
    password?: string;
    posts?: string;
  }