import './assets/style/style.scss';
// import { insertHTML } from './utils/utils';
import { ElementHeader } from './components/content/header/header';
import { ElementAsaid } from './components/content/body/asaid/asaid';
import { ListElementPlaylist } from './components/content/body/main/playlists/playlists';
import { ListElementSong } from './components/content/body/main/songs/songs';
import { ElementFooter } from './components/content/footer/footer';
import { ElementModalAddPlaylist } from './components/modal/modal';
import { SONGS, PLAYLISTS, USERS } from './mock/data';
import { append, setSessionStorage, getSessionStorage } from './utils/utils';
import { CustomEvent } from './components/base/base';
import { CustomElement, NavigatePath, IPage } from './types/types';
import { REG_USER, USER } from './api/config';
import { fetchRegister, fetchLogin, JwtDto } from './api/user/apiUser';
import { fetchSearchSongs, fetchGetSongsById, fetchLikeSongsById, fetchUnlikeSongsById, isLikeSong, Songs, Song } from './api/song/apiSong';
import { Playlists } from './api/playlist/apiPlaylist';

/**
 * Основной класс для создания приложения
 */
class App {

    body: HTMLBodyElement | null  = null;  // DOM элемент - body - тело приложения
    modalAddPlaylist: CustomElement | null = null; // DOM элемент - модальное окно добавления трека в плейлист
    content: HTMLDivElement | null = null; // DOM элемент - основной контейнер
    header: CustomElement | null = null; // DOM элемент - шапка приложения
    wrapper: HTMLDivElement | null = null;  // DOM элемент - обертка центальной части контента
    asaid: CustomElement | null = null;  // DOM элемент - меню
    main: HTMLElement | null = null;  // DOM элемент - контейнер страниц
    listSongs: CustomElement | null = null;   // DOM элемент - страница треков
    listPlaylists: CustomElement | null = null;   // DOM элемент - страница плейлистов
    footer: CustomElement | null = null; // DOM элемент - футер - блок управления музыкой


    constructor() {
        (async () => await this.login())();
        this.render();
    }


    /**
     * Функция аутентификации пользователя
     */
    async login() {
        // токен авторизации
        let token: JSON | null = null;
        // проверяем есть ли токен в sessionStorage
        token = getSessionStorage('token');
        // если нет регистрируемся и авторизируемся
        if (!token) {
            try {
                // регистрируем польователя в API если не был зарегестрирован
                await fetchRegister(REG_USER);
            } catch(e) {} 
            // авторизируем пользователя в API и получаем токен
            const { access_token } = await fetchLogin(USER); 
            // сохраняем токен в sessionStorage
            setSessionStorage('token', access_token);
        }
    }

    /**
     * Функция отрисовки компонентов при инициалиации класса
     */
    render() {

        // получаем элемент - тело приложения
        this.body = document.querySelector('body');

        // создаем и довавляем в тело приложения модальное окно добавления трека в плейлист
        this.modalAddPlaylist = new ElementModalAddPlaylist(PLAYLISTS).element;
        append(this.body, this.modalAddPlaylist);

        // создаем и довавляем в тело приложения основной контейнер
        this.content = document.createElement("div");
        this.content.classList.add("over-wrapper");
        this.content.setAttribute('style', 'position: relative; overflow: hidden;');
        append(this.body, this.content);

        // создаем и довавляем в основной контейнер шапку приложения
        this.header = new ElementHeader(
            USERS[0], 
            this.setSearchParams.bind(this)
        )
        .element;
        append(this.content, this.header);

        // создаем и довавляем в основной контейнер обертку центальной части контента
        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("content-wrap", "flex")
        this.content.append(this.wrapper);

        // создаем и довавляем в обертку центальной части контента меню
        this.asaid = new ElementAsaid(
            PLAYLISTS, 
            this.navigate.bind(this)
        ).element;
        append(this.wrapper, this.asaid);

        // создаем и довавляем в обертку центальной части контента контейнер страниц
        this.main = document.createElement("main");
        this.main.classList.add("main");
        this.wrapper.append(this.main);

        // отображаем текущую страницу
        this.router({ name: window.location.pathname, search: ''});
        
        // вешаем обработчик события навигации по истории браузера 
        // осуществляет переход на страницу соответствующей текущему пути в URL
        window.addEventListener('popstate', () => this.router({ name: window.location.pathname, search: ''}));

        // делаем так чтобы модальное окно Удаления/добавления трека
        // автоматически закрывалость при нажатии на любую область плиложения кроме этого окна
        document.body.addEventListener('click', (e: CustomEvent) => {
            if (e.__isClickBtnOpenDropdown) return;
            document.querySelectorAll('.track__dropdown').forEach((e) => { 
                e?.classList.remove('dropdown--active');
            })
        })

    }

    /***
     * Обработчик клика по выбранному треку
     * @param {number} id - идентификатор элемента
     * @param {CustomElement} e - объект события элемента
    */
    turnOnSong(id: number, e: CustomEvent): void {
        this.footer?.remove();
        if (SONGS) {
            const footer = new ElementFooter(SONGS[id-1]).element;
            append(this.content, footer);
        }
    }

    /***
    * Обработчик клика кнопки открытия модального окна 
    * с двумя возможными контестными действиями (удаления/добавления)
    * @param {number} id - идентификатор элемента
    * @param {CustomElement} e - объект события элемента
    */
    openDropdown(id: number, e: CustomEvent): void {
        // закрываеи все модальные окна Удаления/добавления трека 
        // если они были открыты
        document.querySelectorAll('.track__dropdown').forEach((e) => { 
            e?.classList.remove('dropdown--active');
        })
        e.__isClickBtnOpenDropdown = true;
        // открываем необхлдимое модальные окно Удаления/добавления трека
        const dropdown = document.querySelector(`[data-num_track_dropdown="${id}"]`)
        dropdown?.classList.add('dropdown--active');
    }

    /***
    * Обработчик клика кнопки добавления трека в плейлист
    * @param {number} id - идентификатор элемента
    * @param {CustomElement} e - объект события элемента
    */
    addSong(id: number, e: CustomEvent): void {
        // открываем модальное окно добавления трека в плейлист
        this.modalAddPlaylist?.classList.add('show');
    }

    /***
    * Обработчик клика кнопки удаления трека из плейлиста 
    * @param {number} id - идентификатор элемента
    * @param {CustomElement} e - объект события элемента 
    */
    deleteSong(id: number, e: CustomEvent): void {
        // находим соответствующий элемент трека и удаляем его из DOM
        const songItem = document.querySelector(`[data-num_tracks_item="${id}"]`);
        songItem?.remove();
    }

    /***
    * Обработчик клика кнопки добавления трека в избранное
    * @param {number} id - идентификатор элемента
    * @param {CustomElement} e - объект события элемента
    */
    async likeSong(id: number, e: CustomEvent) {

        // по id получаем с API объект с данными трека
        let song: Song;
        try {
            song = await fetchGetSongsById(getSessionStorage('token'), id);      
        } catch(e) {
            console.log(e)
            return
        }

        try {
            // если не стоит лайк
            if (!isLikeSong(song, USER.username)) {
                // делаем запрос на сервер чтобы поставить лайк
                await fetchLikeSongsById(getSessionStorage('token'), id);
            // иначе
            } else {
                // делаем запрос на сервер чтобы убрать лайк
                await fetchUnlikeSongsById(getSessionStorage('token'), id);
            }
        } catch(e) {
            console.log(e)
            return
        }

        // находим соответствующую кнопку лайка и меняем ее состояние
        // если она была активной делаем ее неактивной и наоборот
        const likeBtn = document.querySelector(`[data-num_track_like_btn="${id}"]`);
        likeBtn?.classList.toggle('like-btn--active');

    }

    /***
     * Функция роутинга страниц приложения
     * @param {IPage} page - объект с путем и параметрами страницы
     */
    async router(page: IPage) {

        // создаем объект для извлечения поисковых параметров
        const paramsFromUrl = new URLSearchParams(window.location.search);
     
        // из URL получаем параметр со значением поискового запроса
        const searchName = paramsFromUrl.get('search') || '';

        // делаем все кнопки навигации неактивными
        document.querySelectorAll('.aside__btn').forEach(elem => {
            elem.classList.remove('aside__btn-active');
        })

        // удаляем из DOM плеер (футер)
        this.footer?.remove();

        // переход на страницу Треки
        if ((page.name === '/') || (page.name === '/favorite') || page.name.startsWith('/playlist-')) {

            // флаг - открыта страница конкретного плейлиста
            const selectPlaylist = page.name.startsWith('/playlist-');

            // если открываем страницу конкретного плейлиста
            // из пути URL браузера извлекаем номер плейлиста 
            let playlistId = '';
            if (selectPlaylist) playlistId = page.name.replace('/playlist-', '')

            // c API получаем список треков
            let songs: Songs = [];
            try {
                songs = await fetchSearchSongs(getSessionStorage('token'), searchName);
            } catch(e) {}

            // формируем заголовок страницы
            const title = !selectPlaylist ? ((page.name === '/') ? "Треки": "Избранное") : `Плейлист ${playlistId}`;

            // отрисовывам страницу с треками
            this.renderPageSongs(songs, title);

            if (!selectPlaylist) {
                // кнопку навигации Треки делаем активной
                document.querySelector('[data-path="/"]')?.classList.add('aside__btn-active');
            } else {
                // кнопку навигации Плейлист .. делаем активной
                document.querySelector(`[data-path="playlist-${playlistId}"]`)?.classList.add('aside__btn-active');
            }

            // создаем и добавлем в основной контейнер плееер (футер)
            if (songs.length > 0) {
                this.footer = new ElementFooter(songs[0]).element;
                append(this.content, this.footer);
            }
        }

        // переход на страницу Плейлисты
        if (page.name === '/playlists') {

            // фильтруем плейлисты в соответствии с поисковым запросом
            const playlists = PLAYLISTS.filter(({ name }) =>
                name.toLowerCase().includes(searchName.toLowerCase())
            );

            // отрисовывам страницу с плейлистами
            this.renderPagePlaylists(playlists);

            // кнопку навигации Плейлисты делаем активной
            document.querySelector('[data-path="playlists"]')?.classList.add('aside__btn-active');

        }

    }

    /***
     * Функция меняет путь в URL браузера и вызывает функцию 
     * роутинга на соответствующую страницу
     * @param {string} name - наименование пути
     */
    navigate(name: string) {

        // меняем путь в URL браузера
        window.history.pushState(null, '', '/');
        window.history.pushState(null, '', name);

        // создаем объект с новым путем
        const iPage: IPage = {
            name: window.location.pathname,
            search: "",
        }

        // вызываем функцию роутинга на соответствующую страницу
        this.router(iPage);
    }

    /***
     * Функция добавляет параметр в URL браузера и вызывает функцию 
     * роутинга для перехода на соответствующую страницу
     * @param {string} key - ключ URL параметра
     * @param {string} value - значение URL параметра
     */
    setSearchParams(key: string, value: string, e: CustomEvent) {

        // создаем объект для формированания строки поисковых параметров
        const urlSearchParams = new URLSearchParams();
        urlSearchParams.set(key, value);

        // создаем объект с текущим путем и новыми параметрами страницы
        const iPage: IPage = {
            name: window.location.pathname,
            search: urlSearchParams.toString(),
        }

        // добавляем в путь URL браузера новые поисковые параметры
        window.history.replaceState(null, '', `${iPage.name}?${iPage.search}`)

        // вызываем функцию роутинга на соответствующую страницу
        this.router(iPage);
    }

    /**
     * Функция отрисовки страницы со списком треков
     * @param {Songs} songs - список треков (объекты с данными о треке)
     * @param {string} title - заголовок страницы
     */
    renderPageSongs(songs: Songs, title: string): void {
        // вызываем функцию очистки контейнера страниц
        this.clearPageContainer()

        // создаем и довавляем контейнер страниц элемент страницы треков
        this.listSongs = new ListElementSong(
            songs, 
            USER.username,
            title,
            this.turnOnSong.bind(this),
            this.openDropdown.bind(this), 
            this.addSong.bind(this), 
            this.deleteSong.bind(this),
            this.likeSong.bind(this)  
        ).element;
        append(this.main, this.listSongs);
    }

    /**
    * Функция отрисовки страницы со списком плейлистов
    * @param {Playlists} playlists - список плейлистов (объекты с данными о плейлисте)
    */
    renderPagePlaylists(playlists: Playlists): void {
        
        // вызываем функцию очистки контейнера страниц
        this.clearPageContainer()
    
        // создаем и довавляем контейнер страниц элемент страницы плейлистов
        this.listPlaylists = new ListElementPlaylist(playlists).element;
        append(this.main, this.listPlaylists);
    }

    /**
     * Функция очищает контейнер страниц
     */
    clearPageContainer(): void {
        // очищаем контейнер страниц
        if (this.main instanceof HTMLElement) this.main.innerHTML = '';
    }


}

const app = new App();



