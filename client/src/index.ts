import './style/style.scss';
import { insertHTML } from './js/utils/utils';
import { Header } from './js/components/content/header/header';
import { Asaid } from './js/components/content/wrap/asaid/asaid';
import { Tracks } from './js/components/content/wrap/view/tracks';
import { Playlists } from './js/components/content/wrap/view/playlists';
import { Footer } from './js/components/content/footer/footer';
import { Modal } from './js/components/modal/modal';

const body: HTMLBodyElement = document.querySelector('body')

insertHTML(body, "afterbegin", Modal())

const content: HTMLDivElement = document.createElement("div");
content.classList.add("over-wrapper");
content.setAttribute('style', 'position: relative; overflow: hidden;');


insertHTML(content, 'afterbegin', Header());
const mainWrapper: HTMLDivElement = document.createElement("div");
mainWrapper.classList.add("content-wrap", "flex")
content.append(mainWrapper);

const main = document.createElement("main");
main.classList.add("main");

insertHTML(mainWrapper, 'afterbegin', Asaid());
mainWrapper.append(main);

insertHTML(main, 'afterbegin', Tracks());
insertHTML(main, 'afterbegin', Playlists());

insertHTML(content, 'afterbegin', Footer());

body.append(content);