import { ElementOrNone } from "../types/types";
import { IPage } from "../types/types";

/**
 * Функция для отрисовки (вставки в DOM) компонентов (верстки)
 * @param {HTMLElement} container - контейнер (HTML элемент)
 * @param {string} html - верстка HTML
 * @param {InsertPosition} where - конкретное место в контейнере, куда требуется отрисовать эту вёрстку
 */
export function insertHTML(container: HTMLElement | null, html: string, where: InsertPosition = "afterbegin"): void {
    // если контейнер (DOM элемент) существует
    if (container) {
        // отрисовываем в контейнер верстку
        container.insertAdjacentHTML(where, html)
    }
}

/**
 * Функция позволяет выяснить, сколько полных дней прошло
 * между укаанной датой и текущей датой
 * 
 * @param {string} startDatetimeStr - дата от которой необходимо посчитать количество прошедших дней до сегоднешнего дня
 * @returns {number} - кол-во полных дней прошедших между укаанной датой и текущей датой
 */
export function howManyDays(startDatetimeStr: string): number | null {
    let diffInDays: number = 0;
    // получаем timestamp от заданной даты
    const parseStartDatetimeSecs = Date.parse(startDatetimeStr);
    // выводим null если формат заданной даны некорректен
    if (isNaN(parseStartDatetimeSecs)) return null;
    // получаем timestamp от текущей даты
    const currentDatetimeSecs = new Date().getTime();
    // выводим null если заданная дата больше текущей
    if (currentDatetimeSecs < parseStartDatetimeSecs) return null;

    // вычисляем и выводим сколько полных дней прошло между укаанной датой и текущей датой
    const diffInSecs = currentDatetimeSecs - parseStartDatetimeSecs;
    diffInDays = Math.round(diffInSecs / (1000 * 3600 * 24));
    return diffInDays;
}

/**
 * Функция форматирует число в строку, если в числе меньше двух цифр дополняет начало строки нулями
 * @param {number} num число
 */
export function padTo2Digits(num: number): string {
    return num.toString().padStart(2, '0');
}


/**
 * Функция форматирует миллесекунды в строку формата H:MM:SS
 * @param {number} milliseconds - время в миллисекундах
 * @param {boolean} mode - режим вывода: 0 (по умолчанию) - формат вывода M:SS, 1 - формат вывода H:MM:SS
 */
export function convertMsToTime(milliseconds: number, mode: boolean = false) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    // получаем секунды
    seconds = seconds % 60;
    // получаем минуты
    minutes = minutes % 60;
    // получаем часы
    hours = hours % 24;

    // форматирует и выводим время в формате H:MM:SS
    let result = `${minutes}:${padTo2Digits(seconds,)}`;
    if (mode) {
        result = `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
    }
    return result
}

/**
 * Функция создает DOM-элемент на основе шаблона
 * @param {string} html - верстка
 * @returns { HTMLElement } - DOM элемент
 */
export function createElement(html: string): Element | null {
    // использование тега <template> - снимает ограничения на содержимое – он может содержать любую HTML структуру, включая элементы
    const template = document.createElement('template');
    // помещаем в <template> верстку
    template.innerHTML = html
    // возвращаем DOM элемент
    return template.content.firstElementChild
}


/**
 * Функция добавляем в родительский DOM-элемент дочерний DOM элемент
 * @param {Element | null} root - родительский DOM-элемент
 * @param {ElementOrNone} node - дочерний DOM элемент
 */
export function append(root: Element | null, node: ElementOrNone) {
    if ((node !== null) && (root !== null)) {
        root.append(node);
    }
}

/**
 * Функция сохраняет объект в SessionStorage
 * @param {string} key - ключ
 * @param {any} obj - объект хранения
 */
export function setSessionStorage(key: string, obj: any): void {
    sessionStorage.setItem(key, JSON.stringify(obj))
}

/**
 * Функция получает объект из SessionStorage
 * @param {string} key - ключ
 */
export function getSessionStorage(key: string): any {
    const result_str = sessionStorage.getItem(key);
    if (result_str) {
        try {
            return JSON.parse(result_str);
        } catch {
            return result_str
        }
    }
    return null;
}

/**
 * Функция перемещивает массив алгоритмом Фишера-Йетса
 * @param {Array<T>} array - массив
 */
export function shuffle<T>(array: Array<T>): void {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

/**
 * Функция добавляет в URL новые поисковые параметры
 * @param {string} key - ключ параметра
 * @param {value } value - значение параметра
 * @returns { IPage } - объект с данными обновленного URL
 */
export function setURLParams(key: string, value: string): IPage {

    // создаем объект для формированания строки поисковых параметров
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set(key, value);

    // создаем объект с текущим путем и новыми параметрами страницы
    const iPage: IPage = {
        name: window.location.pathname,
        search: urlSearchParams.toString(),
    }

    // добавляем в путь URL браузера новые поисковые параметры
    window.history.replaceState(null, '', `${iPage.name}?${iPage.search}`)

    // возвращаем объект с данными обновленного URL
    return iPage;
}


/**
 * Функция получает значение параметра из URL по ключу
 * @param {string} key - ключ поискового параметра
 * @param {string} type - 
 * @param {any} default_value - значение по умолчанию возвращаемое если не найден поисковый параметр
 * @returns 
 */
export function getURLParamByKey<T>(key: string, default_value: T, type: string = "str"): any | T {
    // создаем объект для извлечения поисковых параметров
    const paramsFromUrl = new URLSearchParams(window.location.search);

    // возвращаем указанный поисковый параметр если найден
    // в противном случае значение по умолчанию default_value
    
    if (type === 'bool') {
        const value = paramsFromUrl.get(key);
        if (value === '1' || value === 'true' ) {
            return true;
        } else {
            return false;
        }
    }

    if (type === 'str')
        return paramsFromUrl.get(key) || default_value;

    return default_value
}
