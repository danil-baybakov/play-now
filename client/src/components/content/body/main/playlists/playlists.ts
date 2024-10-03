import { BaseElement } from "../../../../base/base";
import { Playlist, Playlists } from "../../../../../api/playlist/apiPlaylist";

import urlImgPlaylist from "../../../../../assets/image/playlists/playlists.jpg";
import urlImgPlaylist360 from "../../../../../assets/image/playlists/playlists__360.jpg";
import urlImgPlaylist1440 from "../../../../../assets/image/playlists/playlists__1440.jpg";

interface PlaylistsProps {
  playlists: Playlists
}

export class ListElementPlaylist extends BaseElement {

    constructor(
      private props: PlaylistsProps,
    ) {
      super();
      this.getElement();
    }
  
    getTemplate(): void {
      let htmlPlaylistList: string = '';
      for (const key in this.props.playlists) {
        const elementPlaylist = new ElementPlaylist(
          {
            playlist: this.props.playlists[key],
          }  
        );
        htmlPlaylistList += elementPlaylist.template;
      }
      this.template = `
      <section class="playlist section" data-target="playlists">
        <h2 class="playlist__h2 visually-hidden">Плейлисты</h2>
        <ul class="playlist__list">
          ${htmlPlaylistList}
        </ul>
      </section>
    `
    }
  
  }

interface PlaylistProps {
  playlist: Playlist,
}

export class ElementPlaylist extends BaseElement {

  constructor(
    private props: PlaylistProps,
  ) {
    super();
    this.getElement();
  }

  getTemplate(): void {
    this.template = `
        <li class="playlist__item">
            <picture>
                <source srcset=${urlImgPlaylist360} media="(max-width: 576px)">
                <source srcset=${urlImgPlaylist1440} media="(max-width: 1440px)"><img class="playlist__img"
                    src=${urlImgPlaylist} alt=${this.props.playlist.name}>
            </picture>
            <div class="playlist__content">
                <h3 class="playlist__h3"><a class="playlist__h3__link" href="/playlist-${this.props.playlist.id}">${this.props.playlist.name}</a></h3><span
                    class="playlist__count">${this.props.playlist.songs.length > 0 ? this.props.playlist.songs.length : "Нет"} треков</span>
            </div>
        </li>
    `; 
  }
}