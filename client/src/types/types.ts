export type CustomElement = Element | null;

export type NavigatePath = {
    path: string,
    data: string | null,
    title: string | null,
  }


export interface IPage {
    name: string;
    search: string;
}
