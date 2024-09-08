import {
  Column,
  CreateDateColumn,
  Entity, JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Album } from '../albums/album.entity';
import { User } from '../users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Artist {
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

  @ApiProperty({ type: () => [Album], description: 'Albums' })
  @OneToMany(() => Album, (album: Album) => album.artist)
  albums: Promise<Album[]>;

  @ApiProperty({ type: () => [User], description: 'Likes' })
  @ManyToMany(() => User, (user: User) => user.artistLikes, { eager: true })
  @JoinTable()
  likes: User[];
}
