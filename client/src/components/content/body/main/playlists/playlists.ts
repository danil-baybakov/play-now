import { BaseElement } from "../../../../base/base";
import { Playlist, Playlists } from "../../../../../api/playlist/apiPlaylist";

import urlImgPlaylist from "../../../../../assets/image/playlists/playlists.jpg";
import urlImgPlaylist360 from "../../../../../assets/image/playlists/playlists__360.jpg";
import urlImgPlaylist1440 from "../../../../../assets/image/playlists/playlists__1440.jpg";

export class ListElementPlaylist extends BaseElement {

    constructor(
      private playlists: Playlists,
    ) {
      super();
    }
  
    getTemplate(): string {
      let htmlPlaylistList: string = '';
      for (const key in this.playlists) {
        htmlPlaylistList += new ElementPlaylist(this.playlists[key]).getTemplate()
      }
      return `
      <section class="playlist section tabs-content" data-target="playlists">
        <h2 class="playlist__h2 visually-hidden">Плейлисты</h2>
        <ul class="playlist__list">
          ${htmlPlaylistList}
        </ul>
      </section>
    `
    }
  
  }


export class ElementPlaylist extends BaseElement {

  constructor(
    private playlist: Playlist
  ) {
    super();
  }

  getTemplate(): string {
    return `
        <li class="playlist__item">
            <picture>
                <source srcset=${urlImgPlaylist360} media="(max-width: 576px)">
                <source srcset=${urlImgPlaylist1440} media="(max-width: 1440px)"><img class="playlist__img"
                    src=${urlImgPlaylist} alt=${this.playlist.name}>
            </picture>
            <div class="playlist__content">
                <h3 class="playlist__h3"><a class="playlist__h3__link" href="/">${this.playlist.name}</a></h3><span
                    class="playlist__count">${this.playlist.songs.length > 0 ? this.playlist.songs.length : "Нет"} треков</span>
            </div>
        </li>
    `; 
  }
}