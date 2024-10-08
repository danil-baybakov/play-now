import './assets/style/style.scss';
import urlUserAvatar from "./assets/image/common/user.jpg";
// import { insertHTML } from './utils/utils';
import { ElementHeader } from './components/content/header/header';
import { ElementAsaid } from './components/content/body/asaid/asaid';
import { ListElementPlaylist } from './components/content/body/main/playlists/playlists';
import { ListElementSong } from './components/content/body/main/songs/songs';
import { ElementPlayer } from './components/content/player/player';
import { ElementModalAddPlaylist } from './components/modal/modal';
import { SONGS, PLAYLISTS, USERS } from './mock/data';
import { append, setSessionStorage, getSessionStorage, shuffleArray, setURLParams, getURLParamByKey } from './utils/utils';
import { CustomEvent } from './components/base/base';
import { ElementOrNone, IPage } from './types/types';
import { REG_USER, USER } from './api/config';
import { fetchRegister, fetchLogin, fetchUserLikes } from './api/user/apiUser';
import {
    fetchSearchSongs, fetchGetSongsById, fetchLikeSongsById,
    fetchUnlikeSongsById, fetchGetSongsPlaylistById,
    isLikeSong, Songs, Song, SongsPlayer
} from './api/song/apiSong';
import { Playlists, fetchGetUserPlaylists, fetchPlaylistsById } from './api/playlist/apiPlaylist';



/**
 * Основной класс для создания приложения
 */
class App {

    body: ElementOrNone = null;  // DOM элемент - body - тело приложения
    modalAddPlaylist: ElementOrNone = null; // DOM элемент - модальное окно добавления трека в плейлист
    content: ElementOrNone = null; // DOM элемент - основной контейнер
    headerEl: ElementOrNone = null; // DOM элемент - шапка приложения
    wrapper: ElementOrNone = null;  // DOM элемент - обертка центальной части контента
    asaid: ElementOrNone = null;  // DOM элемент - меню
    main: ElementOrNone = null;  // DOM элемент - контейнер страниц
    listSongs: ElementOrNone = null;   // DOM элемент - страница треков
    listPlaylists: ElementOrNone = null;   // DOM элемент - страница плейлистов
    playerEl: ElementOrNone = null; // DOM элемент - плеер

    player?: ElementPlayer; //  класс для создания плеера
    header?: ElementHeader; //  класс для создания шапки приложения

    songs: Songs = []; // список воспоизведения плеера
    songsCopy: Songs = []; // копия списока воспоизведения плеера

    play: boolean = false; // флаг Проигрывать треки
    repeat: boolean = false; // флаг Трек на повтор
    shuffle: boolean = false; // флаг Перемешать треки в случайном порядке



    constructor() {
        this.init();
    }

    init() {
        (async () => {
            await this.login();
            await this.render();
        })();
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
            } catch (e) { console.log(e); }
            // авторизируем пользователя в API и получаем токен
            const { access_token } = await fetchLogin(USER);
            // сохраняем токен в sessionStorage
            setSessionStorage('token', access_token);
            // сохраняем логин текущего ползьователя в sessionStorage
            setSessionStorage('username', USER.username);
        }
    }

    /**
     * Функция отрисовки компонентов при инициалиации класса
     */
    async render() {

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
            {
                user: USERS[0],
                url_avatar: urlUserAvatar,
                handlers: {
                    search: this.setSearchParams.bind(this),
                }
            }
        );
        this.headerEl = this.header.element;
        append(this.content, this.headerEl);

        // создаем и довавляем в основной контейнер обертку центальной части контента
        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("content-wrap", "flex")
        this.content.append(this.wrapper);

        // c API получаем список плейлистов
        let playlists: Playlists = [];
        try {
            playlists = await fetchGetUserPlaylists(getSessionStorage('token'));
        } catch (e) { console.log(e); }

        // создаем и довавляем в обертку центальной части контента меню
        this.asaid = new ElementAsaid(
            {
                playlists: playlists,
                handlers: {
                    navigate: this.navigate.bind(this),
                }
            }
        ).element;
        append(this.wrapper, this.asaid);

        // создаем и довавляем в обертку центальной части контента контейнера страниц
        this.main = document.createElement("main");
        this.main.classList.add("main");
        this.wrapper.append(this.main);

        // отображаем текущую страницу
        await this.router({ name: window.location.pathname, search: '' });

        // вешаем обработчик события навигации по истории браузера 
        // осуществляет переход на страницу соответствующей текущему пути в URL
        window.addEventListener('popstate', () => this.router({ name: window.location.pathname, search: '' }));

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
     * @param {ElementOrNone} e - объект события элемента
    */
    turn(id: number, e?: CustomEvent): void {
        // отрисовываем плеер по id трека
        this.renderPlayerById(id, this.play);
    }

    /***
    * Обработчик клика кнопки открытия модального окна 
    * с двумя возможными контестными действиями (удаления/добавления)
    * @param {number} id - идентификатор элемента
    * @param {ElementOrNone} e - объект события элемента
    */
    dropdown(id: number, e?: CustomEvent): void {

        if (!(id && e)) return;

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
    * @param {ElementOrNone} e - объект события элемента
    */
    add(id: number, e?: CustomEvent): void {
        // открываем модальное окно добавления трека в плейлист
        this.modalAddPlaylist?.classList.add('show');
    }

    /***
    * Обработчик клика кнопки удаления трека из плейлиста 
    * @param {number} id - идентификатор элемента
    * @param {ElementOrNone} e - объект события элемента 
    */
    delete(id: number, e?: CustomEvent): void {
        // находим соответствующий элемент трека и удаляем его из DOM
        const songItem = document.querySelector(`[data-num_tracks_item="${id}"]`);
        songItem?.remove();
    }

    /***
    * Обработчик клика кнопки добавления трека в избранное
    * @param {number} id - идентификатор элемента
    * @param {ElementOrNone} e - объект события элемента
    */
    like(id: number, e?: CustomEvent) {

        (async () => {

            let like = false; // статус трека - в избранном/ не в избранном 

            // по id получаем с API объект с данными трека
            let song: Song;
            try {
                song = await fetchGetSongsById(getSessionStorage('token'), id);
            } catch (e) {
                console.log(e)
                return
            }

            // определяем текущий статус трека - в избранном или нет ??
            like = isLikeSong(song, USER.username)

            try {
                // если не в избранном
                if (!like) {
                    // делаем запрос на сервер чтобы добавить трек в избранное
                    await fetchLikeSongsById(getSessionStorage('token'), id);
                    // отмечаем что трек стал избранным
                    like = true;
                    // иначе
                } else {
                    // делаем запрос на сервер чтобы убрать трек из избранного
                    await fetchUnlikeSongsById(getSessionStorage('token'), id);
                    // отмечаем что трек стал не избранным
                    like = false;
                }
            } catch (e) {
                console.log(e)
                return
            }

            // находим соответствующую кнопку лайка и меняем ее состояние
            // если она была активной делаем ее неактивной и наоборот
            const likeBtn = document.querySelector(`[data-num_track_like_btn="${id}"]`);
            if (likeBtn) likeBtn?.classList.toggle('like-btn--active');

            const likeBtnPlayer = document.querySelector(`[data-player_num_track_like_btn="${id}"]`);
            if (likeBtnPlayer) likeBtnPlayer?.classList.toggle('like-btn--active');

            // если открыта страница ибранных треков
            // и трек удален из избранных, перерисовывам страницу
            const urlPathName = window.location.pathname;
            if (urlPathName === "/favorite") {
                const result = await this.router({ name: urlPathName, search: '' });
                setURLParams("songId", '');
            }

        })();

    }

    /***
     * Функция роутинга страниц приложения
     * @param {IPage} page - объект с путем и параметрами страницы
     */
    async router(page: IPage): Promise<boolean> {

        // из URL получаем параметры play, shuffle, repeat
        // обновляем соответствующие параметры класса play, shuffle, repeat полученными значениями из URL
        this.play = getURLParamByKey('play', '0', 'bool');
        this.shuffle = getURLParamByKey('shuffle', '0', 'bool');
        this.repeat = getURLParamByKey('repeat', '0', 'bool');

        // из URL получаем параметр со значением поискового запроса если есть такой
        let searchName = getURLParamByKey('search', '');

        // если при переходе на страницу -  в URL нет параметра с поисковым запросом
        if (searchName === '') {
            const searchInputEl = document.querySelector('.header__search__field');
            if (searchInputEl instanceof HTMLInputElement) {
                const valueSearchInputEl = searchInputEl.value;
                // и в поле поиска есть значение
                if (valueSearchInputEl !== '') {
                    // устанавливаем это значение в параметр URL
                    setURLParams("search", valueSearchInputEl);
                    // и используем для поиска
                    searchName = valueSearchInputEl;
                }
            }
        }

        // если при обновлении страницы - параметр поиска в URL не пустой
        // и поле ввода поиска пустое заполняем его значением параметра поиска из URL
        if (searchName !== '' && this.header?.searchFieldEl?.value === '') {
            this.header.searchFieldEl.value = searchName;
        }

        // из URL получаем параметр с Id текущего проигрываемого трека если есть такой
        const songId = getURLParamByKey('songId', null);

        // делаем все кнопки навигации неактивными
        document.querySelectorAll('.aside__btn').forEach(elem => {
            elem.classList.remove('aside__btn-active');
        })


        // переход на страницу Треки
        if ((page.name === '/') || (page.name === '/favorite') || page.name.startsWith('/playlist-')) {

            // флаг - открыта страница конкретного плейлиста
            const selectPlaylist = page.name.startsWith('/playlist-');

            // флаг - открываем страницу избранных треков
            const selectPageSongsLike = page.name === '/favorite';

            // если открываем страницу конкретного плейлиста
            // из пути URL браузера извлекаем номер плейлиста 
            // и формируем заголовок страницы
            let titlePleylist: string | null = null;
            let playlistId = ''
            if (selectPlaylist) {
                playlistId = page.name.replace('/playlist-', '');
                const playlist = await fetchPlaylistsById(getSessionStorage('token'), Number(playlistId));
                titlePleylist = playlist.name;
            }

            // формируем заголовок страницы
            const title = !selectPlaylist ? ((page.name === '/') ? "Треки" : "Избранное") : `${titlePleylist}`;

            // c API получаем список треков
            const songs: Songs = await this.getSongs(selectPageSongsLike, Number(playlistId));

             // фильтруем список полученных треков и сохраняем в список воспроизведения плеера
            this.songs = songs.filter(({ name }) =>
                name.toLowerCase().includes(searchName.toLowerCase())
            );
            this.songsCopy = [...songs];
         
            // отрисовывам страницу с треками
            await this.renderPageSongs(this.songs, title);
            
            
            if (this.shuffle) shuffleArray(this.songs);

            if (!selectPlaylist && !selectPageSongsLike) {
                // кнопку навигации Треки делаем активной
                document.querySelector('[data-path="/"]')?.classList.add('aside__btn-active');
            } else if (selectPageSongsLike) {
                // кнопку навигации Избранное делаем активной
                document.querySelector('[data-path="/favorite"]')?.classList.add('aside__btn-active');
            } else {
                // кнопку навигации Плейлист .. делаем активной
                document.querySelector(`[data-path="playlist-${playlistId}"]`)?.classList.add('aside__btn-active');
            }

            // если в URL нет параметра с ID текущего выбранного трека
            if (!songId) {

                // в плеер выводим случайно выбранный трек
                const ranSong = this.getSongRandom(this.songs);
                if (ranSong) {
                    this.renderPlayer(ranSong, this.play);
                    setURLParams("songId", String(ranSong.id));
                }
     
            // иначе в плеер выводим трек с ID из URL параметра
            } else {
                console.log(songId);
                this.renderPlayerById(Number(songId), this.play);
            }


        }

        // переход на страницу Плейлисты
        if (page.name === '/playlists') {
            // удаляем из DOM плеер (футер)
            this.playerEl?.remove();

            // c API получаем список плейлистов
            let playlists: Playlists = [];
            try {
                playlists = await fetchGetUserPlaylists(getSessionStorage('token'));
            } catch (e) { console.log(e); }

            // фильтруем плейлисты в соответствии с поисковым запросом
            const filterPlaylists = playlists.filter(({ name }) =>
                name.toLowerCase().includes(searchName.toLowerCase())
            );

            // отрисовывам страницу с плейлистами
            this.renderPagePlaylists(filterPlaylists);

            // кнопку навигации Плейлисты делаем активной
            document.querySelector('[data-path="playlists"]')?.classList.add('aside__btn-active');

        }

        return true;

    }

    /***
     * Функция меняет путь в URL браузера и вызывает функцию 
     * роутинга на соответствующую страницу
     * @param {string} name - наименование пути
     */
    navigate(name: string) {
        (async () => {
            // меняем путь в URL браузера
            window.history.pushState(null, '', '/');
            window.history.pushState(null, '', name);

            // создаем объект с новым путем
            const iPage: IPage = {
                name: window.location.pathname,
                search: "",
            }

            // вызываем функцию роутинга на соответствующую страницу
            await this.router(iPage);
        })();
    }

    /***
     * Функция добавляет параметр в URL браузера и вызывает функцию 
     * роутинга для перехода на соответствующую страницу
     * @param {string} key - ключ URL параметра
     * @param {string} value - значение URL параметра
     */
    setSearchParams(key: string, value: string, e: CustomEvent) {
        (async () => {

            // добавляем в путь URL браузера новые поисковые параметры
            const iPage = setURLParams(key, value);

            // вызываем функцию роутинга на соответствующую страницу
            await this.router(iPage);
        })();
    }


    /**
     * Функция в зависимости от заданных входных параметров получает из API
     * полный список треков, список треков отдельного плейлиста, список избранных треков
     * @param {boolean} isLikes - флаг: 1 - получить список избранных треков, 0 - получить полный список треков
     * @param {number | null} playlistId - если задан, функция выдает список треков отдельного плейлиста
     * @returns 
     */
    async getSongs( isLikes: boolean = false, playlistId?: number): Promise<Songs> {
        let songs: Songs = [];
        // если задан id отдельного плейлиста
        // получаем список треков отдельного плейлиста
        if (playlistId) {
            try {
                songs = await fetchGetSongsPlaylistById(getSessionStorage('token'), playlistId);
            } catch (e) { 
                console.log(e); 
            }
        }
        // иначе если isLikes = true
        // получаем список избранных треков
        else if (isLikes) {
            try {
                const response = await fetchUserLikes(getSessionStorage('token'));
                songs = response.songLikes;
            } catch (e) { 
                console.log(e); 
            }
        }
        // иначе получаем полный список треков
        else {
            try {
                songs = await fetchSearchSongs(getSessionStorage('token'));
            } catch (e) { 
                console.log(e); 
            }
        }
        return songs;
    }

    /**
     * Функция отрисовки страницы со списком треков
     * @param {Songs} songs - список треков (объекты с данными о треке)
     * @param {string} title - заголовок страницы
     */
    async renderPageSongs(songs: Songs, title: string): Promise<Songs> {

        // вызываем функцию очистки контейнера страниц
        this.clearPageContainer()

        // создаем и довавляем контейнер страниц элемент страницы треков
        this.listSongs = new ListElementSong(
            {
                songs: songs,
                username: USER.username,
                title: title,
                handlers: {
                    turn: this.turn.bind(this),
                    dropdown: this.dropdown.bind(this),
                    add: this.add.bind(this),
                    delete: this.delete.bind(this),
                    like: this.like.bind(this)

                }
            }

        ).element;
        append(this.main, this.listSongs);

        // возвращаем список треков
        return songs
    }

    /**
    * Функция отрисовки страницы со списком плейлистов
    * @param {Playlists} playlists - список плейлистов (объекты с данными о плейлисте)
    */
    renderPagePlaylists(playlists: Playlists): void {

        // вызываем функцию очистки контейнера страниц
        this.clearPageContainer()

        // создаем и довавляем контейнер страниц элемент страницы плейлистов
        this.listPlaylists = new ListElementPlaylist({
            playlists: playlists,
        }).element;
        append(this.main, this.listPlaylists);
    }

    /**
     * Функция очищает контейнер страниц
     */
    clearPageContainer(): void {
        // очищаем контейнер страниц
        if (this.main instanceof HTMLElement) this.main.innerHTML = '';
    }

    /**
     * Функция отрисовки футера (плеера)
     * @param { Song } song - трек
     */
    renderPlayer(song?: Song, play: boolean = false): void {

        if (!song) return;
 
        // удаляем старый футер
        this.playerEl?.remove();

        // создаем новый футер с плеером
        this.player = new ElementPlayer(
            {
                song: song,
                username: USER.username,
                status: {
                    start: play,
                    shuffle: this.shuffle,
                    repeat: this.repeat
                },
                handlers: {
                    playPause: this.playPause.bind(this),
                    like: this.like.bind(this),
                    ended: this.nextSong.bind(this),
                    shuffle: this.shuffleSong.bind(this),
                    prev: this.prevSong.bind(this),
                    next: this.nextSong.bind(this),
                    repeat: this.repeatSong.bind(this),
                }
            }
        );
        this.playerEl = this.player.element;

        append(this.content, this.playerEl);
    }

    /**
     * Функция отрисовки плеера по id плеера
     * @param {number} id - id трека
     */
    renderPlayerById(id: number, play: boolean = false): void {
        // получаем индекс трека в массиве треков
        const song= this.getSongById(this.songs, id);

        console.log(song);

        // отрисовываем плеер с соответствующим треком
        if (song) {
            this.renderPlayer(song, this.play);
            setURLParams("songId", String(id));
        }
    }

    /**
     * Обработчик события нажатия на кнопку плеера Воспроизвести/Пауза
     * @param {number} id - id трека
     * @param {boolean} status - статус: 1 - воспроизведение, 0 - пауза
     */
    playPause(id?: number, status: boolean = false) {

        // не обрабатываем событие если нет id
        if (!id) return;

        
        // в URL и классе значение параметра play 
        // меняем на противоположное
        this.play ? this.play = false : this.play = true;
        this.play ? setURLParams('play', '1') : setURLParams('play', '0');
    }

    /**
     * Обработчик события окончания воспроизведения текущего трека
     * @param {number} id - id трека
     */
    endedSong(id?: number) {

        // не обрабатываем событие если нет id
        if (!id) return;
    }


    /**
    * Обработчик события нажатия на кнопку плеера Перемешать
    * @param {number} id - id трека
    */
    shuffleSong(id?: number) {

        // не обрабатываем событие если нет id
        if (!id) return;

        // в URL и классе значение параметра shaffle 
        // меняем на противоположное
        this.shuffle ? this.shuffle = false : this.shuffle = true;
        this.shuffle ? setURLParams('shuffle', '1') : setURLParams('shuffle', '0');

        // меняем цвет кнопки
        this.player?.btnShaffleSongEl?.classList.toggle('active');

        // если не режим повтора
        if (!this.repeat) {
            if (this.shuffle) {
                shuffleArray(this.songs);
            } else {
                this.songs = [...this.songsCopy];
            }
        }

    }


    /**
    * Обработчик события нажатия на кнопку плеера Назад
    * @param {number} id - id трека
    */
    prevSong(id?: number) {

        // не обрабатываем событие если нет id
        if (!id) return;

        // если не режим повтора
        // включаем предыдущий трек
        if (!this.repeat) {
            const prevSong = this.getSongNextById(this.songs, id, false);
            if (prevSong) {
                this.renderPlayer(prevSong, this.play);
                setURLParams("songId", String(prevSong.id));
            }
        } else {
            this.renderPlayerById(id, this.play);
        }
            
    }

    /**
    * Обработчик события нажатия на кнопку плеера Вперед
    * @param {number} id - id трека
    */
    nextSong(id?: number) {

        // не обрабатываем событие если нет id
        if (!id) return;

        // если не режим повтора
        // включаем следующий трек
        if (!this.repeat) {
            const nextSong = this.getSongNextById(this.songs, id);
            if (nextSong) {
                this.renderPlayer(nextSong, this.play);
                setURLParams("songId", String(nextSong.id));
            }
        } else {
            this.renderPlayerById(id, this.play);
        }
        
    }

    /**
    * Обработчик события нажатия на кнопку плеера Повторить
    * @param {number} id - id трека
    */
    repeatSong(id?: number) {

        // не обрабатываем событие если нет id
        if (!id) return;

        // в URL и классе значение параметра repeat 
        // меняем на противоположное
        this.repeat ? setURLParams('repeat', '0') : setURLParams('repeat', '1');
        this.repeat ? this.repeat = false : this.repeat = true;

        // меняем цвет кнопки
        this.player?.btnRepeatSongEl?.classList.toggle('active');

    }


    /**
     * Функция определяет индекс трека в массиве треков по id
     * @param {Songs} songs - список треков
     * @param {number} id - id трека
     * @returns 
     */
    getSongIndexById(songs: Songs, id: number): number | undefined {
        // возвращаем undefined если массив треков пустой
        if (songs.length === 0) return;

        
        // ищем трек с нужным id
        // и если его нашли вовращаем индекс трека в массиве
        for (const index in songs) {
            if (songs[index].id === id ) return Number(index);
        }
    }

    /**
     * Функция возвращает случайный трек из массива треков
     * @param {Songs} songs - список треков
     * @returns 
     */
    getSongRandom(songs: Songs): Song | undefined {
         // возвращаем undefined если массив треков пустой
         if (songs.length === 0) return;

         // возвращаем случайный трек
         const rand = Math.floor(Math.random() * songs.length);
         return songs[rand];
    }

    /**
     * Функция из массива треков по Id возвращает трек
     * @param {Songs} songs - список треков
     * @param {number} id - id трека
     * @returns 
     */
    getSongById(songs: Songs, id: number): Song | undefined {
        // возвращаем undefined если массив треков пустой
        if (songs.length === 0) return;

         // определяем индекс трека в массиве треков по id
         const index = this.getSongIndexById(songs, id);

          // если есть такой трек
        if (index !== undefined) {
            return songs[index];
        }

    }


    /**
     * Функция возвращает следующий или предыдущий трек в массиве треков
     * @param {Songs} songs - список треков
     * @param {number} id - id трека
     * @param {boolean} next - флаг: 1 (по умолчанию) - возвращаем следующий трек, 0 - предыдущий
     * @returns 
     */
    getSongNextById(songs: Songs, id: number, next: boolean = true): Song | undefined {
        // возвращаем undefined если массив треков пустой
        if (songs.length === 0) return;

        // определяем индекс трека в массиве треков по id
        const index = this.getSongIndexById(songs, id);
        
        // если есть такой трек
        if (index !== undefined) {
            // если хотом получить следующий трек
            if (next) {
                // если индекс последнего трека в массиве треков
                // возвращаем первый трек из массива треков
                if (index === (songs.length - 1)) {
                    return songs[0]
                // иначе 
                // возвращаем следующий трек из массива треков
                } else {
                    return songs[index + 1]
                }
            // если хотом получить предыдущий трек   
            } else {
                // если индекс первого трека в массиве треков
                // возвращаем последний трек из массива треков
                if (index === 0) {
                    return songs[songs.length - 1]
                // иначе 
                // возвращаем предыдущий трек из массива треков
                } else {
                    return songs[index - 1]
                }
            }
        }      
    }


}

// создание класса приложения
const app = new App();



