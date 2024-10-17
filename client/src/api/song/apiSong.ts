import { Playlists } from '../playlist/apiPlaylist';
import { Album } from '../album/apiAlbum';
import { Artist } from '../artist/apiArtist';
import { Users } from '../user/apiUser';
import { BASE_URL } from '../config';
import { validateResponse } from '../common';

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
    likes: Users
}

export type Songs = Song[]


export type SongsPlayer = {
    songs: Songs,
    repeat: boolean,
    shaffle: boolean,
}



/**
 * Функция запроса к API
 * Поиск треков по наименованию (по умолчанию выводит весь список треков)
 * @param {string} token - токен авторизации
 * @param {string} search - наименование трека (по умолчанию пустая строка)
 * @returns {Songs} - полный список треков
 */
export function fetchSearchSongs(token: string, search: string = ''): Promise<Songs> {    
    return fetch(`${BASE_URL}/songs?search=${search}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },  
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as Songs)
}

/**
 * Функция запроса к API
 * Получает трек по Id
 * @param {string} token - токен авторизации
 * @param {number} id - Id трека
 * @returns - объект с данными трека
 */
export function fetchGetSongsById(token: string, id: number): Promise<Song> {    
    return fetch(`${BASE_URL}/songs/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },  
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as Song)
}

/**
 * Функция запроса к API
 * Добавляет лайк треку по Id
 * @param {string} token - токен авторизации
 * @param {number} id - Id трека
 * @returns - объект с обновленными данными трека
 */
export function fetchLikeSongsById(token: string, id: number): Promise<Song> {    
    return fetch(`${BASE_URL}/songs/${id}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },  
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as Song)
}

/**
 * Функция запроса к API
 * Убирает лайк с трека по Id
 * @param {string} token - токен авторизации
 * @param {number} id - Id трека
 * @returns - объект с обновленными данными трека
 */
export function fetchUnlikeSongsById(token: string, id: number): Promise<Song> {    
    return fetch(`${BASE_URL}/songs/${id}/unlike`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },  
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as Song)
}

/**
 * Функция запроса к API
 * Получает список треков конкретного плейлиста по Id
 * @param {string} token - токен авторизации
 * @param {number} id - Id плейлиста
 * @returns - список треков конкретного плейлиста
 */
export function fetchGetSongsPlaylistById(token: string, id: number): Promise<Songs> {    
    return fetch(`${BASE_URL}/playlists/${id}/songs`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },  
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as Songs)
}

/**
 * Функция определяет - трек в избранном у пользователя или нет ?? 
 * @param {Song} song - объект с данными трека
 * @param {string} username - логин пользователя
 */
export function isLikeSong(song: Song, username: string): boolean {
    return song.likes.filter(v => v.username == username).length > 0;
}




