import type { Matrix4 } from "./Matrix4";


const buffer4x4 = new Array<number>(16);

export function mult4x4Fast(m1: number[], m2: number[]): number[]
{
    buffer4x4[0] = m2[0] * m1[0] +
                m2[1] * m1[4] +
                m2[2] * m1[8] +
                m2[3] * m1[12];

    buffer4x4[1] = m2[0] * m1[1] +
                m2[1] * m1[5] +
                m2[2] * m1[9] +
                m2[3] * m1[13];

    buffer4x4[2] = m2[0] * m1[2] +
                m2[1] * m1[6] +
                m2[2] * m1[10] +
                m2[3] * m1[14];

    buffer4x4[3] = m2[0] * m1[3];

    buffer4x4[4] = m2[4] * m1[0] +
                m2[5] * m1[4] +
                m2[6] * m1[8];

    buffer4x4[5] = m2[4] * m1[1] +
                m2[5] * m1[5] +
                m2[6] * m1[9] +
                m2[7] * m1[13];

    buffer4x4[6] = m2[4] * m1[2] +
                m2[5] * m1[6] +
                m2[6] * m1[10] +
                m2[7] * m1[14];

    buffer4x4[7] = m2[4] * m1[3];

    buffer4x4[8] = m2[8] * m1[0] +
                m2[9] * m1[4] +
                m2[10] * m1[8];

    buffer4x4[9] = m2[8] * m1[1] +
                m2[9] * m1[5] +
                m2[10] * m1[9] +
                m2[11] * m1[13];

    buffer4x4[10] = m2[8] * m1[2] +
                m2[9] * m1[6] +
                m2[10] * m1[10] +
                m2[11] * m1[14];

    buffer4x4[11] = m2[8] * m1[3];

    buffer4x4[12] = m2[12] * m1[0] +
                m2[13] * m1[4] +
                m2[14] * m1[8];

    buffer4x4[13] = m2[12] * m1[1] +
                m2[13] * m1[5] +
                m2[14] * m1[9] +
                m2[15] * m1[13];

    buffer4x4[14] = m2[12] * m1[2] +
                m2[13] * m1[6] +
                m2[14] * m1[10] +
                m2[15] * m1[14];

    buffer4x4[15] = m2[12] * m1[3];

    return buffer4x4;

}




const buffer3x4 = new Array<number>(12)
export function multiply4x4By3x4(a: number[], b: number[]): number[]
{
    buffer3x4[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6] + a[3] * b[9];
    buffer3x4[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7] + a[3] * b[10];
    buffer3x4[2] = a[0] + a[1] + a[2] + a[3];

    buffer3x4[3] = a[4] * b[0] + a[5] * b[3] + a[6] * b[6] + a[7] * b[9];
    buffer3x4[4] = a[4] * b[1] + a[5] * b[4] + a[6] * b[7] + a[7] * b[10];
    buffer3x4[5] = a[4] + a[5] + a[6]+ a[7];

    buffer3x4[6] = a[8] * b[0] + a[9] * b[3] + a[10] * b[6] + a[11] * b[9];
    buffer3x4[7] = a[8] * b[1] + a[9] * b[4] + a[10] * b[7] + a[11] * b[10];
    buffer3x4[8] = a[8] + a[9] + a[10] + a[11];

    buffer3x4[9]  = a[12] * b[0] + a[13] * b[3] + a[14] * b[6] + a[15] * b[9];
    buffer3x4[10] = a[12] * b[1] + a[13] * b[4] + a[14] * b[7] + a[15] * b[10];
    buffer3x4[11] = a[12] + a[13] + a[14] + a[15];

    return buffer3x4;
}


export function determinant3x3(
    m0: number,
    m1: number,
    m2: number,
    m3: number,
    m4: number,
    m5: number,
    m6: number,
    m7: number,
    m8: number,
): number
{
    return m0 * m4 * m8 + m1 * m5 * m6 + m2 * m3 * m7
         - m2 * m4 * m6 - m1 * m3 * m8 - m0 * m5 * m7;
}
