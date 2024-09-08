import {
  Column,
  CreateDateColumn,
  Entity, JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Artist } from '../artists/artist.entity';
import { User } from '../users/user.entity';
import { Song } from '../songs/song.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Album {
  @ApiProperty({ type: Number, description: 'Id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, description: 'Name' })
  @Column()
  name: string;

  @ApiProperty({ type: String, description: 'Image' })
  @Column()
  image: string;

  @ApiProperty({ type: Date, description: 'Created at' })
  @CreateDateColumn({ type: Number })
  createdAt: Date;

  @ApiProperty({ type: () => [Song], description: 'Songs' })
  @OneToMany(() => Song, (song: Song) => song.album)
  songs: Promise<Song[]>;

  @ApiProperty({ type: () => [Artist], description: 'Artists' })
  @ManyToOne(() => Artist, (artist: Artist) => artist.albums, { eager: true })
  artist: Artist;

  @ApiProperty({ type: () => [User], description: 'Likes' })
  @ManyToMany(() => User, (user: User) => user.albumLikes, { eager: true })
  @JoinTable()
  likes: User[];
}
