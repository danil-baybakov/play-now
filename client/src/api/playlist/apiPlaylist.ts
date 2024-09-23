import { Songs } from "../song/apiSong"
import { User } from "../user/apiUser"
import { validateResponse } from "../common";
import { BASE_URL } from "../config";

export type Playlist = {
    id: number,
    name: string,
    createdAt: string,
    user: User,
    songs: Songs,
}

export type Playlists = Playlist[]


/**
 * Функция запроса к API
 * Получает список плейлистов пользователя
 * @param {string} token - токен авторизации
 * @returns {Playlists} - список плейлистов пользователя
 */
export function fetchGetUserPlaylists(token: string): Promise<Playlists> {
    return fetch(`${BASE_URL}/users/playlists`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as Playlists)
}


/**
 * Функция запроса к API
 * Получает плейлист по Id
 * @param {string} token - токен авторизации
 * @returns {Playlist} - объект с данными плейлиста
 */
export function fetchPlaylistsById(token: string, id: number): Promise<Playlist> {
    return fetch(`${BASE_URL}/playlists/${id}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as Playlist)
}