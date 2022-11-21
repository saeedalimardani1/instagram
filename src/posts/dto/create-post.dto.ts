import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    photo: String;
    
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    title?: String;
    
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    description?: String;

    @IsOptional()
    @IsArray()
    @ApiPropertyOptional()
    tags?: Array<String>
}

