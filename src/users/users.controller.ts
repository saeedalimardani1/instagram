import { Body, Controller, Get, HttpException, HttpStatus, Post, UseGuards, Request, Put, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';
import { createUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
    constructor(private readonly userService: UsersService){}
    
    //user profile get and update..............................
    @ApiTags('users')
    @Get()
    getUserProfile(@Request() req) {
      return this.userService.findOne(req.user.userId)
    }  

    @ApiTags('users')
    @Get(':id')
     getProfile(@Request() req, @Param('id') id? : string) {
      return this.userService.findOne(req.user.userId, id)
    }  

    @ApiTags('users')
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

    @ApiTags('users')
    @Put()
    update(@Body() updateUserdto: UpdateUserDto, @Request() req, @UploadedFile() file: Express.Multer.File) {
      return this.userService.update(req.user.userId, updateUserdto , file);
    }

    //follow and unfollow ....................................
    @ApiTags('follow and unfollow')
    @Post('follow/:id')
    follow(@Request() req, @Param('id') id: string){
      return this.userService.follow(req.user.userId, id)
    }
    
    @ApiTags('follow and unfollow')
    @Post('unfollow/:id')
    unfollow(@Request() req, @Param('id') id: string){
      return this.userService.unfollow(req.user.userId, id)
    }

    @ApiTags('follow and unfollow')
    @Post('block/:id')
    blockFollower(@Request() req, @Param('id') id: string){
      return this.userService.blockFollower(req.user.userId, id)
    }
    
    @ApiTags('follow and unfollow')
    @Put('follow/accept/:id')
    followAccept(@Request() req, @Param('id') id: string){
      return this.userService.followAccept(req.user.userId, id)
    }

    @ApiTags('follow and unfollow')
    @Put('follow/decline/:id')
    followDecline(@Request() req, @Param('id') id: string){
      return this.userService.followDecline(req.user.userId, id)
    }
}
