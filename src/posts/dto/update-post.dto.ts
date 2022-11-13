import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
   
        @IsOptional()
        @IsString()
        photo: String;
        
        @IsOptional()
        @IsString()
        title: String;
        
        @IsOptional()
        @IsString()
        description: String;
    
        @IsOptional()
        @IsArray()
        tags: Array<String>
    
}
