import { ApiProperty } from '@nestjs/swagger';

export class PlaylistDto {
  @ApiProperty({ type: String, description: 'Playlist name' })
  name: string;
}
