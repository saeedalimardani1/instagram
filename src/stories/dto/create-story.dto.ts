import { IsString } from "class-validator";


export class CreateStoryDto {
    
    @IsString()
    media: string;
}
