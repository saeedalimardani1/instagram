import { IsNotEmpty, IsString, IsArray, IsEmpty } from 'class-validator';

export class createUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  
}
