import './assets/style/style.scss';
import urlUserAvatar from "./assets/image/common/user.svg";
import urlDefaultImg from "./assets/image/playlists/playlists.jpg";
import { HeaderEl } from './components/content/header/header';
import { AsaidEl, AsaidBtnEl } from './components/content/body/asaid/asaid';
import { PlaylistsEl } from './components/content/body/main/playlists/playlists';
import { SongsEl } from './components/content/body/main/songs/songs';
import { PlayerEl } from './components/content/player/player';
import { PlaylistModalEl, PlaylistModalBtnEl, PlaylistModalRemoveEl } from './components/modal/modal';
import { SONGS, PLAYLISTS, USERS } from './mock/data';
import { append, setSessionStorage, getSessionStorage, 
        shuffleArray, setURLParams, getURLParamByKey } from './utils/utils';
import { CustomEvent } from './components/base/base';
import { ElementOrNone, IPage } from './types/types';
import { REG_USER, USER } from './api/config';
import { fetchRegister, fetchLogin, fetchUserLikes } from './api/user/apiUser';
import {
    fetchSearchSongs, fetchGetSongsById, fetchLikeSongsById,
    fetchUnlikeSongsById, fetchGetSongsPlaylistById,
    isLikeSong, Songs, Song, SongsPlayer
} from './api/song/apiSong';
import {
    Playlists, Playlist, fetchGetUserPlaylists,
    fetchPlaylistsById, fetchCreatePlaylist,
    fetchAddSongToPlaylist, fetchRemoveSongFromPlaylist
} from './api/playlist/apiPlaylist';



/**
 * Основной класс для создания приложения
 */
class App {

    // DOM элементы
    bodyEl: ElementOrNone = null;  // тело приложения
    contentEl: ElementOrNone = null; // основной контейнер
    wrapperEl: ElementOrNone = null;  // обертка центальной части контента
    mainEl: ElementOrNone = null;  // контейнер страниц

    // классы создания DOM элементов
    player?: PlayerEl; //  плеер
    header?: HeaderEl; //  шапка приложения
    songs?: SongsEl; //  список треков
    playlists?: PlaylistsEl; // список плейлистов
    asaid?: AsaidEl; // меню
    playlistModal?: PlaylistModalEl; //  модальное окно добавления трека в плейлист
    playlistModalRemove?: PlaylistModalRemoveEl; //  модальное окно удаления трека из плейлиста

    playSongs: Songs = []; // список воспоизведения плеера
    playSongsCopy: Songs = []; // копия списока воспоизведения плеера
    currentPlaylists: Playlists = []; // текущий список плейлистов

    audioCtx?: AudioContext; // аудиоконтекст
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
        this.bodyEl = document.querySelector('body');

        // c API получаем список плейлистов
        try {
            this.currentPlaylists = await fetchGetUserPlaylists(getSessionStorage('token'));
        } catch (e) { console.log(e); }

        // создаем и довавляем в тело приложения основной контейнер
        this.contentEl = document.createElement("div");
        this.contentEl.classList.add("over-wrapper");
        this.contentEl.setAttribute('style', 'position: relative; overflow: hidden;');
        append(this.bodyEl, this.contentEl);

        // создаем и довавляем в основной контейнер шапку приложения
        this.header = new HeaderEl(
            {
                user: USER,
                url_avatar: urlUserAvatar,
                handlers: {
                    search: this.setSearchParams.bind(this),
                }
            }
        );
        append(this.contentEl, this.header.element);

        // создаем и добавляем в основной контейнер обертку центальной части контента
        this.wrapperEl = document.createElement("div");
        this.wrapperEl.classList.add("contentEl-wrap", "flex")
        this.contentEl.append(this.wrapperEl);

        // отрисовываем меню
        this.renderAsaid();

        // создаем и довавляем в обертку центальной части контента контейнера страниц
        this.mainEl = document.createElement("main");
        this.mainEl.classList.add("main");
        this.wrapperEl.append(this.mainEl);

        // отображаем текущую страницу
        await this.router({ name: window.location.pathname, search: '' });

        // вешаем обработчик события навигации по истории браузера 
        // осуществляет переход на страницу соответствующей текущему пути в URL
        window.addEventListener('popstate', async () => {
            const iPage: IPage = {
                name: window.location.pathname,
                search: '',
            }
            await this.router(iPage);
        });

        // делаем так чтобы модальное окно Удаления/добавления трека
        // автоматически закрывалость при нажатии на любую область приложения кроме этого окна
        this.bodyEl?.addEventListener('click', (e: CustomEvent) => {
            if (e.__isClickBtnOpenDropdown) return;
            this.songs?.songObjs.forEach(item => {
                item.dropdownEl?.classList.remove('dropdown--active');
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
    * Обработчик события нажатия на кнопку открытия 
    * всплывающего окна добавления/удаления трека
    * @param {number} id - идентификатор элемента
    * @param {ElementOrNone} e - объект события элемента
    */
    dropdown(id: number, e: CustomEvent): void {

        // по id получаем объект трека класса списка треков
        const songObj = this.songs?.getSongElById(id);

        // не обрабатывем событие 
        // если объект трека с таким id не найден
        if (!songObj) return;

        // закрываеи все модальные окна Удаления/добавления трека 
        // если они были открыты
        this.songs?.songObjs.forEach(item => {
            item.dropdownEl?.classList.remove('dropdown--active');
        })
        e.__isClickBtnOpenDropdown = true;

        // открываем необхлдимое модальные окно Удаления/добавления трека
        songObj.dropdownEl?.classList.add('dropdown--active');

    }

    /***
    * Обработчик события нажатия на 
    * кнопку Добавить в плейлист
    * @param {number} id - идентификатор элемента
    * @param {ElementOrNone} e - объект события элемента
    */
    add(id: number, e?: CustomEvent): void {

        // если не открыта страница треков плейлиста
        if (!window.location.pathname.startsWith("/playlist-")) {

            // открываем модальное окно добавления трека в плейлист
            this.renderPlaylistModal(id);
        }

    }

    /***
    * Обработчик клика кнопки удаления трека из плейлиста 
    * @param {number} id - идентификатор элемента
    * @param {ElementOrNone} e - объект события элемента 
    */
    delete(id: number, e?: CustomEvent): void {

        // если открыта страница треков плейлиста
        if (window.location.pathname.startsWith("/playlist-")) {

            // из URL определяем id плейлиста
            const playlistId = Number(window.location.pathname.replace(/.*\D/, ''));

            // открываем модальное окно удаления трека из плейлиста
            this.renderPlaylistModalRemove(id, playlistId);
        }

    }

    /***
    * Обработчик клика кнопки добавления трека в избранное
    * @param {number} id - идентификатор элемента
    * @param {ElementOrNone} e - объект события элемента
    */
    like(id: number, e?: CustomEvent) {

        (async () => {

            // по id получаем с API объект с данными трека
            let song: Song;
            try {
                song = await fetchGetSongsById(getSessionStorage('token'), id);
            } catch (e) {
                console.log(e)
                return
            }

            // определяем текущий статус трека - в избранном или нет ??
            let like = isLikeSong(song, USER.username)

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
            const songEl = this.songs?.getSongElById(id);

            if (songEl?.btnLikeEl && id === songEl?.id) {
                songEl.btnLikeEl.classList.toggle('like-btn--active');
            };

            if (this.player && this.player.btnLikeSongEl && id === this.player?.id) {
                this.player.btnLikeSongEl.classList.toggle('like-btn--active');
            };

            // если открыта страница ибранных треков
            // и трек удален из избранных, перерисовывам страницу
            if (window.location.pathname === "/favorite") {
                const result = await this.router({ name: window.location.pathname, search: '' });

                setURLParams("songId", '');
            }

        })();

    }

    /***
     * Функция роутинга страниц приложения
     * @param {IPage} page - объект с путем и параметрами страницы
     */
    async router(page: IPage): Promise<boolean> {

        // делаем все кнопки навигации неактивными
        this.asaid?.listBtnNavigateObjs.forEach(item => item.unactive());

        // закрываем все модальные окна
        this.playlistModal?.removeElement();
        this.playlistModalRemove?.removeElement();

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
            this.playSongs = songs.filter(({ name }) =>
                name.toLowerCase().includes(searchName.toLowerCase())
            );
            this.playSongsCopy = [...songs];

            // отрисовывам страницу с треками
            await this.renderPageSongs(
                this.playSongs,
                title,
                {
                    add: !selectPlaylist,
                    delete: selectPlaylist
                }
            );

            if (this.shuffle) shuffleArray(this.playSongs);

            if (!selectPlaylist && !selectPageSongsLike) {
                // кнопку навигации Треки делаем активной
                this.asaid?.getById('songs')?.active();
            } else if (selectPageSongsLike) {
                // кнопку навигации Избранное делаем активной
                this.asaid?.getById('favorite')?.active();
            } else {
                // кнопку навигации Плейлист .. делаем активной
                this.asaid?.getById(`playlist-${playlistId}`)?.active();
            }

            // если в URL нет параметра с ID текущего выбранного трека
            if (!songId) {

                // в плеер выводим случайно выбранный трек
                const ranSong = this.getSongRandom(this.playSongs);
                if (ranSong) {
                    this.renderPlayer(ranSong, this.play);
                    setURLParams("songId", String(ranSong.id));
                }

                // иначе в плеер выводим трек с ID из URL параметра
            } else {
                this.renderPlayerById(Number(songId), this.play);
            }


        }

        // переход на страницу Плейлисты
        if (page.name === '/playlists') {
            // удаляем из DOM плеер (футер)
            this.player?.element?.remove();

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
            this.asaid?.getById('playlists')?.active();

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
    async getSongs(isLikes: boolean = false, playlistId?: number): Promise<Songs> {
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
     * @param { add?: boolean,  delete?: boolean } dropdown - объект с настройками отображения всплывающего окна 
     * add 1/0 - отобразить/скрыть кнопку Добавить в плейлист
     * delete 1/0 - отобразить/скрыть кнопку Удалить из плейлиста
     */
    async renderPageSongs(
        songs: Songs,
        title: string,
        dropdown?: {
            add?: boolean,
            delete?: boolean
        }): Promise<Songs> {

        // вызываем функцию очистки контейнера страниц
        this.clearPageContainer()

        // создаем и довавляем контейнер страниц элемент страницы треков
        this.songs = new SongsEl(
            {
                songs: songs,
                username: USER.username,
                title: title,
                dropdown: dropdown,
                handlers: {
                    turn: this.turn.bind(this),
                    dropdown: this.dropdown.bind(this),
                    add: this.add.bind(this),
                    delete: this.delete.bind(this),
                    like: this.like.bind(this)

                }
            }

        );
        append(this.mainEl, this.songs.element);

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
        this.playlists = new PlaylistsEl({
            playlists: playlists,
        });
        append(this.mainEl, this.playlists?.element);
    }

    /**
     * Функция очищает контейнер страниц
     */
    clearPageContainer(): void {
        // очищаем контейнер страниц
        if (this.mainEl instanceof HTMLElement) this.mainEl.innerHTML = '';
    }

    /**
     * Функция отрисовки футера (плеера)
     * @param { Song } song - трек
     */
    renderPlayer(song?: Song, play: boolean = false): void {

        if (!song) return;

        // удаляем старый футер
        this.player?.element?.remove();

        // создаем новый футер с плеером
        this.player = new PlayerEl(
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
        append(this.contentEl, this.player.element);

    }

    /**
     * Функция отрисовки плеера по id плеера
     * @param {number} id - id трека
     */
    renderPlayerById(id: number, play: boolean = false): void {
        // получаем индекс трека в массиве треков
        const song = this.getSongById(this.playSongs, id);

        // отрисовываем плеер с соответствующим треком
        if (song) {
            this.renderPlayer(song, this.play);

            setURLParams("songId", String(id));
        }
    }

    /**
     * Функция отрисовки меню
     */
    renderAsaid() {
        // создаем и довавляем в обертку центальной части контента меню
        this.asaid = new AsaidEl(
            {
                playlists: this.currentPlaylists,
                handlers: {
                    navigate: this.navigate.bind(this),
                }
            }
        );

        append(this.wrapperEl, this.asaid?.element);
    }

    /**
     * Функция отрисовки модального окна добавления трека в плейлист
     * @param {number} songId - id трека
     */
    renderPlaylistModal(songId: number): void {

        this.playlistModal?.removeElement();

        // создаем и довавляем в тело приложения модальное окно добавления трека в плейлист
        this.playlistModal = new PlaylistModalEl({
            playlists: this.currentPlaylists,
            urlDefaulImg: urlDefaultImg,
            songId: songId,
            handlers: {
                addToPlaylistSomg: this.addToPlaylistSong.bind(this),
                addPlaylist: this.addPlaylist.bind(this)
            }
        });

        append(this.bodyEl, this.playlistModal.element);

        this.playlistModal?.show();

    }

    /**
     * Функция отрисовки модального окна удаления трека из плейлиста
     */
    renderPlaylistModalRemove(songId: number, playlistId: number): void {

        this.playlistModalRemove?.removeElement();

        // создаем и довавляем в тело приложения модальное окно удаления трека из плейлиста
        this.playlistModalRemove = new PlaylistModalRemoveEl({
            songId: songId,
            playlistId: playlistId,
            handlers: {
                removeFromPlaylistSong: this.removeFromPlaylistSong.bind(this),
            }
        });

        append(this.bodyEl, this.playlistModalRemove.element);

        this.playlistModalRemove.show();
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
        this.play ? this.play = status : this.play = status;
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
                shuffleArray(this.playSongs);
            } else {
                this.playSongs = [...this.playSongsCopy];
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
            const prevSong = this.getSongNextById(this.playSongs, id, false);
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
            const nextSong = this.getSongNextById(this.playSongs, id);
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
            if (songs[index].id === id) return Number(index);
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

    /**
    * Обработчик события нажатия на кнопку 
    * модального окна добавления трека в плейлист
    * @param {elem} PlaylistModalBtnEl - кнопки модального окна добавления трека в плейлист
    */
    addToPlaylistSong(elem?: PlaylistModalBtnEl, e?: CustomEvent) {
        (async () => {
            if (elem && elem.id && elem.songId) {
                // делаем к API запрос на добавление трека в плейлист
                try {
                    await fetchAddSongToPlaylist(getSessionStorage('token'), elem.id, elem.songId);
                } catch (e) {
                    console.log(e);
                    return;
                }

                // c API обновляем список плейлистов
                try {
                    this.currentPlaylists = await fetchGetUserPlaylists(getSessionStorage('token'));
                } catch (e) {
                    console.log(e);
                    return;
                }

                elem.incSongsCount();
                elem.disable();
            }
        })();
    }

    /**
   * Обработчик события нажатия на кнопку 
   * удаления трека из плейлиста
   */
    removeFromPlaylistSong(elem?: PlaylistModalRemoveEl, e?: CustomEvent) {
        (async () => {

            if (elem && elem.songId && elem.playlistId) {

                // по id получаем объект трека класса списка треков
                const songObj = this.songs?.getSongElById(elem.songId);

                // не обрабатывем событие 
                // если объект трека с таким id не найден
                if (!songObj) return;

                // делаем к API запрос на добавление трека в плейлист
                try {
                    await fetchRemoveSongFromPlaylist(getSessionStorage('token'), elem.playlistId, elem.songId);
                } catch (e) {
                    console.log(e);
                    return;
                }

                // c API обновляем список плейлистов
                try {
                    this.currentPlaylists = await fetchGetUserPlaylists(getSessionStorage('token'));
                } catch (e) {
                    console.log(e);
                    return;
                }

                // обновляем старницу плейлиста
                await this.router({ name: window.location.pathname, search: '' });

                // закрываем модальное окно
                elem.hide();
                elem?.removeElement();
            }

        })();
    }

    /**
     * Обработчик события нажатия на кнопку Добавить плейлист
     * @param {PlaylistModalEl} elem - объект класса модального окна добавления трека в плейлист
     * @param e - объект события
     */
    addPlaylist(elem?: PlaylistModalEl, e?: CustomEvent) {
        (async () => {
            if (elem) {

                let newPlaylist: Playlist | null = null
                // делаем к API запрос на создание нового плейлист
                try {
                    newPlaylist = await fetchCreatePlaylist(getSessionStorage('token'),
                        `Плейлист ${elem.playlistModalBtnObjs.length > 0 ?
                            elem.playlistModalBtnObjs.length + 1 : 1}`
                    );
                } catch (e) {
                    console.log(e);
                    return;
                }

                // c API обновляем список плейлистов
                try {
                    this.currentPlaylists = await fetchGetUserPlaylists(getSessionStorage('token'));
                } catch (e) {
                    console.log(e);
                    return;
                }

                // если запрос успешен добавляем новый элемент кнопки плейлиста в модальное окно
                if (newPlaylist && this.playlistModal) {
                    this.playlistModal.add(
                        new PlaylistModalBtnEl({
                            playlist: newPlaylist,
                            songId: elem.songId,
                            urlDefaulImg: urlDefaultImg,
                            disable: false,
                            handlers: {
                                click: this.addToPlaylistSong.bind(this),
                            }
                        })
                    )
                    this.asaid?.add(new AsaidBtnEl({
                        id: `playlist-${newPlaylist.id}`,
                        title: newPlaylist.name,
                        page: `/playlist-${newPlaylist.id}`,
                        handlers: {
                            navigate: this.navigate.bind(this),
                        }
                    }))
                }
            }
        })()
    }

}

// создание класса приложения
const app = new App();



