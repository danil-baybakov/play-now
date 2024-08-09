import { ApiProperty } from '@nestjs/swagger';

export class JwtDto {
  @ApiProperty({ type: String, required: true, description: 'Access Token' })
  access_token: string;
}
