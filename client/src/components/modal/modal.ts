import { BaseElement } from "../base/base";
import { Playlist, Playlists } from "../../api/playlist/apiPlaylist";

import urlDefaultImg from "../../assets/image/playlists/playlists.jpg";
import { HTMLElementOrNone } from "../../types/types";
import { CustomEvent } from "../base/base";
import { append } from "../../utils/utils";

interface PlaylistModalElProps {
    playlists: Playlists,
    handlers?: {
        addToPlaylistSomg?: (elem?: PlaylistModalBtnEl, e?: CustomEvent) => void,
        addPlaylist?: (elem?: PlaylistModalEl, e?: CustomEvent) => void,
        cancel?: (elem?: PlaylistModalEl, e?: CustomEvent) => void,
    }
}

/**
 * Класс для создания модального окна добавления трека в плейлист
 */
export class PlaylistModalEl extends BaseElement {

    playlistModalBtnObjs: PlaylistModalBtnEl[] = []; // список объктов класса кнопок модального окна добавления трека в плейлист

    // DOM элементы
    playlistsBtnEl: HTMLElementOrNone = null; // контейнер кнопок модального окна добавления трека в плейлист
    btnAddPlaylist: HTMLElementOrNone = null; // кнопка Добавить плейлист
    btnCancelEl: HTMLElementOrNone = null; // кнопка Отменить

    constructor(
        private props: PlaylistModalElProps,
    ) {
        super();
        this.init();
    }

    /**
    * Метод инициалиации класса
    */
    private init() {

        // формируем DOM-элемент класса
        this.getElement();

        // в свойства класса добавляем элементы
        // контейнер кнопок модального окна добавления трека в плейлист
        this.playlistsBtnEl = this.element?.querySelector('.playlists-modal__playlist_list_btn');
        // кнопка Добавить плейлист
        this.btnAddPlaylist = this.element?.querySelector('.playlists-modal__playlist_add_btn');
        // кнопка Отменить
        this.btnCancelEl = this.element?.querySelector('.playlists-modal__close-btn'); 

        // cоздаем и добавляем в модальное список кнопок добавления трека в плейлист
        this.createListModalBtn();

        // вешаем обработчики событий на все элементы
        this.setEventListenner();
    }

    /**
     * Метод создает шаблон HTML разметки DOM элемента класса
     */
    getTemplate(): void {
        this.template = `
          <div class="playlists-modal">
            <div class="playlists-modal__title">
                Добавить в плейлист
            </div>
            <div class="playlists-modal__playlist_content">
                <div class="playlists-modal__playlist_list_btn">  
                </div>
                <div class="playlists-modal__playlist_add">  
                    <button class="playlists-modal__playlist_add_btn">
                        <svg viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">      
                            <title>plus_circle [#1427]</title>
                            <desc>Created with Sketch.</desc>
                            <defs></defs>
                            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g id="Dribbble-Light-Preview" transform="translate(-179.000000, -600.000000)" fill="#AAAAAA">
                                    <g id="icons" transform="translate(56.000000, 160.000000)">
                                        <path d="M137.7,450 C137.7,450.552 137.2296,451 136.65,451 L134.55,451 L134.55,453 C134.55,453.552 134.0796,454 133.5,454 C132.9204,454 132.45,453.552 132.45,453 L132.45,451 L130.35,451 C129.7704,451 129.3,450.552 129.3,450 C129.3,449.448 129.7704,449 130.35,449 L132.45,449 L132.45,447 C132.45,446.448 132.9204,446 133.5,446 C134.0796,446 134.55,446.448 134.55,447 L134.55,449 L136.65,449 C137.2296,449 137.7,449.448 137.7,450 M133.5,458 C128.86845,458 125.1,454.411 125.1,450 C125.1,445.589 128.86845,442 133.5,442 C138.13155,442 141.9,445.589 141.9,450 C141.9,454.411 138.13155,458 133.5,458 M133.5,440 C127.70085,440 123,444.477 123,450 C123,455.523 127.70085,460 133.5,460 C139.29915,460 144,455.523 144,450 C144,444.477 139.29915,440 133.5,440" id="plus_circle-[#1427]">
                                        </path>
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="playlists-modal__footer">
                <button class="playlists-modal__close-btn">
                    Отменить
                </button>
            </div>
        </div>
      `;
    }

    /**
     * Метод создает и добавляет в модальное 
     * окно список кнопок добавления трека в плейлист
     */
    private createListModalBtn() {
        if (this.props.playlists.length > 0) {
            this.props.playlists.forEach(playlist => {
                const elementPlaylistModalBtn = new PlaylistModalBtnEl({
                    playlist: playlist,
                    urlImg: urlDefaultImg,
                    handlers: {
                        click: this.props.handlers?.addToPlaylistSomg,
                    }
                })
                this.addPlaylistModalBtn(elementPlaylistModalBtn);
            })
        }
    }

    /**
     * Метод добавляет в модальное окно кнопку добавления трека в плейлист
    /* @param {PlaylistModalBtnEl} playlistModalBtnEl - кнопк модального окна добавления трека в плейлист
    **/
    private addPlaylistModalBtn(playlistModalBtnEl: PlaylistModalBtnEl): void {
        if (this.playlistsBtnEl && playlistModalBtnEl) {
            this.playlistModalBtnObjs.push(playlistModalBtnEl);
            append(this.playlistsBtnEl, playlistModalBtnEl.element);
        }
    }

    /**
     * Метод вешает обработчики событий на все элементы
     */
    private setEventListenner() {

        // обработка события нажатия на кнопку Отмена
        this.btnCancelEl?.addEventListener('click', (e: CustomEvent) => {
            e.preventDefault();
            if (this.props.handlers?.cancel) this.props.handlers.cancel(this, e);
            this.element?.classList.remove('show');
        })

        // обработка события нажатия на кнопку Добавить плейлист
        this.btnAddPlaylist?.addEventListener('click', (e: CustomEvent) => {
            e.preventDefault();
            if (this.props.handlers?.addPlaylist) this.props.handlers.addPlaylist(this, e);
        })

    }


}

interface PlaylistModalBtnElProps {
    playlist: Playlist,
    urlImg?: string,
    handlers?: {
        click?: (elem: PlaylistModalBtnEl, e?: CustomEvent) => void,
    }
}

/**
 * Класс для создания кнопки модального окна добавления трека в плейлист
 */
export class PlaylistModalBtnEl extends BaseElement {

    id?: number;  // идентификатор плейлиста

    // DOM элементы
    imgEl: HTMLElementOrNone = null; // иконка плейлиста
    titleEl: HTMLElementOrNone = null; // наименование плейлиста
    infoEl: HTMLElementOrNone = null; // информация плейлиста

    constructor(
        private props: PlaylistModalBtnElProps,
    ) {
        super();
        this.init();
    }

    /**
     * Метод инициалиации класса
     */
    private init() {

        // добавляем в класс идентификатор плейлиста как свойство
        this.id = this.props.playlist.id;

        // формируем DOM-элемент класса
        this.getElement();

        // в свойства класса добавляем элементы
        // иконка плейлиста
        this.imgEl = this.element?.querySelector('.playlists-modal__playlist__image');
        // наименование плейлиста
        this.titleEl = this.element?.querySelector('.playlists-modal__playlist__title');
        // информация плейлиста
        this.infoEl = this.element?.querySelector('.playlists-modal__playlist__info');

        // вешаем обработчики событий на все элементы
        this.setEventListenner();

    }

    /**
     * Метод создает шаблон HTML разметки DOM элемента класса
     */
    getTemplate(): void {
        this.template = `
            <div class="playlists-modal__playlist">
                <img src=${this.props.urlImg} alt=${this.props.playlist.name} class="playlists-modal__playlist__image" />
                <div class="playlists-modal__playlist__title">${this.props.playlist.name}</div>
                <div class="playlists-modal__playlist__info">${this.props.playlist.songs.length > 0 ? this.props.playlist.songs.length : "Нет"} треков</div>
            </div>
      `;
    }

    /**
     * Метод вешает обработчики событий на все элементы
     */
    setEventListenner() {

        // обработка события нажатия на основной элемент класса
        this.element?.addEventListener('click', (e: CustomEvent) => {
            e.preventDefault();
            if (this.props.handlers?.click && this.id) this.props.handlers.click(this, e);
        })
    }

}