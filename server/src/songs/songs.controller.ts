import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
import { SongsService } from './songs.service';
import { Song } from './song.entity';
import { GetAllSongsDto } from './get-all-songs.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  @ApiOkResponse({
    description: 'Returns all songs',
    type: [Song],
  })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async getAll(@Query() params: GetAllSongsDto): Promise<Song[]> {
    return this.songsService.getAll(params);
  }

  @Get('/:songId')
  @ApiOkResponse({ description: 'Returns song', type: Song })
  @ApiNotFoundResponse({ description: 'Song does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async albums(@Param('songId', ValidationPipe) songId: number): Promise<Song> {
    return this.songsService.findOne(songId);
  }

  @Post('/:songId/like')
  @ApiCreatedResponse({ description: 'Song has been liked', type: Song })
  @ApiNotFoundResponse({ description: 'Song does not exists' })
  @ApiBadRequestResponse({ description: 'Song is already liked' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async like(
    @Request() req,
    @Param('songId', ValidationPipe) songId: number,
  ): Promise<Song> {
    return this.songsService.like(songId, req.user);
  }

  @Post('/:songId/unlike')
  @ApiCreatedResponse({ description: 'Song has been liked', type: Song })
  @ApiNotFoundResponse({ description: 'Song does not exists' })
  @ApiBadRequestResponse({ description: 'Song is not liked' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async unlike(
    @Request() req,
    @Param('songId', ValidationPipe) songId: number,
  ): Promise<Song> {
    return this.songsService.unlike(songId, req.user);
  }
}
