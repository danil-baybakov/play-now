import {
  Column,
  Entity, JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Playlist } from '../playlists/playlist.entity';
import { Artist } from '../artists/artist.entity';
import { Album } from '../albums/album.entity';
import { Song } from '../songs/song.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({ type: Number, description: 'Id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, description: 'Username' })
  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ type: String, description: 'First Name' })
  @Column()
  firstName: string;

  @ApiProperty({ type: String, description: 'Last Name' })
  @Column()
  lastName: string;

  @ApiProperty({ type: () => [Playlist], description: 'Playlists' })
  @OneToMany(() => Playlist, (playlist: Playlist) => playlist.user)
  playlists: Promise<Playlist[]>;

  @ApiProperty({ type: () => [Artist], description: 'Liked artists' })
  @ManyToMany(() => Artist, (artist: Artist) => artist.likes)
  @JoinTable()
  artistLikes: Promise<Artist[]>;

  @ApiProperty({ type: () => [Album], description: 'Liked albums' })
  @ManyToMany(() => Album, (album: Album) => album.likes)
  @JoinTable()
  albumLikes: Promise<Album[]>;

  @ApiProperty({ type: () => [Song], description: 'Liked songs' })
  @ManyToMany(() => Song, (song: Song) => song.likes)
  @JoinTable()
  songLikes: Promise<Song[]>;
}
