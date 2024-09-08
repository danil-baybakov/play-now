import { Songs } from "../song/apiSong"
import { User } from "../user/apiUser"

export type Playlist = {
    id: number,
    name: string,
    createdAt: string,
    user: User,
    songs: Songs,
}

export type Playlists = Playlist[]