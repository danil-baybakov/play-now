import { CustomElement } from "../types/types";

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

  export function append(root: Element | null, node: CustomElement) {
    if ((node !== null) && (root !== null)) {
      root.append(node);
    }
  }