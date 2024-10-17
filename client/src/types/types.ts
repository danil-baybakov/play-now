import { number } from "zod";

export type ElementOrNone = Element | null;

export type NavigatePath = {
    path: string,
    data: string | null,
    title: string | null,
  }


export interface IPage {
    name: string;
    search: string;
}

export type HTMLElementOrNone = HTMLElement | null | undefined;
