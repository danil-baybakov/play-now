import { BaseElement } from "../base/base";
import { Playlist, Playlists } from "../../api/playlist/apiPlaylist";

import urlImgPlaylist360 from "../../assets/image/playlists/playlists.jpg";


export class ElementModalAddPlaylist extends BaseElement {

    constructor(
      private playlists: Playlists, 
    ) {
      super();
      this.getElement();
    }
  
    getTemplate(): string {
      let htmlModalBthAddPlaylists: string = '';
        for (const key in this.playlists) {
          const elementModalBthAddPlaylist = new ElementModalBthAddPlaylist(this.playlists[key]);
          htmlModalBthAddPlaylists += elementModalBthAddPlaylist.template;
        }
      return `
          <div class="playlists-modal">
            <div class="playlists-modal__title">
                Добавить в плейлист
            </div>
            <div class="playlists-modal__playlist_content">
                ${htmlModalBthAddPlaylists}
            </div>
            <div class="playlists-modal__footer">
                <div class="playlists-modal__close-btn">
                    Отменить
                </div>
            </div>
        </div>
      `; 
    }
  
  }


export class ElementModalBthAddPlaylist extends BaseElement {

    constructor(
      private playlist: Playlist, 
    ) {
      super();
      this.getElement();
    }
  
    getTemplate(): void {
      this.template = `
            <div class="playlists-modal__playlist">
                <img src=${urlImgPlaylist360} alt=${this.playlist.name} class="playlists-modal__playlist__image" />
                <div class="playlists-modal__playlist__title">${this.playlist.name}</div>
                <div class="playlists-modal__playlist__info">${this.playlist.songs.length > 0 ? this.playlist.songs.length : "Нет"} треков</div>
            </div>
      `; 
    }
  
  }