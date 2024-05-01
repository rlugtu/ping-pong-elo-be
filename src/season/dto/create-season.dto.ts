import { IsNumber, IsString } from "class-validator";

export class CreateSeasonDto {
  @IsString()
  name: string;

  @IsNumber()
  teamSize: number
}
