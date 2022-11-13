import { Body, Controller, Get, HttpException, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { createUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService){}
    
    @UseGuards(JwtAuthGuard)
    @Get('profile')
     getProfile(@Request() req) {
      return this.userService.findOne(req.user.username)
    }
}
