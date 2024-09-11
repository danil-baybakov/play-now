import { createElement } from "../../utils/utils";
import { CustomElement } from "../../types/types";

export interface CustomEvent extends Event {
    '__isClick'?: boolean;
}


export abstract class BaseAbstract {

    abstract getTemplate(): void;

    abstract getElement(): void;

    abstract removeElement(): void;

}


export class BaseElement extends BaseAbstract {
    private _element: CustomElement = null;
    private _template: string = '';

    constructor() {
        super();
    }

    get element(): CustomElement {
        return this._element;
    }

    set element(e: CustomElement ) {
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
        this.element = null;
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