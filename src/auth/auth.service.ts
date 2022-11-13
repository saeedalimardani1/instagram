import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService,) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    // console.log(user)
    if (user) {

      const validPass = await bcrypt.compare(pass, user.password);
      if (validPass) {
        const result = this.usersService.userData(user);
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { user: user.username, userId: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}