
export function insertHTML(container: HTMLElement, where: InsertPosition, html: string): void {
    container.insertAdjacentHTML(where, html)
}