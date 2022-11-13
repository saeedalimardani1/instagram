import { Body, Controller, Get, HttpException, HttpStatus, Post, UseGuards, Request, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';
import { createUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
    constructor(private readonly userService: UsersService){}
    
    @Get()
     getProfile(@Request() req) {
      return this.userService.findOne(req.user.username)
    }

    @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: (req: any, file: any, cb: any) => {
            const uploadPath = './upload/user';
            // Create folder if doesn't exist
            if (!existsSync(uploadPath)) {
              mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
          },
          filename: (req: any, file: any, cb: any) => {
            // Calling the callback passing the random name generated with the original extension name
            cb(
              null,
              `${req.user.username}-${file.originalname}`,
            );
          },
        }),
      }),
    )
    @Put()
    update(@Body() updateUserdto: UpdateUserDto, @Request() req, @UploadedFile() file: Express.Multer.File) {
     
      return this.userService.update(req.user.userId, updateUserdto , file);
    }
}
