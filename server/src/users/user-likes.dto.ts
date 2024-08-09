import { Artist } from '../artists/artist.entity';
import { Album } from '../albums/album.entity';
import { Song } from '../songs/song.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserLikesDto {
  @ApiProperty({ type: [Artist], description: 'User`s liked artists' })
  artistLikes: Artist[];

  @ApiProperty({ type: [Artist], description: 'User`s liked albums' })
  albumLikes: Album[];

  @ApiProperty({ type: [Artist], description: 'User`s liked songs' })
  songLikes: Song[];
}
