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

const body: HTMLBodyElement | null= document.querySelector('body')

const elementModalAddPlaylist = new ElementModalAddPlaylist(PLAYLISTS).element;
append(body, elementModalAddPlaylist);


const content: HTMLDivElement = document.createElement("div");
content.classList.add("over-wrapper");
content.setAttribute('style', 'position: relative; overflow: hidden;');
append(body, content);

const elementHeader = new ElementHeader(USERS[0]).element;
append(content, elementHeader);

const mainWrapper: HTMLDivElement = document.createElement("div");
mainWrapper.classList.add("content-wrap", "flex")
content.append(mainWrapper);

const elementAsaid = new ElementAsaid(PLAYLISTS).element;
append(mainWrapper, elementAsaid);

const main = document.createElement("main");
main.classList.add("main");
mainWrapper.append(main);

const openDropdown = (id: number, e: CustomEvent): void => {
    e.__isClick = true;
    const dropdown = document.querySelector(`[data-num_track_dropdown="${id}"]`)
    dropdown?.classList.add('dropdown--active');
}

const addSong = (id: number, e: CustomEvent): void => {
    console.log(id + ' - addSong');
}

const deleteSong = (id: number, e: CustomEvent): void => {
    console.log(id + ' - deleteSong');

}
const likeSong = (id: number, e: CustomEvent): void => {
    console.log(id + ' - likeSong');
}

const listElementSong = new ListElementSong(
    SONGS, 
    openDropdown, 
    addSong, 
    deleteSong,
    likeSong
).element;

append(main, listElementSong);

const listElementPlaylist = new ListElementPlaylist(PLAYLISTS).element;
append(main, listElementPlaylist);

const elementFooter = new ElementFooter(SONGS[0]).element;
append(content, elementFooter);



// const listElementSongContainer = document.querySelector("section.tracks");
// const elem = listElementSongContainer?.querySelector('.tracks__item');
// elem?.addEventListener('click', () => console.log('elem'));

// const listElementPlaylistContainer = document.querySelector("section.playlist");
// listElementPlaylistContainer?.classList.add('section--active');
