import './assets/style/style.scss';
// import { insertHTML } from './utils/utils';
import { ElementHeader } from './components/content/header/header';
import { ElementAsaid } from './components/content/body/asaid/asaid';
import { ListElementPlaylist } from './components/content/body/main/playlists/playlists';
import { ListElementSong } from './components/content/body/main/songs/songs';
import { ElementFooter } from './components/content/footer/footer';
import { ElementModalAddPlaylist } from './components/modal/modal';
import { SONGS, PLAYLISTS, USERS } from './mock/data';

const body: HTMLBodyElement | null= document.querySelector('body')

const elementModalAddPlaylist = new ElementModalAddPlaylist(PLAYLISTS).getElement();
if (body) body.append(elementModalAddPlaylist);


const content: HTMLDivElement = document.createElement("div");
content.classList.add("over-wrapper");
content.setAttribute('style', 'position: relative; overflow: hidden;');

const elementHeader = new ElementHeader(USERS[0]).getElement();
content.append(elementHeader);

const mainWrapper: HTMLDivElement = document.createElement("div");
mainWrapper.classList.add("content-wrap", "flex")
content.append(mainWrapper);

const main = document.createElement("main");
main.classList.add("main");

const elementAsaid = new ElementAsaid(PLAYLISTS).getElement();
mainWrapper.append(elementAsaid);
mainWrapper.append(main);

const listElementSong = new ListElementSong(SONGS).getElement();
main.append(listElementSong);

const listElementPlaylist = new ListElementPlaylist(PLAYLISTS).getElement();
main.append(listElementPlaylist);

const elementFooter = new ElementFooter(SONGS[0]).getElement();
content.append(elementFooter);

if (body)  body.append(content);

// const listElementSongContainer = document.querySelector("section.tracks");
// listElementSongContainer?.classList.remove('section--active');

// const listElementPlaylistContainer = document.querySelector("section.playlist");
// listElementPlaylistContainer?.classList.add('section--active');