export function asNumber(pageNumber: string): number {
    return Number(pageNumber.replace(/\D/g, ""));
}

export function ljust (text: string, length: number, char: string): string {
    let fill = [];
    while ( fill.length + text.length < length ) {
      fill[fill.length] = char;
    }
    return fill.join('') + text;
}