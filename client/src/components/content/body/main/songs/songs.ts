import { Song, Songs } from '../../../../../api/song/apiSong';
import { BaseElement } from '../../../../base/base';
import { howManyDays, convertMsToTime, createElement } from '../../../../../utils/utils';
import { number } from 'zod';
import { CustomEvent } from '../../../../base/base';
import { isLikeSong } from '../../../../../api/song/apiSong';
import { ElementOrNone, HTMLElementOrNone } from '../../../../../types/types';
import { append } from '../../../../../utils/utils';

interface SongsElProps {
    songs: Songs,
    username?: string,
    title?: string,
    dropdown?: {
        add?: boolean,
        delete?: boolean
    }
    handlers?: {
        turn?: (id: number, e?: CustomEvent) => void
        dropdown?: (id: number, e: CustomEvent) => void,
        add?: (id: number, e?: CustomEvent) => void,
        delete?: (id: number, e?: CustomEvent) => void,
        like?: (id: number, e?: CustomEvent) => void,
    }
}


export class SongsEl extends BaseElement {

    songObjs: SongEl[] = []; // список объктов класса трека

    // DOM элементы
    songsEl: HTMLElementOrNone = null; // список треков

    constructor(
        private props: SongsElProps,
    ) {
        super();
        this.init();
    }


    /**
     * Метод инициалиации класса
     */
    init() {
        // формируем DOM-элемент класса
        this.getElement();

        // в свойства класса добавляем элементы
        // список треков
        this.songsEl = this.element?.querySelector('.tracks__list');

        // создаем список треков
        this.createSongList();

        // вешаем обработчики событий на все элементы
        this.setEventListenner();
    }


    getTemplate(): void {

        this.template = `
        <section class="tracks section tabs-content section--active" data-target="tracks">
          <h2 class="tracks__h2 title__h2">${this.props.title || "Нет заголовка"}</h2>
          <div class="tracks__content">
            <div class="tracks__header flex">
              <div class="tracks__header__number">№</div>
              <div class="tracks__header__name">НАЗВАНИЕ</div>
              <div class="tracks__header__albom">АЛЬБОМ</div>
              <div class="tracks__header__data">
                <svg width="12" height="13" viewBox="0 0 12 13" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M11 1.5H1C0.723858 1.5 0.5 1.72386 0.5 2V12C0.5 12.2761 0.723858 12.5 1 12.5H11C11.2761 12.5 11.5 12.2761 11.5 12V2C11.5 1.72386 11.2761 1.5 11 1.5Z"
                    stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M9 0.5V2.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M3 0.5V2.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M0.5 4.5H11.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="tracks__header__time"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
                    stroke="#A4A4A4" stroke-miterlimit="10" />
                  <path d="M7 3.5V7H10.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
            <ul class="tracks__list">
            </ul>
          </div>
        </section>
    `;
    }

    /**
     * Метод создания списка треков
     */
    private createSongList() {
        // если список треков не пустой
        if (this.props.songs.length > 0) {

            // создаем объекты класса трека
            // добавляем в DOM
            for (const key in this.props.songs) {

                const songObj = new SongEl({
                    song: this.props.songs[key],
                    number: Number(key) + 1,
                    username: this.props.username,
                    dropdown: {
                        add: this.props.dropdown?.add,
                        delete: this.props.dropdown?.delete
                    },
                    handlers: {
                        turn: this.props.handlers?.turn,
                        dropdown: this.props.handlers?.dropdown,
                        add: this.props.handlers?.add,
                        delete: this.props.handlers?.delete,
                        like: this.props.handlers?.like
                    }
                });

                this.songObjs.push(songObj);

                if (this.songsEl) append(this.songsEl, songObj.element);
            }
        }

    }

    /**
     * Метод вешает обработчики событий на все элементы
     */
    private setEventListenner() { }

    /**
     * Метод получения объекта класса трека по Id
     * @param {number} id - id трека
     * @returns 
     */
    getSongElById(id: number): SongEl | undefined {
        if (this.songObjs) {
            return this.songObjs.find(songObj => songObj.id === id);
        }
    }

}

interface SongElProps {
    song: Song,
    number?: number,
    username?: string,
    dropdown?: {
        add?: boolean,
        delete?: boolean
    }
    handlers?: {
        turn?: (id: number, e?: CustomEvent) => void
        dropdown?: (id: number, e: CustomEvent) => void,
        add?: (id: number, e?: CustomEvent) => void,
        delete?: (id: number, e?: CustomEvent) => void,
        like?: (id: number, e?: CustomEvent) => void,
    }
}

export class SongEl extends BaseElement {

    id?: number;  // идентификатор трека

    // DOM элементы
    turnEl: HTMLElementOrNone = null; // ссылка на воспроизведение трека
    btnDropdownEl: HTMLElementOrNone = null; // кнопка открытия всплывающего окна добавления/удаления трека
    dropdownEl: HTMLElementOrNone = null; //  всплывающее окно добавления/удаления трека
    btnAddEl: HTMLElementOrNone = null; // кнопка Добавить в плейлист
    btnDeteteEl: HTMLElementOrNone = null; // кнопка Удалить из плейлиста
    btnLikeEl: HTMLElementOrNone = null; // кнопка Добавить в избранное

    constructor(
        private props: SongElProps
    ) {
        super();
        this.init();
    }

    /**
     * Метод инициалиации класса
     */
    init() {

        // добавляем в класс идентификатор трека как свойство
        this.id = Number(this.props.song.id);

        // формируем DOM-элемент класса
        this.getElement();

        // в свойства класса добавляем элементы
        // ссылка на воспроизведение трека
        this.turnEl = this.element?.querySelector('.track__name__link');
        // кнопка открытия всплывающего окна добавления/удаления трека
        this.btnDropdownEl = this.element?.querySelector('.track__btn-dropdown');
        // всплывающее окно добавления/удаления трека
        this.dropdownEl = this.element?.querySelector('.track__dropdown');
        // кнопка Добавить в плейлист
        this.btnAddEl = this.element?.querySelector('.track__add-btn');
        // кнопка Удалить из плейлиста
        this.btnDeteteEl = this.element?.querySelector('.track__delete-btn');
        // кнопка Добавить в избранное
        this.btnLikeEl = this.element?.querySelector('.track__like-btn');

        // вешаем обработчики событий на все элементы
        this.setEventListenner();

    }

    getTemplate(): void {

        this.template = `
        <li class="tracks__item flex" data-num_tracks_item=${this.props.song.id}>

            <div class="tracks__item__number">${this.props.number || '-'}</div>

            <div class="tracks__item__name">
                <img class="track__img" src=${this.props.song.image} alt="In Bloom">
                <div class="track__content">
                    <h3 class="track__name">
                        <a class="track__name__link" href="##" data-num_track_link=${this.props.song.id}>${this.props.song.name}</a>
                    </h3>
                    <span class="track__author">
                      ${this.props.song.artist.name}
                    </span>
                </div>
            </div>

            <div class="tracks__item__albom">${this.props.song.album.name}</div>

            <div class="tracks__item__data flex">
                <span class="data__text">${howManyDays(this.props.song.createdAt)} дней назад</span>
                <button class="track__like-btn ${isLikeSong(this.props.song, this.props.username || '') ? 'like-btn--active' : ''}" data-num_track_like_btn=${this.props.song.id}>
                    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M15.5022 8.2786e-06C14.6291 -0.00149138 13.7677 0.200775 12.9865 0.590718C12.2052 0.980661 11.5258 1.54752 11.0022 2.24621C10.293 1.30266 9.30512 0.606001 8.17823 0.254823C7.05134 -0.0963541 5.84256 -0.0842713 4.72291 0.289363C3.60327 0.662997 2.62948 1.37926 1.93932 2.3368C1.24916 3.29434 0.877596 4.44467 0.877197 5.62501C0.877197 12.3621 10.2373 17.6813 10.6357 17.9044C10.7477 17.9671 10.8739 18 11.0022 18C11.1305 18 11.2567 17.9671 11.3687 17.9044C13.0902 16.8961 14.7059 15.7173 16.1914 14.3856C19.4665 11.438 21.1272 8.49047 21.1272 5.62501C21.1255 4.13368 20.5323 2.70393 19.4778 1.6494C18.4233 0.594873 16.9935 0.00169855 15.5022 8.2786e-06V8.2786e-06Z"
                            fill="none" />
                    </svg>
                </button>
            </div>
            <time class="tracks__item__time">${convertMsToTime(this.props.song.duration)}</time>
            <div class="tracks__item__drop">
                <button class="track__btn-dropdown" data-num_track_btn_dropdown=${this.props.song.id}>
                    <svg width="23" height="4" viewBox="0 0 23 4" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                        <circle cx="11.5" cy="2" r="2" fill="#C4C4C4" />
                        <circle cx="21" cy="2" r="2" fill="#C4C4C4" />
                    </svg>
                </button>
                <div class="track__dropdown ${this.props.dropdown?.add ? 'dropdown--add' : ''} ${this.props.dropdown?.delete ? 'dropdown--delete' : ''}" data-num_track_dropdown=${this.props.song.id}>
                    <button class="track__add-btn" data-num_track_add_btn=${this.props.song.id}>Добавить в плейлист</button>
                    <button class="track__delete-btn" data-num_track_delete_btn=${this.props.song.id}>Удалить из плейлиста</button>
                </div>
            </div>
        </li>
    `;
    }

    /**
     * Метод вешает обработчики событий на все элементы
     */
    setEventListenner() {

        // обработка события нажатия на ссылку воспроизведения трека
        this.turnEl?.addEventListener('click', (e: CustomEvent) => {
            e.preventDefault();
            if (this.props.handlers?.turn && this.id) this.props.handlers.turn(this.id, e);
        });

        // обработка события нажатия на кнопку открытия всплывающего окна добавления/удаления трека
        this.btnDropdownEl?.addEventListener('click', (e: CustomEvent) => {
            e.preventDefault();
            if (this.props.handlers?.dropdown && this.id) this.props.handlers.dropdown(this.id, e);
        });

        // обработка события нажатия на кнопку Добавить в плейлист
        this.btnAddEl?.addEventListener('click', (e: CustomEvent) => {
            e.preventDefault();
            if (this.props.handlers?.add && this.id) this.props.handlers.add(this.id, e);
        });

        // обработка события нажатия на кнопку Удалить из плейлиста
        this.btnDeteteEl?.addEventListener('click', (e: CustomEvent) => {
            e.preventDefault();
            if (this.props.handlers?.delete && this.id) this.props.handlers.delete(this.id, e);
        });

        // обработка события нажатия на кнопку Добавить в избранное
        this.btnLikeEl?.addEventListener('click', (e: CustomEvent) => {
            e.preventDefault();
            if (this.props.handlers?.like && this.id) this.props.handlers.like(this.id, e);
        });


    }



}
