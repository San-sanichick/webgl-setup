import { determinant3x3 } from "./matrixUtils";

const THIRD = 1 / 3;
const QUAD_K2 = THIRD;
const QUAD_K3 = 2 / 3;
const QUAD_L3 = THIRD;
const CURVE_CONVERSION_COEFF = 2 / 3;
const EPSILON = 0.5e-11;
const BIG_EPSILON = 1e-5;


function boundsCheck(val: number, start: number, end: number): boolean
{
    return val >= BIG_EPSILON && (end - val) >= BIG_EPSILON && val > start && val < end;
}

type VectorGeometryRow = [x: number, y: number, k: number, l: number, m: number];

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

    public lengthSqr(): number
    {
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        return dx * dx + dy * dy;
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

        const dx1 = (this.cx1! - this.x1) * CURVE_CONVERSION_COEFF;
        const dy1 = (this.cy1! - this.y1) * CURVE_CONVERSION_COEFF;

        const dx2 = (this.cx1! - this.x2) * CURVE_CONVERSION_COEFF;
        const dy2 = (this.cy1! - this.y2) * CURVE_CONVERSION_COEFF;

        this.cx1 = this.x1 + dx1;
        this.cy1 = this.y1 + dy1;
        this.cx2 = this.x2 + dx2;
        this.cy2 = this.y2 + dy2;
    }
}


enum CubicType
{
    SERPENTINE,
    LOOP,
    CUSP,
    LINE,
    POINT,
    QUADRATIC,
}

let M = new Array<number>(12);
const O = Object.freeze([
    -1,  0, 0,
     0, -1, 0,
     0,  0, 1,
]);


export class VectorDataGenerator
{
    private segments: Segment[][];
    private lastPoint: [x: number, y: number];



    constructor()
    {
        this.segments = [[]];
        this.lastPoint = [0, 0];
    }

    public reset(): void
    {
        this.segments = [[]];
        this.lastPoint = [0, 0];
    }



    private getLastVector(): Segment[]
    {
        return this.segments.at(-1)!;
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

    public moveToRelative(dx: number, dy: number): this
    {
        if (this.getLastVector().length !== 0)
        {
            this.segments.push([]);
        }

        this.lastPoint[0] += dx;
        this.lastPoint[1] += dy;

        return this;
    }



    public lineTo(x: number, y: number): this
    {
        if (this.lastPoint[0] === x && this.lastPoint[1] === y)
        {
            return this;
        }

        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            x,
            y,
        );

        this.getLastVector().push(seg);

        this.lastPoint[0] = x;
        this.lastPoint[1] = y;

        return this;
    }

    public lineToRelative(dx: number, dy: number): this
    {
        const x2 = this.lastPoint[0] + dx;
        const y2 = this.lastPoint[1] + dy;
        if (
            this.lastPoint[0] === x2 &&
            this.lastPoint[1] === y2
        )
        {
            return this;
        }

        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            x2,
            y2,
        );
        this.getLastVector().push(seg);

        this.lastPoint[0] = x2;
        this.lastPoint[1] = y2;

        return this;
    }

    public horizontalTo(x: number): this
    {
        if (this.lastPoint[0] === x)
        {
            return this;
        }

        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            x,
            this.lastPoint[1],
        );

        this.getLastVector().push(seg);

        this.lastPoint[0] = x;

        return this;
    }

    public horizontalToRelative(dx: number): this
    {
        const x2 = this.lastPoint[0] + dx;
        if (this.lastPoint[0] === x2)
        {
            return this;
        }
        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            x2,
            this.lastPoint[1],
        );

        this.getLastVector().push(seg);

        this.lastPoint[0] = x2;

        return this;
    }

    public verticalTo(y: number): this
    {
        if (this.lastPoint[1] === y)
        {
            return this;
        }

        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            this.lastPoint[0],
            y,
        );

        this.getLastVector().push(seg);

        this.lastPoint[1] = y;

        return this;
    }

    public vertivalToRelative(dy: number): this
    {
        const y2 = this.lastPoint[1] + dy;
        if (this.lastPoint[1] === y2)
        {
            return this;
        }

        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            this.lastPoint[0],
            y2,
        );

        this.getLastVector().push(seg);

        this.lastPoint[1] = y2;

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

    public quadToRelative(dx: number, dy: number, cdx: number, cdy: number): this
    {
        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            this.lastPoint[0] + dx,
            this.lastPoint[1] + dy,
            this.lastPoint[0] + cdx,
            this.lastPoint[1] + cdy,
        );

        seg.quadraticToCubic();

        this.getLastVector().push(seg);

        this.lastPoint[0] += dx;
        this.lastPoint[1] += dy;

        return this;
    }

    public tQuadTo(x: number, y: number): this
    {
        const prev = this.getLastVector().at(-1);
        let cx = this.lastPoint[0];
        let cy = this.lastPoint[1];
        if (prev && prev.isQuadratic())
        {
            cx = 2 * this.lastPoint[0] - prev.cx1!;
            cy = 2 * this.lastPoint[1] - prev.cy1!;
        }

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

    public tQuadToRelative(dx: number, dy: number): this
    {
        const prev = this.getLastVector().at(-1);
        let cx = this.lastPoint[0];
        let cy = this.lastPoint[1];
        if (prev && prev.isQuadratic())
        {
            cx = 2 * this.lastPoint[0] - prev.cx1!;
            cy = 2 * this.lastPoint[1] - prev.cy1!;
        }

        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            this.lastPoint[0] + dx,
            this.lastPoint[1] + dy,
            cx,
            cy,
        );

        seg.quadraticToCubic();

        this.getLastVector().push(seg);

        this.lastPoint[0] += dx;
        this.lastPoint[1] += dy;

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

    public cubicToRelative(
        dx: number,
        dy: number,
        cdx1: number,
        cdy1: number,
        cdx2: number,
        cdy2: number,
    ): this
    {
        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            this.lastPoint[0] + dx,
            this.lastPoint[1] + dy,
            this.lastPoint[0] + cdx1,
            this.lastPoint[1] + cdy1,
            this.lastPoint[0] + cdx2,
            this.lastPoint[1] + cdy2,
        );

        this.getLastVector().push(seg);

        this.lastPoint[0] += dx;
        this.lastPoint[1] += dy;
        return this;
    }


    public sCubicTo(x: number, y: number, cx2: number, cy2: number): this
    {
        const prev = this.getLastVector().at(-1);
        let cx1 = this.lastPoint[0];
        let cy1 = this.lastPoint[1];
        if (prev && prev.isCubic())
        {
            cx1 = 2 * this.lastPoint[0] - prev.cx2!;
            cy1 = 2 * this.lastPoint[1] - prev.cy2!;
        }


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

    public sCubicToRelative(
        dx: number,
        dy: number,
        cdx2: number,
        cdy2: number,
    ): this
    {
        const prev = this.getLastVector().at(-1);
        let cx1 = this.lastPoint[0];
        let cy1 = this.lastPoint[1];
        if (prev && prev.isCubic())
        {
            cx1 = 2 * this.lastPoint[0] - prev.cx2!;
            cy1 = 2 * this.lastPoint[1] - prev.cy2!;
        }


        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            this.lastPoint[0] + dx,
            this.lastPoint[1] + dy,
            cx1,
            cy1,
            this.lastPoint[0] + cdx2,
            this.lastPoint[1] + cdy2,
        );

        this.getLastVector().push(seg);

        this.lastPoint[0] += dx;
        this.lastPoint[1] += dy;
        return this;
    }


    public close(): this
    {
        const firstSegment = this.getLastVector()[0];
        const seg = new Segment(
            this.lastPoint[0],
            this.lastPoint[1],
            firstSegment.x1,
            firstSegment.y1,
        );

        this.getLastVector().push(seg);

        this.segments.push([]);
        this.lastPoint[0] = firstSegment.x1;
        this.lastPoint[1] = firstSegment.y1;

        return this;
    }



    private static getCubicType(d1: number, d2: number, d3: number): CubicType
    {
        const D = 3 * d2 * d2 - 4 * d1 * d3;
        const discr = d1 * d1 * D;
        console.log("discr", discr);

        // if (discr === 0)
        // {
        //     if (d1 === 0 && d2 === 0)
        //     {
        //         if (d3 === 0)
        //         {
        //             CubicType.LINE;
        //         }
        //
        //         return CubicType.QUADRATIC;
        //     }
        //
        //     if (d1 !== 0)
        //     {
        //         return CubicType.CUSP;
        //     }
        //
        //     if (D < 0)
        //     {
        //         return CubicType.LOOP;
        //     }
        //
        //     return CubicType.SERPENTINE;
        // }
        //
        // if (discr > 0) return CubicType.SERPENTINE;
        //
        // return CubicType.LOOP;


        if (
            Math.abs(d1) <= EPSILON &&
            Math.abs(d2) <= EPSILON &&
            Math.abs(d3) <= EPSILON
        )
        {
            return CubicType.LINE;
        }

        if (Math.abs(d1) <= EPSILON && Math.abs(d2) <= EPSILON)
        {
            return CubicType.QUADRATIC;
        }

        if (Math.abs(discr) <= EPSILON)
        {
            if (Math.abs(d1) <= EPSILON)
                return CubicType.CUSP;

            return CubicType.SERPENTINE;
        }
        else
        {
            if (discr > 0)
                return CubicType.SERPENTINE;

            if (discr < 0)
                return CubicType.LOOP;
        }

        return CubicType.POINT;
    }

    private static subdivideCurve(
        t: number,
        x1: number, y1: number,
        cx1: number, cy1: number,
        cx2: number, cy2: number,
        x2: number, y2: number,
    ): [Segment, Segment]
    {
        const diff = 1 - t;

        const Lx = diff * x1 + t * cx1;
        const Ly = diff * y1 + t * cy1;

        const Mx = diff * cx1 + t * cx2;
        const My = diff * cy1 + t * cy2;

        const Nx = diff * cx2 + t * x2;
        const Ny = diff * cy2 + t * y2;

        const Px = diff * Lx + t * Mx;
        const Py = diff * Ly + t * My;

        const Qx = diff * Mx + t * Nx;
        const Qy = diff * My + t * Ny;

        const Rx = diff * Px + t * Qx;
        const Ry = diff * Py + t * Qy;

        const seg1 = new Segment(x1, y1, Rx, Ry, Lx, Ly, Px, Py);
        const seg2 = new Segment(Rx, Ry, x2, y2, Qx, Qy, Nx, Ny);
        return [
            seg1,
            seg2,
        ];
    }


    private static computeHessian(t: number, s: number, d1: number, d2: number, d3: number): number
    {
        return 36 * ((d3 * d1 - d2 * d2) * s * s + d1 * d2 * s * t - d1 * d1 * t * t);
    }


    private subdivideSegment(
        segment: Segment,
        segmentIndex: number,

        vector: Segment[],
        vectorIndex: number,

        ratio1: number,
        ratio2: number,
    ): boolean
    {
        if (boundsCheck(ratio1, 0, 1))
        {
            const segments = VectorDataGenerator.subdivideCurve(
                ratio1,
                segment.x1, segment.y1,
                segment.cx1!, segment.cy1!,
                segment.cx2!, segment.cy2!,
                segment.x2, segment.y2,
            );

            vector.splice(segmentIndex + 1, 0, ...segments);

            const triangle = [
                new Segment(segments[0].x1, segments[0].y1, segments[0].x2, segments[0].y2),
                new Segment(segments[1].x1, segments[1].y1, segments[1].x2, segments[1].y2),
            ];

            this.segments.splice(vectorIndex + 1, 0, triangle);

            return true;
        }

        if (boundsCheck(ratio2, 0, 1))
        {
            const segments = VectorDataGenerator.subdivideCurve(
                ratio2,
                segment.x1, segment.y1,
                segment.cx1!, segment.cy1!,
                segment.cx2!, segment.cy2!,
                segment.x2, segment.y2,
            );

            vector.splice(segmentIndex + 1, 0, ...segments);

            const triangle = [
                new Segment(segments[0].x1, segments[0].y1, segments[0].x2, segments[0].y2),
                new Segment(segments[1].x1, segments[1].y1, segments[1].x2, segments[1].y2),
            ];

            this.segments.splice(vectorIndex + 1, 0, triangle);

            return true;
        }

        return false;
    }


    // TODO: Several optimizations to look into:
    // 1) Use ObjectPool to reduce allocations (big one)
    // 2) Reduce the amount of function calls
    public buildGeometry(): VectorGeometryRow[][]
    {
        const rows: VectorGeometryRow[][] = [];

        for (let i = 0; i < this.segments.length; i++)
        {
            const vector = this.segments[i];
            if (vector.length === 0) continue;

            {
                const row: VectorGeometryRow[] = [];

                for (let j = 0; j < vector.length; j++)
                {
                    const segment = vector[j];

                    // NOTE: Figma uses 0.5 for k, l and m for line segments.
                    // For some reason for us it doesn't work, so we use 0 instead
                    row.push([segment.x1, segment.y1, 0, 0, 0]);
                    row.push([segment.x2, segment.y2, 0, 0, 0]);
                }

                rows.push(row);
            }

            {
                // yay
                for (let j = 0; j < vector.length; j++)
                {
                    const segment = vector[j];

                    if (segment.isLine()) continue;
                    if (segment.isQuadratic()) continue;

                    const B01 = segment.x1;
                    const B02 = segment.y1;
                    const B03 = 1;

                    const B11 = segment.cx1!;
                    const B12 = segment.cy1!;
                    const B13 = 1;

                    const B21 = segment.cx2!;
                    const B22 = segment.cy2!;
                    const B23 = 1;

                    const B31 = segment.x2;
                    const B32 = segment.y2;
                    const B33 = 1;

                    const a1 = determinant3x3(
                        B01, B02, B03,
                        B31, B32, B33,
                        B21, B22, B23,
                    );

                    const a2 = determinant3x3(
                        B11, B12, B13,
                        B01, B02, B03,
                        B31, B32, B33,
                    );

                    const a3 = determinant3x3(
                        B21, B22, B23,
                        B11, B12, B13,
                        B01, B02, B03,
                    );

                    let d1 = a1 - 2 * a2 + 3 * a3;
                    let d2 = -a2 + 3 * a3;
                    let d3 = 3 * a3;

                    console.log("=======");
                    const cubicType = VectorDataGenerator.getCubicType(d1, d2, d3);
                    console.log(
                        CubicType[cubicType],
                        segment.x1, segment.y1,
                        segment.cx1, segment.cy1,
                        segment.cx2, segment.cy2,
                        segment.x2, segment.y2,
                    );

                    let flip = false;

                    switch (cubicType)
                    {
                        case CubicType.SERPENTINE:
                        {
                            const sqrt = Math.sqrt(9 * d2 * d2 - 12 * d1 * d3);

                            const ls = 3 * d2 - sqrt;
                            const lt = 6 * d1;

                            const ms = 3 * d2 + sqrt;
                            const mt = lt;

                            const ltls = (lt - ls);
                            const mtms = (mt - ms);

                            M[0] = ls * ms;
                            M[1] = ls * ls * ls;
                            M[2] = ms * ms * ms;

                            M[3] = THIRD * (3 * ls * ms - ls * mt - lt * ms);
                            M[4] = ls * ls * (ls - lt);
                            M[5] = ms * ms * (ms - mt);

                            M[6] = THIRD * (lt * (mt - 2 * ms) + ls * (3 * ms - 2 * mt));

                            const ltls2 = ltls * ltls;
                            const mtms2 = mtms * mtms;
                            M[7] = ltls2 * ls;
                            M[8] = mtms2 * ms;

                            M[9] = ltls * mtms;
                            M[10] = -(ltls2 * ltls);
                            M[11] = -(mtms2 * mtms);

                            if (Math.abs(d1) > EPSILON && d1 < 0)
                            {
                                flip = true;
                            }

                            break;
                        }
                        case CubicType.LOOP:
                        {
                            const sqrt = Math.sqrt(4 * d1 * d3 - 3 * d2 * d2);

                            const ls = d2 - sqrt;
                            const lt = 2 * d1;

                            const ms = d2 + sqrt;
                            const mt = lt;

                            const ltls = lt - ls;
                            const mtms = mt - ms;

                            const ratio1 = lt / ls;
                            const ratio2 = mt / ms;

                            if (this.subdivideSegment(segment, j, vector, i, ratio1, ratio2))
                            {
                                console.log("SPLIT", ratio1, ratio2);
                                continue;
                            }


                            M[0] = ls * ms;
                            M[1] = ls * ls * ls;
                            M[2] = ms * ms * ms;

                            M[3] = THIRD * (3 * ls * ms - ls * mt - lt * ms);
                            M[4] = -THIRD * ls * (ls * (mt - 3 * ms) + 2 * lt * ms);
                            M[5] = -THIRD * ms * (ls * (2 * mt - 3 * ms) + lt * ms);

                            M[6] = THIRD * (lt * (mt - 2 * ms) + ls * (3 * ms - 2 * mt));
                            M[7] = THIRD * ltls * (ls * (2 * mt - 3 * ms) + lt * ms);
                            M[8] = THIRD * mtms * (ls * (mt - 3 * ms) + 2 * lt * ms);

                            M[9] = ltls * mtms;
                            M[10] = -ltls * ltls * mtms;
                            M[11] = -ltls * mtms * mtms;

                            if (Math.abs(d1) > EPSILON && d1 > 0 && Math.abs(M[0]) > EPSILON && Math.sign(M[0]) < 0)
                            {
                                flip = true;
                            }

                            if (Math.abs(d1) > EPSILON && d1 < 0 && Math.abs(M[0]) > 0 && Math.sign(M[0]) > 0)
                            {
                                flip = true;
                            }

                            break;
                        }
                        case CubicType.CUSP:
                        {
                            const ls = d3;
                            const lt = 3 * d2;

                            M[0] = ls;
                            M[1] = ls * ls * ls;
                            M[2] = 1;

                            M[3] = ls - (1 / 3) * lt;
                            M[4] = ls * ls * (ls - lt);
                            M[5] = 1;

                            M[6] = ls - (2 / 3) * lt;
                            M[7] = (ls - lt) * (ls - lt) * ls;
                            M[8] = 1;

                            M[9] = ls - lt;
                            M[10] = (ls - lt) * (ls - lt) * (ls - lt);
                            M[11] = 1;

                            break;
                        }
                        case CubicType.QUADRATIC:
                        {
                            M[0] = 0;
                            M[1] = 0;
                            M[2] = 0;

                            M[3] = -QUAD_K2;
                            M[4] = 0;
                            M[5] = QUAD_K2;

                            M[6] = -QUAD_K3;
                            M[7] = -QUAD_L3;
                            M[8] = QUAD_K3;

                            M[9] = -1;
                            M[10] = -1;
                            M[11] = 1;

                            break;
                        }
                        case CubicType.LINE:
                        {
                            rows.push(
                                [
                                    [segment.x1, segment.y1, 0, 0, 0],
                                    [segment.x2, segment.y2, 0, 0, 0],
                                ]
                            );
                            continue;
                        }
                        case CubicType.POINT: continue;
                    }

                    if (flip)
                    {
                        M[0] = -M[0];
                        M[1] = -M[1];

                        M[3] = -M[3];
                        M[4] = -M[4];

                        M[6] = -M[6];
                        M[7] = -M[7];

                        M[9] = -M[9];
                        M[10] = -M[10];
                    }

                    rows.push(
                        [
                            [segment.x1,   segment.y1,   M[0], M[1], M[2]],
                            [segment.cx1!, segment.cy1!, M[3], M[4], M[5]],
                            [segment.cx2!, segment.cy2!, M[6], M[7], M[8]],
                            [segment.x2,   segment.y2,   M[9], M[10], M[11]],
                        ]
                    );
                }
            }
        }

        return rows;
    }
}
