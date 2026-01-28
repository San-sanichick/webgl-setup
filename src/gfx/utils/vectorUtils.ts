const buffer: [number, number, number] = [0, 0, 0];


export function dot(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
): number
{
    return x1 * x2 + y1 * y2 + z1 * z2;
}


export function cross(
    a1: number,
    a2: number,
    a3: number,
    b1: number,
    b2: number,
    b3: number,
): [number, number, number]
{
    buffer[0] = a2 * b3 - a3 * b2;
    buffer[1] = a3 * b1 - a1 * b3;
    buffer[2] = a1 * b2 - a2 * b1;

    return buffer;
}
