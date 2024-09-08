import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ type: String, required: true, description: 'Username' })
  username: string;

  @ApiProperty({ type: String, required: true, description: 'Password' })
  password: string;

  @ApiProperty({ type: String, required: true, description: 'First Name' })
  firstName: string;

  @ApiProperty({ type: String, required: true, description: 'Last Name' })
  lastName: string;
}
