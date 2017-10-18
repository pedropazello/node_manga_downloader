"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function asNumber(pageNumber) {
    return Number(pageNumber.replace(/\D/g, ""));
}
exports.asNumber = asNumber;
function ljust(text, length, char) {
    let fill = [];
    while (fill.length + text.length < length) {
        fill[fill.length] = char;
    }
    return fill.join('') + text;
}
exports.ljust = ljust;
//# sourceMappingURL=helpers.js.map