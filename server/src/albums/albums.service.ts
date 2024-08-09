import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Album } from './album.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Song } from '../songs/song.entity';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
  ) {}

  async findOne(id: number): Promise<Album> {
    const album = await this.albumRepository.findOne(id, {
      loadEagerRelations: true,
    });

    if (!album) {
      throw new HttpException('Album does not exists', HttpStatus.NOT_FOUND);
    }

    return album;
  }

  async getSongs(albumId: number): Promise<Song[]> {
    const album = await this.findOne(albumId);

    return album.songs;
  }

  async like(albumId: number, user: User): Promise<Album> {
    const album = await this.findOne(albumId);

    if (album.likes.find((p) => p.id === user.id)) {
      throw new HttpException('Album is already liked', HttpStatus.BAD_REQUEST);
    }

    album.likes.push(user);

    return await this.albumRepository.save(album);
  }

  async unlike(albumId: number, user: User): Promise<Album> {
    const album = await this.findOne(albumId);

    if (!album.likes.find((p) => p.id === user.id)) {
      throw new HttpException('Album is not liked', HttpStatus.BAD_REQUEST);
    }

    album.likes = album.likes.filter((p: User) => p.id != user.id);

    return await this.albumRepository.save(album);
  }
}
