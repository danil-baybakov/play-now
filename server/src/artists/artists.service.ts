import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Song } from '../songs/song.entity';
import { Artist } from './artist.entity';
import { Album } from '../albums/album.entity';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  async findOne(id: number): Promise<Artist> {
    const artist = await this.artistRepository.findOne(id, {
      loadEagerRelations: true,
    });

    if (!artist) {
      throw new HttpException('Artist does not exists', HttpStatus.NOT_FOUND);
    }

    return artist;
  }

  async getAlbums(artistId: number): Promise<Album[]> {
    const artist = await this.findOne(artistId);

    return artist.albums;
  }

  async getSongs(artistId: number): Promise<Song[]> {
    const albums: Album[] = await this.getAlbums(artistId);
    const songs: Song[][] = await Promise.all(
      albums.map((p: Album) => p.songs),
    );

    return songs.flatMap((p) => p);
  }

  async like(artistId: number, user: User): Promise<Artist> {
    const artist = await this.findOne(artistId);

    if (artist.likes.find((p) => p.id === user.id)) {
      throw new HttpException(
        'Artist is already liked',
        HttpStatus.BAD_REQUEST,
      );
    }

    artist.likes.push(user);

    return await this.artistRepository.save(artist);
  }

  async unlike(artistId: number, user: User): Promise<Artist> {
    const artist = await this.findOne(artistId);

    if (!artist.likes.find((p) => p.id === user.id)) {
      throw new HttpException('Artist is not liked', HttpStatus.BAD_REQUEST);
    }

    artist.likes = artist.likes.filter((p: User) => p.id != user.id);

    return await this.artistRepository.save(artist);
  }
}
