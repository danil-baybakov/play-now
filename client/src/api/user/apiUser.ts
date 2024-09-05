import { Playlists } from "../playlist/apiPlaylist";
import { Artists } from "../artist/apiArtist";
import { Albums } from "../album/apiAlbum";
import { Songs } from "../song/apiSong";

export type User = {
    id: number,
    username: string,
    firstName: string,
    lastName: string,
    playlists?: Playlists,
    artistLikes?: Artists,
    albumLikes?: Albums,
    songLikes?: Songs   
}

export type Users = User[]