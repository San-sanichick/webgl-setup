import { Matrix3, Matrix4 } from "threejs-math";
import { Stack } from "./stack";

const coeff = 2 / 3;

class Segment
{
    public x1: number;
    public y1: number;

    public x2: number;
    public y2: number;

    public cx1?: number;
    public cy1?: number;
    public cx2?: number;
    public cy2?: number;

    constructor(
        x1: number, y1: number,
        x2: number, y2: number,
        cx1?: number, cy1?: number,
        cx2?: number, cy2?: number,

    )
    {
        this.x1 = x1;
        this.y1 = y1;

        this.x2 = x2;
        this.y2 = y2;

        this.cx1 = cx1;
        this.cy1 = cy1;

        this.cx2 = cx2;
        this.cy2 = cy2;
    }


    public isLine(): boolean
    {
        return !this.cx1 && !this.cy1 && !this.cx2 && !this.cy2;
    }

    public isCubic(): boolean
    {
        return this.cx1 !== undefined
            && this.cy1 !== undefined
            && this.cx2 !== undefined
            && this.cy2 !== undefined;
    }

    public isQuadratic(): boolean
    {
        return this.cx1 !== undefined
            && this.cy1 !== undefined
            && this.cx2 === undefined
            && this.cy2 === undefined;
    }

    public quadraticToCubic(): void
    {
        console.assert(this.isQuadratic(), "Segment is either not a curve or is cubic already");

        const dx1 = (this.cx1! - this.x1) * coeff;
        const dy1 = (this.cy1! - this.y1) * coeff;

        const dx2 = (this.cx1! - this.x2) * coeff;
        const dy2 = (this.cy1! - this.y2) * coeff;

        this.cx1 = dx1;
        this.cy1 = dy1;
        this.cx2 = dx2;
        this.cy2 = dy2;
    }
}

type VectorGeometryRow = [x: number, y: number, w: 1, k: number, l: number, m: number];

const M3 = new Matrix4();
M3.set(
     1,  0,  0, 0,
    -3,  3,  0, 0,
     3, -6,  3, 0,
    -1,  3, -3, 1,
).transpose();

const MI3 = new Matrix4();
MI3.set(
    1,     0,     0, 0,
    1, 1 / 3,     0, 0,
    1, 2 / 3, 1 / 3, 0,
    1,     1,     1, 1,
).transpose();



enum CubicType
{
    SERPENTINE,
    LOOP,
    CUSP1,
    CUSP2,
    LINE,
}

function getCubicType(d1: number, d2: number, d3: number): CubicType
{
    if (d1 !== 0)
    {
        const eq = (3 * d2 * d2 - 4 * d1 * d3);
        if (eq > 0)
            return CubicType.SERPENTINE;

        if (eq < 0)
            return CubicType.LOOP;

        if (eq === 0)
            return CubicType.CUSP1;
    }

    if (d1 === 0 && d2 !== 0)
        return CubicType.CUSP2;

    return CubicType.LINE;
}


// function multMatrix(
//     m1Rows: number, m1Cols: number, m1: number[],
//     m2Rows: number, m2Cols: number, m2: number[],
// ): number[]
// {
//     const mulRes: number[] = new Array(m1Rows * m2Cols);
//     for (let i = 0; i < mulRes.length; i++) mulRes[i] = 0;
//
//
//     for (let i = 0; i < m1Rows; i++)
//     {
//         for (let j = 0; j < m2Cols; j++)
//         {
//             for (let k = 0; k < m1Cols; k++)
//             {
//                 mulRes[i * m2Cols + j] += (m1[i * m1Cols + k] * m2[k * m2Cols + j]);
//             }
//         }
//     }
//
//     return mulRes;
// }


function multiply4x4By3x4(a: number[], b: number[]): number[]
{
    const c0 = a[0] * b[0] + a[1] * b[3] + a[2] * b[6] + a[3] * b[9];
    const c1 = a[0] * b[1] + a[1] * b[4] + a[2] * b[7] + a[3] * b[10];
    const c2 = a[0] * b[2] + a[1] * b[5] + a[2] * b[8] + a[3] * b[11];

    const c3 = a[4] * b[0] + a[5] * b[3] + a[6] * b[6] + a[7] * b[9];
    const c4 = a[4] * b[1] + a[5] * b[4] + a[6] * b[7] + a[7] * b[10];
    const c5 = a[4] * b[2] + a[5] * b[5] + a[6] * b[8] + a[7] * b[11];

    const c6 = a[8] * b[0] + a[9] * b[3] + a[10] * b[6] + a[11] * b[9];
    const c7 = a[8] * b[1] + a[9] * b[4] + a[10] * b[7] + a[11] * b[10];
    const c8 = a[8] * b[2] + a[9] * b[5] + a[10] * b[8] + a[11] * b[11];

    const c9  = a[12] * b[0] + a[13] * b[3] + a[14] * b[6] + a[15] * b[9];
    const c10 = a[12] * b[1] + a[13] * b[4] + a[14] * b[7] + a[15] * b[10];
    const c11 = a[12] * b[2] + a[13] * b[5] + a[14] * b[8] + a[15] * b[11];
    return [
        c0, c1, c2,
        c3, c4, c5,
        c6, c7, c8,
        c9, c10, c11,
    ];
}

const d1m = new Matrix3();
const d2m = new Matrix3();
const d3m = new Matrix3();
const F = new Matrix4();


export class VectorDataGenerator
{
    private segments: Segment[][];

    private lastPoint: [x: number, y: number] = [0, 0];

    constructor()
    {
        this.segments = [[]];
    }

    public reset(): void
    {
        this.segments = [[]];
    }


    private getLastVector(): Segment[]
    {
        return this.segments.at(-1)!;
    }


    public lineTo(x: number, y: number): this
    {
        this.getLastVector().push(
            new Segment(
                this.lastPoint[0],
                this.lastPoint[1],
                x,
                y,
            )
        );
        this.lastPoint[0] = x;
        this.lastPoint[1] = y;

        return this;
    }

    public moveTo(x: number, y: number): this
    {
        if (this.getLastVector().length !== 0)
        {
            this.segments.push([]);
        }

        this.lastPoint[0] = x;
        this.lastPoint[1] = y;

        return this;
    }

    public quadTo(x: number, y: number, cx: number, cy: number): this
    {
        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            x,
            y,
            cx,
            cy,
        );

        seg.quadraticToCubic();

        this.getLastVector().push(seg);

        this.lastPoint[0] = x;
        this.lastPoint[1] = y;

        return this;
    }

    public cubicTo(x: number, y: number, cx1: number, cy1: number, cx2: number, cy2: number): this
    {
        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            x,
            y,
            cx1,
            cy1,
            cx2,
            cy2,
        );

        this.getLastVector().push(seg);

        this.lastPoint[0] = x;
        this.lastPoint[1] = y;
        return this;
    }

    public close(): this
    {
        const firstSegment = this.getLastVector()[0];
        this.getLastVector().push(
            new Segment(
                this.lastPoint[0],
                this.lastPoint[1],
                firstSegment.x1,
                firstSegment.y1,
            )
        );

        this.segments.push([]);

        return this;
    }


    public buildGeometry(): VectorGeometryRow[][]
    {
        // in the name of TRUE performance this could be
        // a flat array, it's just not very convenient for now
        const rows: VectorGeometryRow[][] = [];

        for (let i = 0; i < this.segments.length; i++)
        {
            const vector = this.segments[i];
            if (vector.length === 0) continue;

            const row: VectorGeometryRow[] = [];

            for (let j = 0; j < vector.length; j++)
            {
                const segment = vector[j];

                if (segment.isLine())
                {
                    if (j === 0)
                    {
                        row.push([segment.x1, segment.y1, 1, 0.5, 0.5, 0.5]);
                    }

                    row.push([segment.x2, segment.y2, 1, 0.5, 0.5, 0.5]);

                    continue;
                }


                if (segment.isCubic())
                {
                    // NOTE: I am going to inline fucking EVERYTHING,
                    // because performance

                    // clean code bad
                    // --- get power basis
                    const B = [
                        segment.x1  , segment.y1  , 1,
                        segment.cx1!, segment.cy1!, 1,
                        segment.cx2!, segment.cy2!, 1,
                        segment.x2  , segment.y2  , 1,
                    ];

                    const out = multiply4x4By3x4(M3.elements, B);

                    const x1 = out[0];
                    const y1 = out[1];
                    const w1 = out[2];

                    const x2 = out[3];
                    const y2 = out[4];
                    const w2 = out[5];

                    const x3 = out[6];
                    const y3 = out[7];
                    const w3 = out[8];

                    const x4 = out[9];
                    const y4 = out[10];
                    const w4 = out[11];
                    // ---

                    // --- calc determinants
                    d1m.set(
                        x4, y4, w4,
                        x3, y3, w3,
                        x1, y1, w1,
                    );

                    d2m.set(
                        x4, y4, w4,
                        x2, y2, w2,
                        x1, y1, w1,
                    );
                    d3m.set(
                        x3, y3, w3,
                        x2, y2, w2,
                        x1, y1, w1,
                    );

                    const d1 = -d1m.determinant();
                    const d2 =  d2m.determinant();
                    const d3 = -d3m.determinant();
                    // ---

                    // get curve type
                    const curveType = getCubicType(d1, d2, d3);


                    // --- calculate F
                    switch(curveType)
                    {
                        case CubicType.CUSP1:
                        case CubicType.SERPENTINE:
                        {
                            const sqrt13 = 1 / Math.sqrt(3);
                            const sqrt = Math.sqrt(3 * d2 * d2 - 4 * d1 * d3);

                            let tl = d2 + (sqrt13 * sqrt);
                            let sl = 2 * d1;
                            const l1 = Math.sqrt(tl * tl + sl * sl);
                            tl /= l1;
                            sl /= l1;

                            let tm = d2 - (sqrt13 * sqrt);
                            let sm = 2 * d1;
                            const l2 = Math.sqrt(tm * tm + sm * sm);
                            tm /= l2;
                            sm /= l2;

                            const m00 = tl * tm;
                            const m01 = tl * tl * tl;
                            const m02 = tm * tm * tm;
                            const m10 = -sm * tl - sl * tm;
                            const m11 = -3 * sl * tl * tl;
                            const m12 = -3 * sm * tm * tm;
                            const m20 = sl * sm;
                            const m21 = 3 * sl * sl * tl;
                            const m22 = 3 * sm * sm * tm;
                            const m31 = -sl * sl * sl;
                            const m32 = -sm * sm * sm;

                            F.set(
                                m00, m01, m02, 1,
                                m10, m11, m12, 0,
                                m20, m21, m22, 0,
                                  0, m31, m32, 0,
                            );

                            break;
                        }
                        case CubicType.LOOP:
                        {
                            const sqrt13 = 1 / Math.sqrt(3);
                            const sqrt = Math.sqrt(4 * d1 * d3 - 3 * d2 * d2);

                            let td = d2 + sqrt13 * sqrt;
                            let sd = 2 * d1;
                            const l1 = Math.sqrt(td * td + sd * sd);
                            td /= l1;
                            sd /= l1;

                            let te = d2 - sqrt13 * sqrt;
                            let se = 2 * d1;
                            const l2 = Math.sqrt(te * te + se * se);
                            te /= l2;
                            se /= l2;

                            const m00 = td * te;
                            const m01 = td * td * te;
                            const m02 = td * te * te;
                            const m10 = -se * td - sd * te;
                            const m11 = -se * td * td - 2 * sd * te * td;
                            const m12 = -sd * te * te - 2 * se * td * te;
                            const m20 = sd * se;
                            const m21 = te * sd * sd + 2 * se * td * sd;
                            const m22 = td * se * se + 2 * sd * te * se;
                            const m31 = -sd * sd * se;
                            const m32 = -sd * se * se;

                            F.set(
                                m00, m01, m02, 1,
                                m10, m11, m12, 0,
                                m20, m21, m22, 0,
                                  0, m31, m32, 0,
                            );

                            break;
                        }
                        case CubicType.CUSP2:
                        {
                            let tl = d3;
                            let sl = 3 * d2;
                            const l = Math.sqrt(tl * tl + sl * sl);
                            tl /= l;
                            sl /= l;

                            const m00 = tl;
                            const m01 = tl * tl * tl;
                            const m10 = -sl;
                            const m11 = -3 * sl * tl * tl;
                            const m21 = 3 * sl * sl * tl;
                            const m31 = -sl * sl * sl;

                            F.set(
                                m00, m01, 1, 1,
                                m10, m11, 0, 0,
                                  0, m21, 0, 0,
                                  0, m31, 0, 0,
                            );

                            break;
                        }
                        case CubicType.LINE:
                        {
                            F.set(
                                0, 0, 0, 0,
                                0, 0, 0, 0,
                                0, 0, 0, 0,
                                0, 0, 0, 0,
                            );

                            break;
                        }
                    }
                    // ---

                    // --- calculate MI3 * F and get k, l and m
                    // FIXME: replace this with a non-allocating multiplication
                    const res = MI3.clone().multiply(F);
                    const k1 = res.elements[0];
                    const l1 = res.elements[1];
                    const m1 = res.elements[2];

                    const k2 = res.elements[4];
                    const l2 = res.elements[5];
                    const m2 = res.elements[6];

                    const k3 = res.elements[8];
                    const l3 = res.elements[9];
                    const m3 = res.elements[10];

                    const k4 = res.elements[12];
                    const l4 = res.elements[13];
                    const m4 = res.elements[14];

                    if (j === 0)
                    {
                        row.push([segment.x1, segment.y1, 1, k1, l1, m1]);
                    }

                    row.push([segment.cx1!, segment.cy1!, 1, k2, l2, m2]);
                    row.push([segment.cx2!, segment.cy2!, 1, k3, l3, m3]);
                    row.push([segment.x2,   segment.y2,   1, k4, l4, m4]);
                    // ---

                    continue;
                }
            }

            rows.push(row);
        }

        return rows;
    }
}



export function generateVectorGeometryFromData(data: VectorGeometryRow[][]): [vertices: number[], len: number]
{
    const stack1 = new Stack<VectorGeometryRow>(data.length);
    const stack2 = new Stack<VectorGeometryRow>(data.length);
    const vertices = new Array<number>();


    // Why isn't this working?
    // Is something missing?
    // Must more blood be shed?
    let j = 0;
    // const top = data[0][0];
    for (let i = 0; i < data.length; i++)
    {
        stack1.takeOverFromArray(data[i].toReversed());

        const top = stack1.pop()!;
        // if (i === 0) stack1.pop();

        // length - 2 because lmao
        // const vertices = new Array<number>((data.length - 2) * (top.length - 1) * 3);

        while (!stack1.isEmpty())
        {
            stack2.push(stack1.pop()!);

            // HACK: this also fixes the problem that the first
            // and the last point are present twice in the array
            if (stack1.peek() === null) break;

            const p2 = stack2.peek()!;
            const p3 = stack1.peek()!;

            if (p2[0] === top[0] && p2[1] === top[1]) continue;
            if (p3[0] === top[0] && p3[1] === top[1]) continue;

            vertices[j    ] = top[0];
            vertices[j + 1] = top[1];
            vertices[j + 2] = top[3];
            vertices[j + 3] = top[4];
            vertices[j + 4] = top[5];

            vertices[j + 5] = p2[0];
            vertices[j + 6] = p2[1];
            vertices[j + 7] = p2[3];
            vertices[j + 8] = p2[4];
            vertices[j + 9] = p2[5];

            vertices[j + 10] = p3[0];
            vertices[j + 11] = p3[1];
            vertices[j + 12] = p3[3];
            vertices[j + 13] = p3[4];
            vertices[j + 14] = p3[5];

            j += (top.length - 1) * 3;
        }

        stack1.clear();
        stack2.clear();
    }

    return [vertices, vertices.length / 5];
}
