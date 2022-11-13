import { IsNotEmpty, IsString, IsArray, IsEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    photo: String;
    
    @IsNotEmpty()
    @IsString()
    title: String;
    
    @IsOptional()
    @IsString()
    description: String;

    @IsOptional()
    @IsArray()
    tags: Array<String>
}

