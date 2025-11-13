import opentype, { type Font } from "opentype.js";


export function getFont(buffer: Uint8Array): Font
{
    const font = opentype.parse(buffer.buffer);
    return font;
}
