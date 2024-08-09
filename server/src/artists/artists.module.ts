import { Module } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './artist.entity';

@Module({
  providers: [ArtistsService],
  imports: [TypeOrmModule.forFeature([Artist])],
  controllers: [ArtistsController],
})
export class ArtistsModule {}
