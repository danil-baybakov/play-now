import { Playlists } from '../playlist/apiPlaylist';
import { Album } from '../album/apiAlbum';
import { Artist } from '../artist/apiArtist';
import { Users } from '../user/apiUser';

export type Song = {
    id: number,
    name: string,
    filename: string,
    path: string,
    image: string,
    duration: number,
    createdAt: string,
    album: Album,
    artist: Artist,
    playlists?: Playlists,
    likes: Users,
}

export type Songs = Song[]


