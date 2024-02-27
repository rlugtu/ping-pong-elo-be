import { IsString } from "class-validator";

export class CreateSeasonDto {
  @IsString()
  name: string;
}
