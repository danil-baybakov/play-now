import { Songs } from "../song/apiSong";
import { Artist } from "../artist/apiArtist";
import { Users } from "../user/apiUser";

export type Album = {
    id: number,
    name: string,
    image: string,
    createdAt: string,
    songs?: Songs,
    artist?: Artist,
    likes?: Users
}

export type Albums = Album[]