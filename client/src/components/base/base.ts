import { createElement } from "../../utils/utils";
import { ElementOrNone } from "../../types/types";

export interface CustomEvent extends Event {
    '__isClickBtnOpenDropdown'?: boolean;
}


export abstract class BaseAbstract {

    abstract getTemplate(): void;

    abstract getElement(): void;

    abstract removeElement(): void;

}


export class BaseElement extends BaseAbstract {
    private _element: ElementOrNone = null;
    private _template: string = '';

    constructor() {
        super();
    }

    get element(): ElementOrNone {
        return this._element;
    }

    set element(e: ElementOrNone ) {
        this._element = e;
    }

    get template(): string {
        return this._template;
    }

    set template(t: string ) {
        this._template = t;
    }

    getTemplate(): void {
        this.template = '<div></div>'
    }

    getElement(): void {
        this.getTemplate();
        this.element = createElement(this.template);
    }
    
    removeElement(): void {
        this.element?.remove();
    }

}


// export class Template extends BaseElement {

//     constructor(
//       private var1: string, 
//       private var2: string
//     ) {
//       super();
//     }
  
//     getTemplate(): string {
//       return `
//       `; 
//     }
  
//   }