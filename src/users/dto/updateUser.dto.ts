import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { createUserDto } from './user.dto';

export class UpdateUserDto extends PartialType(createUserDto){
    @IsOptional()
    @ApiPropertyOptional()
    nickname: String;
    @ApiPropertyOptional()
    description: String;
    @ApiPropertyOptional()
    photo: String;
    @ApiPropertyOptional()
    age: Number;
    @ApiPropertyOptional()
    status: {
        type: String;
        enum: ['Public', 'Private'];
    };
}
