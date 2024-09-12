import './assets/style/style.scss';
// import { insertHTML } from './utils/utils';
import { ElementHeader } from './components/content/header/header';
import { ElementAsaid } from './components/content/body/asaid/asaid';
import { ListElementPlaylist } from './components/content/body/main/playlists/playlists';
import { ListElementSong } from './components/content/body/main/songs/songs';
import { ElementFooter } from './components/content/footer/footer';
import { ElementModalAddPlaylist } from './components/modal/modal';
import { SONGS, PLAYLISTS, USERS } from './mock/data';
import { append } from './utils/utils';
import { CustomEvent } from './components/base/base';
import { CustomElement } from './types/types';

class Controller {

    body: HTMLBodyElement | null  = null;
    modalAddPlaylist: CustomElement | null = null;
    content: HTMLDivElement | null = null;
    header: CustomElement | null = null;
    asaid: CustomElement | null = null;
    main: HTMLElement | null = null;
    wrapper: HTMLDivElement | null = null;
    listSongs: CustomElement | null = null;
    listPlaylists: CustomElement | null = null;
    footer: CustomElement | null = null;

    constructor() {
        this.render();
    }

    render() {
        this.body = document.querySelector('body');

        this.modalAddPlaylist = new ElementModalAddPlaylist(PLAYLISTS).element;
        append(this.body, this.modalAddPlaylist);

        this.content = document.createElement("div");
        this.content.classList.add("over-wrapper");
        this.content.setAttribute('style', 'position: relative; overflow: hidden;');
        append(this.body, this.content);

        this.header = new ElementHeader(USERS[0]).element;
        append(this.content, this.header);

        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("content-wrap", "flex")
        this.content.append(this.wrapper);

        this.asaid = new ElementAsaid(PLAYLISTS).element;
        append(this.wrapper, this.asaid);

        this.main = document.createElement("main");
        this.main.classList.add("main");
        this.wrapper.append(this.main);

        this.listSongs = new ListElementSong(
            SONGS, 
            this.turnOnSong,
            this.openDropdown, 
            this.addSong, 
            this.deleteSong,
            this.likeSong
            
        ).element;
        
        append(this.main, this.listSongs);
        
        this.listPlaylists = new ListElementPlaylist(PLAYLISTS).element;
        append(this.main, this.listPlaylists);
        
        if (SONGS) {
            this.footer = new ElementFooter(SONGS[0]).element;
            append(this.content, this.footer);
        }

    }

    /***
     * 
    */
    turnOnSong(id: number, e: CustomEvent): void {
        const old_player = document.querySelector(`.footer`);
        const content = document.querySelector(`.over-wrapper`);
        old_player?.remove();
        if (SONGS) {
            const player = new ElementFooter(SONGS[id-1]).element;
            append(content, player);
        }
    }

    /***
    * Обработчик клика кнопки открытия открытия модального окна 
    * с двумя возможными контестными действиями (удаления/добавления)
    */
    openDropdown(id: number, e: CustomEvent): void {
        document.querySelectorAll('.track__dropdown').forEach((e) => { 
            e?.classList.remove('dropdown--active');
        })
        e.__isClickBtnOpenDropdown = true;
        const dropdown = document.querySelector(`[data-num_track_dropdown="${id}"]`)
        dropdown?.classList.add('dropdown--active');
    }

    /***
    * Обработчик клика кнопки добавления трека в плейлист 
    */
    addSong(id: number, e: CustomEvent): void {
        const modal = document.querySelector(`.playlists-modal`);
        modal?.classList.add('show');
    }

    /***
    * Обработчик клика кнопки удаления трека из плейлиста  
    */
    deleteSong(id: number, e: CustomEvent): void {
        const deleteBtn = document.querySelector(`[data-num_tracks_item="${id}"]`);
        deleteBtn?.remove();
    }

    /***
    * Обработчик клика кнопки добавления трека в избранное
    */
    likeSong(id: number, e: CustomEvent): void {
        const likeBtn = document.querySelector(`[data-num_track_like_btn="${id}"]`);
        likeBtn?.classList.toggle('like-btn--active');
    }
}

const controller = new Controller();

document.body.addEventListener('click', (e: CustomEvent) => {
    if (e.__isClickBtnOpenDropdown) return;
    document.querySelectorAll('.track__dropdown').forEach((e) => { 
        e?.classList.remove('dropdown--active');
    })
})
