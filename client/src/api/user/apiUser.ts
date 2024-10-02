import { Playlists } from "../playlist/apiPlaylist";
import { Artists } from "../artist/apiArtist";
import { Albums } from "../album/apiAlbum";
import { Songs } from "../song/apiSong";
import { BASE_URL } from "../config";
import { validateResponse } from "../common";

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

export type RegisterDto = {
    username: string,
    password: string,
    firstName: string,
    lastName: string
}

export type LoginDto = {
    username: string,
    password: string,
}

export type JwtDto = {
    access_token: string,
}

export type UserLikesDto = {
    artistLikes: Artists,
    albumLikes: Albums,
    songLikes: Songs,
}

export type Users = User[];

/**
 * Функция регистрации пользователя в API
 * @param {RegisterDto} reg_user - объект с данными для регистрации пользователя (логин, имя, фамилия, пароль)
 * @returns {JwtDto} - токен авторизации
 */
export function fetchRegister(reg_user: RegisterDto): Promise<JwtDto> {
    return fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reg_user),
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as JwtDto)
}

/**
 * Функция аутентификации пользователя в API
 * @param {LoginDto} log_user - объект с данными для аутентификации пользователя (логин, пароль) 
 * @returns {JwtDto} - токен авторизации
 */
export function fetchLogin(log_user: LoginDto): Promise<JwtDto> {    
    return fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },  
        body: JSON.stringify({
            username: log_user.username,
            password: log_user.password
        }),
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as JwtDto)
}

/**
 * Функция запроса к API
 * Получает объект со списками избранных треков/плейлистов/артистов текущего пользователя 
 * @param { string } token - токен авторизации
 * @returns { UserLikesDto } - объект со списками избранных треков/плейлистов/артистов текущего пользователя 
 */
export function fetchUserLikes(token: string): Promise<UserLikesDto> {    
    return fetch(`${BASE_URL}/users/likes`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },  
    })
    .then(validateResponse)
    .then((response) => response.json())
    .then((result) => result as UserLikesDto)
}