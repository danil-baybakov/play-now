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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArtistsService } from './artists.service';
import { Artist } from './artist.entity';
import { Song } from '../songs/song.entity';
import { Album } from '../albums/album.entity';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get('/:artistId')
  @ApiOkResponse({ description: 'Returns artist`s albums', type: Artist })
  @ApiNotFoundResponse({ description: 'Artist does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async artist(
    @Param('artistId', ValidationPipe) artistId: number,
  ): Promise<Artist> {
    return this.artistsService.findOne(artistId);
  }

  @Get('/:artistId/albums')
  @ApiOkResponse({ description: 'Returns artist`s albums', type: [Album] })
  @ApiNotFoundResponse({ description: 'Artist does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async albums(
    @Param('artistId', ValidationPipe) artistId: number,
  ): Promise<Album[]> {
    return this.artistsService.getAlbums(artistId);
  }

  @Get('/:artistId/songs')
  @ApiOkResponse({ description: 'Returns artist`s songs', type: [Song] })
  @ApiNotFoundResponse({ description: 'Artist does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async songs(
    @Param('artistId', ValidationPipe) artistId: number,
  ): Promise<Song[]> {
    return this.artistsService.getSongs(artistId);
  }

  @Post('/:artistId/like')
  @ApiCreatedResponse({ description: 'Artist has been liked', type: Artist })
  @ApiNotFoundResponse({ description: 'Artist does not exists' })
  @ApiBadRequestResponse({ description: 'Artist is already liked' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async like(
    @Request() req,
    @Param('artistId', ValidationPipe) artistId: number,
  ): Promise<Artist> {
    return this.artistsService.like(artistId, req.user);
  }

  @Post('/:artistId/unlike')
  @ApiCreatedResponse({ description: 'Artist has been liked', type: Artist })
  @ApiNotFoundResponse({ description: 'Artist does not exists' })
  @ApiBadRequestResponse({ description: 'Artist is not liked' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async unlike(
    @Request() req,
    @Param('artistId', ValidationPipe) artistId: number,
  ): Promise<Artist> {
    return this.artistsService.unlike(artistId, req.user);
  }
}
