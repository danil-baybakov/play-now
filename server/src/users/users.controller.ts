import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Playlist } from '../playlists/playlist.entity';
import { UserLikesDto } from './user-likes.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ description: 'Returns users', type: [User] })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('/playlists')
  @ApiOkResponse({ description: 'Returns user`s playlists', type: [Playlist] })
  @ApiNotFoundResponse({ description: 'User does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async playlists(@Request() req): Promise<Playlist[]> {
    return this.usersService.getPlaylists(req.user.username);
  }

  @Get('/:username/playlists')
  @ApiOkResponse({ description: 'Returns user`s playlists', type: [Playlist] })
  @ApiNotFoundResponse({ description: 'User does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async playlistsByUser(
    @Param('username', ValidationPipe) username: string,
  ): Promise<Playlist[]> {
    return this.usersService.getPlaylists(username);
  }

  @Get('/likes')
  @ApiOkResponse({
    description: 'Returns user`s likes',
    type: UserLikesDto,
  })
  @ApiNotFoundResponse({ description: 'User does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async likes(@Request() req): Promise<UserLikesDto> {
    return this.usersService.getUserLikes(req.user.username);
  }

  @Get('/:username/likes')
  @ApiOkResponse({
    description: 'Returns user`s likes',
    type: UserLikesDto,
  })
  @ApiNotFoundResponse({ description: 'User does not exists' })
  @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
  async likesByUser(
    @Param('username', ValidationPipe) username: string,
  ): Promise<UserLikesDto> {
    return this.usersService.getUserLikes(username);
  }
}
