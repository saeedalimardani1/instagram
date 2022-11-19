import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Put } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  //user post crud ............................................................
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
  //home page to get the posts of following users............
  @Get('home')
  getPostsOfFollowing(@Request() req){
    console.log(req, 'salam');
    
    return this.postsService.getPostsOfFollowing(req.user.userId)
  }
  
  @Get(':id')
  findOne(@Request() req ,@Param('id') id: string) {
    return this.postsService.findPost(req.user.userId, id);
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


  //Likes ..................................................
  @Put('like/:id')
  postLike(@Request() req ,@Param('id') id: string) {
    return this.postsService.postLike(id, req.user.userId);
  }

  @Put('unlike/:id')
  postUnlike(@Request() req ,@Param('id') id: string) {
    return this.postsService.postUnlike(id, req.user.userId);
  }

  @Get('likes/:id')
  async postLikesNumber(@Request() req , @Param('id') id: string) {
    const post = await  this.postsService.findPost(req.user.userId, id);
    if(post){
      return post.likes.length
    }
    return 'be in post dastresi nadari'
  }

  //comments ............................................
  @Get('comment/:id')
  getCommentsOfPost(@Param('id') id: string, @Request() req){
    return this.postsService.getCommentsOfPost(id, req.user.userId)
  }
  @Post('comment/:id')
  createCommentForPost(@Param('id') id: string, @Request() req, @Body('text') text: string){
    return this.postsService.createCommentForPost(id, text, req.user.userId)
  }
  @Delete('comment/:id/:commentId')
  deleteCommentOfPost(@Param() param, @Request() req){
    return this.postsService.deleteCommentOfPosts(param.id, param.commentId, req.user.userId )
  }

  //saving favorite post ....................................
  @Post('save/:id')
  savePost(@Param('id') id: string, @Request() req){
    return this.postsService.savePost(id, req.user.userId)
  }
  @Post('unsave/:id')
  unsavePost(@Param('id') id: string, @Request() req){
    return this.postsService.unsavePost(id, req.user.userId)
  }
}
