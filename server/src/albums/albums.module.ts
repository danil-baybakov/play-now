import { Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from './album.entity';

@Module({
  providers: [AlbumsService],
  imports: [TypeOrmModule.forFeature([Album])],
  controllers: [AlbumsController],
})
export class AlbumsModule {}
