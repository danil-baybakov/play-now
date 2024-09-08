import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlaylistsService } from './playlists.service';
import { Song } from '../songs/song.entity';
import { Playlist } from './playlist.entity';
import { PlaylistDto } from './playlist.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post('/')
  @ApiCreatedResponse({
    description: 'Playlist has been created',
    type: Playlist,
  })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  @ApiBody({ type: PlaylistDto })
  async create(@Request() req, @Body(ValidationPipe) playlist: PlaylistDto) {
    return this.playlistsService.create(playlist, req.user);
  }

  @Post('/:playlistId')
  @ApiCreatedResponse({
    description: 'Playlist has been renamed',
    type: Playlist,
  })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  @ApiBody({ type: PlaylistDto })
  async rename(
    @Request() req,
    @Param('playlistId', ValidationPipe) playlistId: number,
    @Body(ValidationPipe) playlist: PlaylistDto,
  ) {
    return this.playlistsService.rename(playlistId, playlist, req.user);
  }

  @Delete('/:playlistId')
  @ApiCreatedResponse({
    description: 'Playlist has been removed',
    type: Playlist,
  })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  @ApiBody({ type: PlaylistDto })
  async delete(
    @Request() req,
    @Param('playlistId', ValidationPipe) playlistId: number,
  ) {
    return this.playlistsService.delete(playlistId, req.user);
  }

  @Get('/:playlistId')
  @ApiOkResponse({ description: 'Returns playlist', type: Playlist })
  @ApiNotFoundResponse({ description: 'Playlist does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async playlist(
    @Param('playlistId', ValidationPipe) playlistId: number,
  ): Promise<Playlist> {
    return this.playlistsService.findOne(playlistId);
  }

  @Get('/:playlistId/songs')
  @ApiOkResponse({ description: 'Returns playlist`s songs', type: [Song] })
  @ApiNotFoundResponse({ description: 'Playlist does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async songs(
    @Param('playlistId', ValidationPipe) playlistId: number,
  ): Promise<Song[]> {
    return this.playlistsService.getSongs(playlistId);
  }

  @Post('/:playlistId/add/:songId')
  @ApiCreatedResponse({
    description: 'Song has been added to playlist',
    type: Playlist,
  })
  @ApiNotFoundResponse({ description: 'Playlist does not exists' })
  @ApiForbiddenResponse({ description: 'Access forbidden' })
  @ApiBadRequestResponse({ description: 'Song is already added' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async like(
    @Request() req,
    @Param('playlistId', ValidationPipe) playlistId: number,
    @Param('songId', ValidationPipe) songId: number,
  ): Promise<Playlist> {
    return this.playlistsService.addSong(playlistId, songId, req.user);
  }

  @Post('/:playlistId/remove/:songId')
  @ApiCreatedResponse({
    description: 'Song has been removed from playlist',
    type: Playlist,
  })
  @ApiNotFoundResponse({ description: 'Playlist does not exists' })
  @ApiForbiddenResponse({ description: 'Access forbidden' })
  @ApiBadRequestResponse({ description: 'Song is not added' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async unlike(
    @Request() req,
    @Param('playlistId', ValidationPipe) playlistId: number,
    @Param('songId', ValidationPipe) songId: number,
  ): Promise<Playlist> {
    return this.playlistsService.removeSong(playlistId, songId, req.user);
  }
}
