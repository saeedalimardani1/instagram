import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, Request, UploadedFile, Put } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('stories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const uploadPath = './upload/stories';
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
  create(@Body() createStoryDto: CreateStoryDto,@Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.storiesService.create(createStoryDto, req.user.userId, file);
  }

  @Get()
  findAll(@Request() req) {
    return this.storiesService.findAll(req.user.userId);
  }

  @Get('home')
  getStoriesOfFollowing(@Request() req){
    return this.storiesService.getStoriesOfFollowing(req.user.userId)
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.storiesService.findStory(req.user.userId, id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.storiesService.remove(req.user.userId, id);
  }
}
