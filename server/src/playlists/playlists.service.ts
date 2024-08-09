import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song } from '../songs/song.entity';
import { User } from '../users/user.entity';
import { Playlist } from './playlist.entity';
import { SongsService } from '../songs/songs.service';
import { PlaylistDto } from './playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    private readonly songsService: SongsService,
  ) {}

  async create(playlistDto: PlaylistDto, user: User): Promise<Playlist> {
    const playlist = this.playlistRepository.create({ ...playlistDto, user });

    return this.playlistRepository.save(playlist);
  }

  async rename(
    playlistId: number,
    playlistDto: PlaylistDto,
    user: User,
  ): Promise<Playlist> {
    const playlist = await this.findOne(playlistId);

    if (playlist.user.id !== user.id) {
      throw new HttpException('Access forbidden', HttpStatus.FORBIDDEN);
    }

    return this.playlistRepository.save({ ...playlist, ...playlistDto });
  }

  async delete(playlistId: number, user: User): Promise<Playlist> {
    const playlist = await this.findOne(playlistId);

    if (playlist.user.id !== user.id) {
      throw new HttpException('Access forbidden', HttpStatus.FORBIDDEN);
    }

    return this.playlistRepository.remove(playlist);
  }

  async findOne(id: number): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOne(id, {
      loadEagerRelations: true,
    });

    if (!playlist) {
      throw new HttpException('Playlist does not exists', HttpStatus.NOT_FOUND);
    }

    return playlist;
  }

  async getSongs(playlistId: number): Promise<Song[]> {
    const playlist = await this.findOne(playlistId);

    return playlist.songs;
  }

  async addSong(
    playlistId: number,
    songId: number,
    user: User,
  ): Promise<Playlist> {
    const playlist = await this.findOne(playlistId);
    const song = await this.songsService.findOne(songId);

    if (playlist.user.id !== user.id) {
      throw new HttpException('Access forbidden', HttpStatus.FORBIDDEN);
    }

    if (playlist.songs.find((p) => p.id === song.id)) {
      throw new HttpException('Song is already added', HttpStatus.BAD_REQUEST);
    }

    playlist.songs.push(song);

    return await this.playlistRepository.save(playlist);
  }

  async removeSong(
    playlistId: number,
    songId: number,
    user: User,
  ): Promise<Playlist> {
    const playlist = await this.findOne(playlistId);
    const song = await this.songsService.findOne(songId);

    if (playlist.user.id !== user.id) {
      throw new HttpException('Access forbidden', HttpStatus.FORBIDDEN);
    }

    if (!playlist.songs.find((p) => p.id === user.id)) {
      throw new HttpException('Song is not added', HttpStatus.BAD_REQUEST);
    }

    playlist.songs = playlist.songs.filter((p: Song) => p.id != song.id);

    return await this.playlistRepository.save(playlist);
  }
}
