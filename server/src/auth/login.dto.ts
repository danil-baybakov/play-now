import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ type: String, required: true, description: 'Username' })
  username: string;

  @ApiProperty({ type: String, required: true, description: 'Password' })
  password: string;
}
