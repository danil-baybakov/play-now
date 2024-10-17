import { BaseElement } from "../../../base/base";
import { Playlists, Playlist } from "../../../../api/playlist/apiPlaylist";
import { CustomEvent } from "../../../base/base";
import { IPage } from "../../../../types/types";
import { HTMLElementOrNone } from "../../../../types/types";
import { template_svg_songs, template_svg_playlists } from "../../../../utils/template_svg";
import { append } from "../../../../utils/utils";



interface AsaidElProps {
	playlists?: Playlists,
	handlers?: {
		navigate?: (page: string, elem?: AsaidBtnEl) => void
	}
}

/**
 * Класс для создания меню навигации
 */
export class AsaidEl extends BaseElement {

	listBtnNavigateObjs: AsaidBtnEl[] = []; // список объктов кнопок навигации 

	// DOM элементы
	asiadListEl: HTMLElementOrNone = null; // контейнер списка кнопок навигации

	constructor(
		private props: AsaidElProps,
	) {
		super();
		this.init();
	}

	/**
	* Метод инициалиации класса
	*/
	private init() {
		// формируем DOM-элемент класса
		this.getElement();

		// в свойства класса добавляем элементы
        // контейнер списка кнопок перехода на страницу
		this.asiadListEl = this.element?.querySelector('.aside__list');

		// создание списка кнопок навигации
		this.create();

		// вешаем обработчики событий на все элементы
		this.setEventListenner();

	}

    /**
     * Метод создает шаблон HTML разметки DOM элемента класса
    */
	getTemplate(): void {

		this.template = `
            <aside class="aside">
                <h2 class="aside__h2 visually-hidden">Левая панель навигации</h2>
                <nav class="aside__nav">
                    <button class="search__btn-open">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                              d="M9.5 18C14.1944 18 18 14.1944 18 9.5C18 4.80558 14.1944 1 9.5 1C4.80558 1 1 4.80558 1 9.5C1 14.1944 4.80558 18 9.5 18Z"
                              stroke="#AAAAAA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M18.9999 19L15.5 15.5001" stroke="#AAAAAA" stroke-width="2" stroke-linecap="round"
                              stroke-linejoin="round" />
                      </svg>
                    </button>
                    <ul class="aside__list">      
               		</ul>
            </nav>
        </aside>
      `;
	}

	/**
	 * Метод вставляет в меню новую кнопку навигации
	 * @param {AsaidBtnEl} newBtnNavigate - новая кнопка навигации
	 * @param {string} id - id существующей кнопки, если указан вставка будет после этой кнопки
	 * 
	 */
	add(newBtnNavigate: AsaidBtnEl, id?: string): void {
		if (this.asiadListEl && newBtnNavigate) {
            this.listBtnNavigateObjs.push(newBtnNavigate);
			if (id === undefined) {
				append(this.asiadListEl, newBtnNavigate.element);
			} else {
				const btnNavigate = this.listBtnNavigateObjs.find(item => item.id === id);
				if (btnNavigate) {
					append(btnNavigate.element, newBtnNavigate.element, 'after')
				}
			}
            	
        }
	}

	/**
	 * Метод создания списка кнопок навигации
	 */
	private create() {
		// добавляем кнопку навигации Треки
		this.add(new AsaidBtnEl({
			id: 'songs',
			title: 'Треки',
			page: '/',
			active: true,
			iconTemplateSvg: template_svg_songs,
			handlers: {
				navigate: this.props.handlers?.navigate,
			}
		}));
		// добавляем кнопку навигации Плейлисты
		this.add(new AsaidBtnEl({
			id: 'playlists',
			title: 'Плейлисты',
			page: '/playlists',
			iconTemplateSvg: template_svg_playlists,
			handlers: {
				navigate: this.props.handlers?.navigate,
			}
		}));
		// добавляем кнопку навигации Избранное
		this.add(new AsaidBtnEl({
			id: 'favorite',
			title: 'Избранное',
			page: '/favorite',
			handlers: {
				navigate: this.props.handlers?.navigate,
			}
		}));
		// добавляем кнопку навигации по плейлистам
        if (this.props.playlists && this.props.playlists.length > 0) {
            this.props.playlists.forEach(playlist => {
                const btnNavigatePlaylist = new AsaidBtnEl({
					id: `playlist-${playlist.id}`,
					title: playlist.name,
					page: `/playlist-${playlist.id}`,
					handlers: {
						navigate: this.props.handlers?.navigate,
					}
                })
                this.add(btnNavigatePlaylist);
            })
        };
	
    }

	/**
	 * Метод по id выдает объект кнопки
	 * @param {string} id - id кнопки
	 * @returns 
	 */
	getById(id: string): AsaidBtnEl | undefined {
		return this.listBtnNavigateObjs.find(item => item.id === id);
	}
	
	/**
	 *  Метод удаляет кнопку навигации из меню по id  
	 * @param {string} id - id кнопки
	 */
	deleteById(id: string): void {
		const btnNavigate = this.listBtnNavigateObjs.find(item => item.id === id);
		if (btnNavigate) {
			btnNavigate.removeElement();
		}
	}

	/**
     * Метод вешает обработчики событий на все элементы
     */
	setEventListenner() {}

}

interface AsaidBtnElProps {
	id?: string,
	title: string,
	page: string,
	active?: boolean,
	iconTemplateSvg?: string, 
	handlers?: {
		navigate?: (page: string, elem?: AsaidBtnEl) => void
	}
}

/**
 * Класс для создания в меню кнопок навигации
 */
export class AsaidBtnEl extends BaseElement {

	id?: string; // идентификатор элемента

	// DOM элементы
	btnNavigateEl: HTMLElementOrNone = null; // кнопка навигации

	constructor(
		private props: AsaidBtnElProps,
	) {
		super();
		this.init();
	}

	/**
	* Метод инициалиации класса
	*/
	private init() {

		// идентификатор элемента
		this.id = this.props.id || '';
		
		// формируем DOM-элемент класса
		this.getElement();

		// в свойства класса добавляем элементы
        // кнопка навигации
        this.btnNavigateEl = this.element?.querySelector('.aside__btn');

		// вешаем обработчики событий на все элементы
		this.setEventListenner();

	}

    /**
     * Метод создает шаблон HTML разметки DOM элемента класса
    */
	getTemplate(): void {
		this.template = `                   
        <li class="aside__item">
            <button class="aside__btn ${this.props.active ? "aside__btn-active" : ""}" data-path=${this.props.page}>
				${this.props.iconTemplateSvg || ''}
				<span class="aside__btn__text">
					${this.props.title}
				</span>
			</button>
        </li>
      `;
	}

	/**
	 * Метод делает отображение кнопки навигации - неактивной
	 */
	unactive() {
		this.btnNavigateEl?.classList.remove('aside__btn-active');
	}

	/**
	 * Метод делает отображение кнопки навигации - активной
	 */
	active() {
		this.btnNavigateEl?.classList.add('aside__btn-active');
	}

	/**
     * Метод вешает обработчики событий на все элементы
     */
	private setEventListenner() { 

		// обработка события нажатия на кнопку перехода
		this.btnNavigateEl?.addEventListener('click', (e: CustomEvent) => {
			e.preventDefault();
			if (this.props.handlers?.navigate) this.props.handlers.navigate(this.props.page, this);
		});

	}

}