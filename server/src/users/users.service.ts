import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from '../auth/register.dto';
import { Playlist } from '../playlists/playlist.entity';
import { UserLikesDto } from './user-likes.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne(id);
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ username });
  }

  async getPlaylists(username: string): Promise<Playlist[]> {
    const user = await this.usersRepository.findOne({ username });

    if (!user) {
      throw new HttpException('User does not exists', HttpStatus.NOT_FOUND);
    }

    return user.playlists;
  }

  async getUserLikes(username): Promise<UserLikesDto> {
    const user = await this.usersRepository.findOne({ username });

    if (!user) {
      throw new HttpException('User does not exists', HttpStatus.NOT_FOUND);
    }

    return {
      albumLikes: await user.albumLikes,
      artistLikes: await user.artistLikes,
      songLikes: await user.songLikes,
    };
  }

  async create(credentionals: RegisterDto): Promise<User> {
    const user = this.usersRepository.create(credentionals);

    await this.usersRepository.insert(user);

    return user;
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
