import { Document } from 'mongoose';


export class User extends Document {
    username: string;
    password: string;
}
export class UserData {
    id: string;
    username: string;
    password?: string;
    posts?: string;
  }