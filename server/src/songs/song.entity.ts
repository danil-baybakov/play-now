import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Playlist } from '../playlists/playlist.entity';
import { Album } from '../albums/album.entity';
import { Artist } from '../artists/artist.entity';
import { User } from '../users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Song {
  @ApiProperty({ type: Number, description: 'Id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, description: 'Name' })
  @Column()
  name: string;

  @ApiProperty({ type: String, description: 'File name' })
  @Column()
  filename: string;

  @ApiProperty({ type: String, description: 'File name' })
  @Column()
  path: string;

  @ApiProperty({ type: String, description: 'Image' })
  @Column()
  image: string;

  @ApiProperty({ type: Number, description: 'Duration' })
  @Column()
  duration: number;

  @ApiProperty({ type: Date, description: 'Created at' })
  @CreateDateColumn({ type: Number })
  createdAt: Date;

  @ApiProperty({ type: () => Album, description: 'Album' })
  @ManyToOne(() => Album, (album: Album) => album.id, { eager: true })
  album: Album;

  @ApiProperty({ type: () => Artist, description: 'Artist' })
  @ManyToOne(() => Artist, (artist: Artist) => artist.id, { eager: true })
  artist: Artist;

  @ApiProperty({ type: () => [Playlist], description: 'Playlists' })
  @ManyToMany(() => Playlist, (playlist: Playlist) => playlist.songs)
  @JoinTable()
  playlists: Promise<Playlist[]>;

  @ApiProperty({ type: () => [User], description: 'Likes' })
  @ManyToMany(() => User, (user: User) => user.songLikes, { eager: true })
  @JoinTable()
  likes: User[];
}
