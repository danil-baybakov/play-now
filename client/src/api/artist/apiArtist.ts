import { Albums } from "../album/apiAlbum";
import { Users } from "../user/apiUser";

export type Artist = {
    id: number,
    name: string,
    image: string,
    createdAt: string,
    albums?: Albums,
    likes?: Users
}

export type Artists = Artist[]