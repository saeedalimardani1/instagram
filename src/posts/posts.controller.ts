import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Put } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { get } from 'http';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const uploadPath = './upload/';
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
  create(@Body() createPostDto: CreatePostDto, @Request() req, @UploadedFile() file: Express.Multer.File,) {
    return this.postsService.create(createPostDto, req.user, file);
  }

  @Get()
  findAll(@Request() req) {
    return this.postsService.findAll(req.user.username);
  }

  @Get(':id')
  findOne(@Request() req ,@Param('id') id: string) {
    return this.postsService.findOnePost(req.user.username, id);
  }

  
  @Put(':id')
  update(@Body() updatePostDto: UpdatePostDto, @Request() req, @Param('id') id: string) {
    console.log(updatePostDto);
    
    return this.postsService.update(req.user.userId, id, updatePostDto);
  }
  
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.postsService.remove(id, req.user.userId);
  }

  @Put('like/:id')
  postLike(@Request() req ,@Param('id') id: string) {
    return this.postsService.postLike(id, req.user.userId);
  }

  @Put('unlike/:id')
  postUnlike(@Request() req ,@Param('id') id: string) {
    return this.postsService.postUnlike(id, req.user.userId);
  }

  @Get('likes/:id')
  async postLikesNumber(@Param('id') id: string) {
    const post = await  this.postsService.findPost(id);
    return post.likes.length
  }

}
