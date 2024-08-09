import {
  ClassSerializerInterceptor,
  Controller,
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
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AlbumsService } from './albums.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Album } from './album.entity';
import { Song } from '../songs/song.entity';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get('/:albumId')
  @ApiOkResponse({ description: 'Returns album`s songs', type: Album })
  @ApiNotFoundResponse({ description: 'Album does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async album(
    @Param('albumId', ValidationPipe) albumId: number,
  ): Promise<Album> {
    return this.albumsService.findOne(albumId);
  }

  @Get('/:albumId/songs')
  @ApiOkResponse({ description: 'Returns album`s songs', type: [Song] })
  @ApiNotFoundResponse({ description: 'Album does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async songs(
    @Param('albumId', ValidationPipe) albumId: number,
  ): Promise<Song[]> {
    return this.albumsService.getSongs(albumId);
  }

  @Post('/:albumId/like')
  @ApiCreatedResponse({ description: 'Album has been liked', type: Album })
  @ApiNotFoundResponse({ description: 'Album does not exists' })
  @ApiBadRequestResponse({ description: 'Album is already liked' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async like(
    @Request() req,
    @Param('albumId', ValidationPipe) albumId: number,
  ): Promise<Album> {
    return this.albumsService.like(albumId, req.user);
  }

  @Post('/:albumId/unlike')
  @ApiCreatedResponse({ description: 'Album has been liked', type: Album })
  @ApiNotFoundResponse({ description: 'Album does not exists' })
  @ApiBadRequestResponse({ description: 'Album is not liked' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async unlike(
    @Request() req,
    @Param('albumId', ValidationPipe) albumId: number,
  ): Promise<Album> {
    return this.albumsService.unlike(albumId, req.user);
  }
}
