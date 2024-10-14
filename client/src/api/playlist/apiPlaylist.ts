import { Songs } from "../song/apiSong"
import { User } from "../user/apiUser"
import { validateResponse } from "../common";
import { BASE_URL } from "../config";

export type Playlist = {
    id: number,
    name: string,
    createdAt: string,
    user: User,
    songs?: Songs,
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

/**
 * Функция запроса к API
 * Создает новый плейлист
 * @param {string} token - токен авторизации
 * @returns {Playlist} - объект нового плейлиста
 */
export function fetchCreatePlaylist(token: string, name: string): Promise<Playlist> {
    return fetch(`${BASE_URL}/playlists`, {
        method: 'POST', 
        body: JSON.stringify({
            name: name,
        }),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as Playlist)
}

/**
 * Функция запроса к API
 * Добавляет в плейлист трек
 * @param {string} token - токен авторизации
 * @param {number} playlistId - id плейлиста
 * @param {number} songId - id трека
 * @returns {Playlist} - объект обновленного плейлиста
 */
export function fetchAddSongToPlaylist(token: string, playlistId: number, songId: number ): Promise<Playlist> {
    return fetch(`${BASE_URL}/playlists/${playlistId}/add/${songId}`, {
        method: 'POST', 
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as Playlist)
}

/**
 * Функция запроса к API
 * Удаляет трек из плейлиста
 * @param {string} token - токен авторизации
 * @param {number} playlistId - id плейлиста
 * @param {number} songId - id трека
 * @returns {Playlist} - объект обновленного плейлиста
 */
export function fetchRemoveSongFromPlaylist(token: string, playlistId: number, songId: number ): Promise<Playlist> {
    return fetch(`${BASE_URL}/playlists/${playlistId}/remove/${songId}`, {
        method: 'POST', 
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as Playlist)
}

/**
 * Метод определяет есть ли трек с таким id в плейлисте
 * @param {number} id - id трека
 */
export function checkSongToPlaylistById(playlist: Playlist, id?: number): boolean {

    // если в плейлисте нет треков возвращаем false
    if (!playlist.songs || playlist.songs.length === 0 || !id) return false;

    // иначе проходимся по списку треков
    // и если нашли возвращаем true
    for (const song of playlist.songs) {
        if (song.id === id) return true;
    }

    // иначе возвращаем false
    return false;
}