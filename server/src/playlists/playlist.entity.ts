import {
  Column,
  CreateDateColumn,
  Entity, JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from '../users/user.entity';
import { Song } from '../songs/song.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Playlist {
  @ApiProperty({ type: Number, description: 'Id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, description: 'Name' })
  @Column()
  name: string;

  @ApiProperty({ type: Date, description: 'Created at' })
  @CreateDateColumn({ type: Number })
  createdAt: Date;

  @ApiProperty({ type: () => User, description: 'Owner' })
  @ManyToOne(() => User, (user: User) => user.playlists, { eager: true })
  user: User;

  @ApiProperty({ type: () => [Song], description: 'Songs' })
  @ManyToMany(() => Song, (song: Song) => song.playlists, { eager: true })
  @JoinTable()
  songs: Song[];
}
