import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1664157233977 implements MigrationInterface {
  name = 'Initial1664157233977';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "song" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "filename" varchar NOT NULL, "path" varchar NOT NULL, "image" varchar NOT NULL, "duration" integer NOT NULL, "createdAt" integer NOT NULL DEFAULT (datetime('now')), "albumId" integer, "artistId" integer)`,
    );

    await queryRunner.query(
      `CREATE TABLE "playlist" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "createdAt" integer NOT NULL DEFAULT (datetime('now')), "userId" integer)`,
    );

    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "artist" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "image" varchar NOT NULL, "createdAt" integer NOT NULL DEFAULT (datetime('now')))`,
    );

    await queryRunner.query(
      `CREATE TABLE "album" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "image" varchar NOT NULL, "createdAt" integer NOT NULL DEFAULT (datetime('now')), "artistId" integer)`,
    );

    await queryRunner.query(
      `CREATE TABLE "song_playlists_playlist" ("songId" integer NOT NULL, "playlistId" integer NOT NULL, PRIMARY KEY ("songId", "playlistId"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_3df3be27dbfbbb96f7e11c5614" ON "song_playlists_playlist" ("songId") `,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_057c321ea6e1e8c86e4855b989" ON "song_playlists_playlist" ("playlistId") `,
    );

    await queryRunner.query(
      `CREATE TABLE "song_likes_user" ("songId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("songId", "userId"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_48342f246e8b2e7d8f63349e82" ON "song_likes_user" ("songId") `,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_badc6580d399d8787906250f0c" ON "song_likes_user" ("userId") `,
    );

    await queryRunner.query(
      `CREATE TABLE "playlist_songs_song" ("playlistId" integer NOT NULL, "songId" integer NOT NULL, PRIMARY KEY ("playlistId", "songId"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_3e66846398a681262e56574fc9" ON "playlist_songs_song" ("playlistId") `,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_efc8204ff6cdd9f17e83f8d001" ON "playlist_songs_song" ("songId") `,
    );

    await queryRunner.query(
      `CREATE TABLE "user_artist_likes_artist" ("userId" integer NOT NULL, "artistId" integer NOT NULL, PRIMARY KEY ("userId", "artistId"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_1e2dc1f8729402a4d8c3715797" ON "user_artist_likes_artist" ("userId") `,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_746ce3ee4905fa4b38094edb75" ON "user_artist_likes_artist" ("artistId") `,
    );

    await queryRunner.query(
      `CREATE TABLE "user_album_likes_album" ("userId" integer NOT NULL, "albumId" integer NOT NULL, PRIMARY KEY ("userId", "albumId"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_03b5fdfc29b37a6f24d2b6308f" ON "user_album_likes_album" ("userId") `,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_f7bb807b2d4aa27fd912618566" ON "user_album_likes_album" ("albumId") `,
    );

    await queryRunner.query(
      `CREATE TABLE "user_song_likes_song" ("userId" integer NOT NULL, "songId" integer NOT NULL, PRIMARY KEY ("userId", "songId"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_d7d43354aec698d18bf57f48fd" ON "user_song_likes_song" ("userId") `,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_e7af4a0921110f824e5e0ac37b" ON "user_song_likes_song" ("songId") `,
    );

    await queryRunner.query(
      `CREATE TABLE "artist_likes_user" ("artistId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("artistId", "userId"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_8ba2783cf45e13770845e8c1a8" ON "artist_likes_user" ("artistId") `,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_2423ca63d87200ce8ea6ee77ae" ON "artist_likes_user" ("userId") `,
    );

    await queryRunner.query(
      `CREATE TABLE "album_likes_user" ("albumId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("albumId", "userId"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_f0e23be7a51d14b17d6cc8dc77" ON "album_likes_user" ("albumId") `,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_bec2539d7b0d4fe43c90a40cc6" ON "album_likes_user" ("userId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_bec2539d7b0d4fe43c90a40cc6"`);
    await queryRunner.query(`DROP INDEX "IDX_f0e23be7a51d14b17d6cc8dc77"`);
    await queryRunner.query(`DROP INDEX "IDX_2423ca63d87200ce8ea6ee77ae"`);
    await queryRunner.query(`DROP INDEX "IDX_8ba2783cf45e13770845e8c1a8"`);
    await queryRunner.query(`DROP INDEX "IDX_e7af4a0921110f824e5e0ac37b"`);
    await queryRunner.query(`DROP INDEX "IDX_d7d43354aec698d18bf57f48fd"`);
    await queryRunner.query(`DROP INDEX "IDX_f7bb807b2d4aa27fd912618566"`);
    await queryRunner.query(`DROP INDEX "IDX_03b5fdfc29b37a6f24d2b6308f"`);
    await queryRunner.query(`DROP INDEX "IDX_746ce3ee4905fa4b38094edb75"`);
    await queryRunner.query(`DROP INDEX "IDX_1e2dc1f8729402a4d8c3715797"`);
    await queryRunner.query(`DROP INDEX "IDX_efc8204ff6cdd9f17e83f8d001"`);
    await queryRunner.query(`DROP INDEX "IDX_3e66846398a681262e56574fc9"`);
    await queryRunner.query(`DROP INDEX "IDX_badc6580d399d8787906250f0c"`);
    await queryRunner.query(`DROP INDEX "IDX_48342f246e8b2e7d8f63349e82"`);
    await queryRunner.query(`DROP INDEX "IDX_057c321ea6e1e8c86e4855b989"`);
    await queryRunner.query(`DROP INDEX "IDX_3df3be27dbfbbb96f7e11c5614"`);
    await queryRunner.query(`DROP TABLE "album_likes_user"`);
    await queryRunner.query(`DROP TABLE "artist_likes_user"`);
    await queryRunner.query(`DROP TABLE "user_song_likes_song"`);
    await queryRunner.query(`DROP TABLE "user_album_likes_album"`);
    await queryRunner.query(`DROP TABLE "user_artist_likes_artist"`);
    await queryRunner.query(`DROP TABLE "playlist_songs_song"`);
    await queryRunner.query(`DROP TABLE "song_likes_user"`);
    await queryRunner.query(`DROP TABLE "song_playlists_playlist"`);
    await queryRunner.query(`DROP TABLE "album"`);
    await queryRunner.query(`DROP TABLE "artist"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "playlist"`);
    await queryRunner.query(`DROP TABLE "song"`);
  }
}
