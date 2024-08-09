import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetAllSongsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}
