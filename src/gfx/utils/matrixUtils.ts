const buffer4x4 = new Array<number>(16);

export function mult4x4Fast(b: number[], a: number[]): number[]
{
    buffer4x4[0] = a[0] * b[0] +
                a[1] * b[4] +
                a[2] * b[8] +
                a[3] * b[12];

    buffer4x4[1] = a[0] * b[1] +
                a[1] * b[5] +
                a[2] * b[9] +
                a[3] * b[13];

    buffer4x4[2] = a[0] * b[2] +
                a[1] * b[6] +
                a[2] * b[10] +
                a[3] * b[14];

    buffer4x4[3] = a[0] * b[3] +
                a[1] * b[7] +
                a[2] * b[11] +
                a[3] * b[15];


    buffer4x4[4] = a[4] * b[0] +
                a[5] * b[4] +
                a[6] * b[8] +
                a[7] * b[12];

    buffer4x4[5] = a[4] * b[1] +
                a[5] * b[5] +
                a[6] * b[9] +
                a[7] * b[13];

    buffer4x4[6] = a[4] * b[2] +
                a[5] * b[6] +
                a[6] * b[10] +
                a[7] * b[14];

    buffer4x4[7] = a[4] * b[3] +
                a[5] * b[7] +
                a[6] * b[11] +
                a[7] * b[15];


    buffer4x4[8] = a[10] * b[8] +
                a[11] * b[12] +
                a[8] * b[0] +
                a[9] * b[4];

    buffer4x4[9] = a[10] * b[9] +
                a[11] * b[13] +
                a[8] * b[1] +
                a[9] * b[5];

    buffer4x4[10] = a[10] * b[10] +
                a[11] * b[14] +
                a[8] * b[2] +
                a[9] * b[6];

    buffer4x4[11] = a[10] * b[11] +
                a[11] * b[15] +
                a[8] * b[3] +
                a[9] * b[7];


    buffer4x4[12] = a[12] * b[0] +
                a[13] * b[4] +
                a[14] * b[8] +
                a[15] * b[12];

    buffer4x4[13] = a[12] * b[1] +
                a[13] * b[5] +
                a[14] * b[9] +
                a[15] * b[13];

    buffer4x4[14] = a[12] * b[2] +
                a[13] * b[6] +
                a[14] * b[10] +
                a[15] * b[14];

    buffer4x4[15] = a[12] * b[3] +
                a[13] * b[7] +
                a[14] * b[11] +
                a[15] * b[15];

    return buffer4x4;
}




const buffer3x4 = new Array<number>(12)
export function multiply4x4By3x4(a: number[], b: number[]): number[]
{
    /**
     * a
     *
     *  0  1  2  3
     *  4  5  6  7
     *  8  9 10 11
     * 12 13 14 15
     */

    /**
     * b
     *
     * 0  1  2
     * 3  4  5
     * 6  7  8
     * 9 10 11
     */
    buffer3x4[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6] + a[3] * b[9];
    buffer3x4[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7] + a[3] * b[10];
    buffer3x4[2] = a[0] + a[1] + a[2] + a[3];

    buffer3x4[3] = a[4] * b[0] + a[5] * b[3] + a[6] * b[6] + a[7] * b[9];
    buffer3x4[4] = a[4] * b[1] + a[5] * b[4] + a[6] * b[7] + a[7] * b[10];
    buffer3x4[5] = a[4] + a[5] + a[6] + a[7];

    buffer3x4[6] = a[8] * b[0] + a[9] * b[3] + a[10] * b[6] + a[11] * b[9];
    buffer3x4[7] = a[8] * b[1] + a[9] * b[4] + a[10] * b[7] + a[11] * b[10];
    buffer3x4[8] = a[8] + a[9] + a[10] + a[11];

    buffer3x4[9]  = a[12] * b[0] + a[13] * b[3] + a[14] * b[6] + a[15] * b[9];
    buffer3x4[10] = a[12] * b[1] + a[13] * b[4] + a[14] * b[7] + a[15] * b[10];
    buffer3x4[11] = a[12] + a[13] + a[14] + a[15];

    return buffer3x4;
}

export function multiply3x4by3x3(a: readonly number[], b: readonly number[]): number[]
{
    buffer3x4[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6];
    buffer3x4[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7];
    buffer3x4[2] = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];

    buffer3x4[3] = a[3] * b[0] + a[4] * b[3] + a[5] * b[6];
    buffer3x4[4] = a[3] * b[1] + a[4] * b[4] + a[5] * b[7];
    buffer3x4[5] = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];

    buffer3x4[6] = a[6] * b[0] + a[7] * b[3] + a[8] * b[6];
    buffer3x4[7] = a[6] * b[1] + a[7] * b[4] + a[8] * b[7];
    buffer3x4[8] = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];

    buffer3x4[9]  = a[9] * b[0] + a[10] * b[3] + a[11] * b[6];
    buffer3x4[10] = a[9] * b[1] + a[10] * b[4] + a[11] * b[7];
    buffer3x4[11] = a[9] * b[2] + a[10] * b[5] + a[11] * b[8];

    return buffer3x4;
}


export function determinant3x3(
    m11: number,
    m12: number,
    m13: number,
    m21: number,
    m22: number,
    m23: number,
    m31: number,
    m32: number,
    m33: number,
): number
{
    return m11 * m22 * m33
        - m11 * m23 * m32
        - m12 * m21 * m33
        + m12 * m23 * m31
        + m13 * m21 * m32
        - m13 * m22 * m31;
}
