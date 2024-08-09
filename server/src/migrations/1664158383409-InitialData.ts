import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as NodeID3 from 'node-id3';
import * as imageThumbnail from 'image-thumbnail';

interface ArtistData {
  image: string;
  albums: Map<string, SongData[]>;
}

interface SongData {
  name: string;
  duration: number;
  fileName: string;
  image: string;
  buffer: Buffer;
}

interface ArtistRow {
  id: number;
  name: string;
  image: string;
}

interface AlbumRow {
  id: number;
  name: string;
  artistId: number;
}

export class InitialData1664158383409 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const path = 'static/songs/';
    const coversPath = 'static/artists/';
    if (!fs.existsSync(path) || !fs.existsSync(coversPath)) return;
    const fileNames = await fs.promises.readdir(path);
    const covers = await fs.promises.readdir(coversPath);
    const artistsData: Map<string, ArtistData> = new Map();

    for (const fileName of fileNames) {
      const file = fs.readFileSync(path + fileName);
      const tags = NodeID3.read(file);
      const artistTag = tags.artist?.replace(/\//g, ':');
      const image = tags.image;

      if (!artistsData.has(artistTag)) {
        const coverName = covers.find((coverName) =>
          coverName.includes(artistTag),
        );

        artistsData.set(artistTag, {
          albums: new Map<string, SongData[]>(),
          image: coverName ? await this.getCover(coversPath + coverName) : '',
        });
      }

      const artistData = artistsData.get(artistTag);

      if (!artistData.albums.has(tags.album)) {
        artistData.albums.set(tags.album, []);
      }

      const albumData = artistData.albums.get(tags.album) ?? [];

      albumData.push({
        buffer: file,
        name: tags.title,
        fileName: fileName.replace(/'/g, `''`),
        duration: parseInt(tags.length),
        image:
          image && typeof image !== 'string'
            ? await this.getThumbnail(image.imageBuffer, image.mime)
            : '',
      });
    }

    await queryRunner.query(
      `INSERT INTO "artist" ("name", "image") VALUES ${Array.from(
        artistsData.entries(),
      )
        .map(
          ([name, data]) =>
            `('${name.replace(/'/g, `''`).replace(/:/g, `/`)}', '${
              data.image
            }')`,
        )
        .join(', ')};`,
    );

    const artists: ArtistRow[] = await queryRunner.query(
      'SELECT "a"."id", "a"."name", "a"."image" FROM "artist" "a"',
    );

    await queryRunner.query(
      `INSERT INTO "album" ("name", "image", "artistId") VALUES ${Array.from(
        artistsData.entries(),
      )
        .reduce<[string, ArtistRow][]>((acc, [artistName, { albums }]) => {
          const newAcc = [...acc];

          newAcc.push(
            ...Array.from(albums.keys()).map((albumName) => {
              const data: [string, ArtistRow] = [
                albumName,
                artists.find(({ name }) => name === artistName),
              ];

              return data;
            }),
          );

          return newAcc;
        }, [])
        .filter(([, artist]) => !!artist)
        .map(
          ([albumName, { id, image }]) =>
            `('${albumName.replace(/'/g, `''`)}', '${image}', ${id})`,
        )
        .join(', ')};`,
    );

    const albums: AlbumRow[] = await queryRunner.query(
      'SELECT "a"."id", "a"."name", "a"."artistId" FROM "album" "a"',
    );

    await queryRunner.query(
      `INSERT INTO "song" ("name", "filename", "path", "image", "duration", "artistId", "albumId") VALUES ${Array.from(
        artistsData.entries(),
      )
        .reduce<[SongData, ArtistRow, AlbumRow][]>(
          (acc, [artistName, artistData]) => {
            const newAcc = [...acc];

            newAcc.push(
              ...Array.from(artistData.albums.entries()).reduce<
                [SongData, ArtistRow, AlbumRow][]
              >((acc, [albumName, data]) => {
                const newAcc = [...acc];

                newAcc.push(
                  ...data.map((songData) => {
                    const data: [SongData, ArtistRow, AlbumRow] = [
                      songData,
                      artists.find(({ name }) => name === artistName),
                      albums.find(({ name }) => name === albumName),
                    ];

                    return data;
                  }),
                );

                return newAcc;
              }, []),
            );

            return newAcc;
          },
          [],
        )
        .filter(([, artist, album]) => !!artist && !!album)
        .map(
          ([songData, artist, album]) =>
            `('${songData.name.replace(/'/g, `''`)}', '${
              songData.fileName
            }', '/songs/${songData.fileName}', '${songData.image}', ${
              songData.duration
            }, ${artist.id}, ${album.id})`,
        )
        .join(', ')};`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "song";');
    await queryRunner.query('DELETE FROM "album";');
    await queryRunner.query('DELETE FROM "artist";');
  }

  private async getCover(path: string): Promise<string | undefined> {
    if (!fs.existsSync(path)) return;
    const ext = path.split('.')[1];
    const mimetype = ext ? `image/${ext}` : undefined;
    return mimetype ? this.getThumbnail(path, mimetype) : undefined;
  }

  private async getThumbnail(
    source: string | Buffer,
    mimetype: string,
  ): Promise<string | undefined> {
    if (typeof source === 'string' && !fs.existsSync(source)) return;

    const thumbnail = await imageThumbnail(source, {
      width: 100,
      height: 100,
      fit: 'cover',
    });

    return `data:${mimetype};base64,${Buffer.from(thumbnail).toString(
      'base64',
    )}`;
  }
}
