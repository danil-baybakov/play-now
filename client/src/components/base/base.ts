import { createElement } from "../../utils/utils";

export abstract class BaseAbstract {

    abstract getTemplate(): string;

    abstract getElement(): void;

    abstract removeElement(): void;

}


export class BaseElement extends BaseAbstract {
    private element: Element | null = null;

    getTemplate(): string {
        return "<div></div>"
    }

    getElement(): Element | string {
        this.element ??= createElement(this.getTemplate());
        if (this.element !== null) return this.element
        return '';
      }
    
    removeElement(): Element | null {
        this.element = null;
        return this.element
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