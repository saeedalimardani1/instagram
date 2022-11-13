import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { createUserDto } from './user.dto';

export class UpdateUserDto extends PartialType(createUserDto){
    @IsOptional()
    nickname: String;
    description: String;
    photo: String;
    age: Number;
    status: {
        type: String;
        enum: ['Public', 'Private'];
    };
}
