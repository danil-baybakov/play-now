import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './playlist.entity';
import { SongsModule } from '../songs/songs.module';

@Module({
  providers: [PlaylistsService],
  imports: [SongsModule, TypeOrmModule.forFeature([Playlist])],
  controllers: [PlaylistsController],
})
export class PlaylistsModule {}
