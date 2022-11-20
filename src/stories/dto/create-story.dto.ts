import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class CreateStoryDto {
    
    @ApiProperty()
    @IsString()
    media: string;
}
