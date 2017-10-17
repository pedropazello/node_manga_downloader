export function asNumber(pageNumber: string): number {
    return Number(pageNumber.replace(/\D/g, ""));
}