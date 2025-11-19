import { Matrix4 } from "./Matrix4";
import { ReservableStack } from "./stack";

import {
    determinant3x3,
    mult4x4Fast,
    multiply4x4By3x4
} from "./matrixUtils";



const EPSILON = 1e-5;

const CURVE_CONVERSION_COEFF = 2 / 3;
const HESSIAN_COEFF = 32 / 3;

const QUAD_K2 = 1 / 3;
const QUAD_K3 = 2 / 3;
const QUAD_L3 = 1 / 3;




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

    public flip = false;


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


const M3 = Object.freeze(new Matrix4([
     1,  0,  0, 0,
    -3,  3,  0, 0,
     3, -6,  3, 0,
    -1,  3, -3, 1,
]));


const MI3 = Object.freeze(new Matrix4([
    1,     0,     0, 0,
    1, 1 / 3,     0, 0,
    1, 2 / 3, 1 / 3, 0,
    1,     1,     1, 1,
]));



enum CubicType
{
    SERPENTINE,
    LOOP,
    CUSP1,
    CUSP2,
    LINE,
    QUADRATIC,
}


const F = new Matrix4();


function boundsCheck(val: number, start: number, end: number): boolean
{
    return val >= EPSILON && (end - val) >= EPSILON && val > start && val < end;
}




/**
 * @see C. Loop & J. Blinn - Resolution Independent Curve Rendering
 * using Programmable Graphics Hardware
 */
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

        this.getLastVector().push(
            new Segment(
                this.lastPoint[0],
                this.lastPoint[1],
                x2,
                y2,
            )
        );

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
        if (
            this.lastPoint[0] === x2
        )
        {
            return this;
        }

        this.getLastVector().push(
            new Segment(
                this.lastPoint[0],
                this.lastPoint[1],
                x2,
                this.lastPoint[1],
            )
        );

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

        this.getLastVector().push(
            new Segment(
                this.lastPoint[0],
                this.lastPoint[1],
                this.lastPoint[0],
                y2,
            )
        );

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



    private static getCubicType(d1: number, d2: number, d3: number): CubicType
    {
        if (Math.abs(d1) >= EPSILON)
        {
            const eq = (3 * d2 * d2 - 4 * d1 * d3);
            if (eq > 0)
                return CubicType.SERPENTINE;

            if (eq < 0)
                return CubicType.LOOP;

            if (eq === 0)
                return CubicType.CUSP1;
        }

        if (Math.abs(d1) <= EPSILON && Math.abs(d2) >= EPSILON)
            return CubicType.CUSP2;

        if (Math.abs(d1) <= EPSILON && Math.abs(d2) <= EPSILON && Math.abs(d3) >= EPSILON)
            return CubicType.QUADRATIC;

        return CubicType.LINE;
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

        return [
            new Segment(x1, y1, Rx, Ry, Lx, Ly, Px, Py),
            new Segment(Rx, Ry, x2, y2, Qx, Qy, Nx, Ny),
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

            segments[1].flip = true;

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

            segments[0].flip = true;

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
                for (let j = 0; j < vector.length; j++)
                {
                    const segment = vector[j];
                    if (segment.isLine()) continue;

                    if (segment.isCubic())
                    {
                        // NOTE: I am going to inline EVERYTHING,
                        // because performance

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

                        // --- calculate determinants
                        const d1 = -determinant3x3(
                            x4, y4, w4,
                            x3, y3, w3,
                            x1, y1, w1,
                        );
                        const d2 = determinant3x3(
                            x4, y4, w4,
                            x2, y2, w2,
                            x1, y1, w1,
                        );
                        const d3 = -determinant3x3(
                            x3, y3, w3,
                            x2, y2, w2,
                            x1, y1, w1,
                        );
                        // ---

                        // get curve type
                        const cubicType = VectorDataGenerator.getCubicType(d1, d2, d3);

                        // this is to determine if we are convex or concave
                        let kSign = 1;
                        let lSign = 1;

                        // --- calculate F
                        switch(cubicType)
                        {
                            // these two cases work out to be the same,
                            // mathematically
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

                                let ratio1 = tl / sl;
                                let ratio2 = tm / sm;

                                if (this.subdivideSegment(segment, j, vector, i, ratio1, ratio2))
                                    continue;

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

                                // HACK: this is just a shot in the dark
                                if (segment.flip)
                                {
                                    kSign = 1;
                                    lSign = 1;
                                }
                                else
                                {
                                    // NOTE: this might break, but right now this works
                                    if (Math.abs(d1) <= EPSILON || d3 > 0 || d1 === d2)
                                    {
                                        kSign = 1;
                                        lSign = 1;
                                    }
                                    else
                                    {
                                        kSign = Math.sign(d1);
                                        lSign = Math.sign(d1);
                                    }
                                }

                                break;
                            }
                            case CubicType.LOOP:
                            {
                                const sqrt = Math.sqrt(4 * d1 * d3 - 3 * d2 * d2);

                                let td = d2 + sqrt;
                                let sd = 2 * d1;
                                const l1 = Math.sqrt(td * td + sd * sd);
                                td /= l1;
                                sd /= l1;

                                let te = d2 - sqrt;
                                let se = 2 * d1;
                                const l2 = Math.sqrt(te * te + se * se);
                                te /= l2;
                                se /= l2;

                                let ratio1 = td / sd;
                                let ratio2 = te / se;

                                if (this.subdivideSegment(segment, j, vector, i, ratio1, ratio2))
                                    continue;

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


                                const h1 = VectorDataGenerator.computeHessian(td, sd, d1, d2, d3);

                                // NOTE: All of this is just guess work
                                if (segment.flip && Math.abs(d1 * h1) >= 0)
                                {
                                    kSign = -1;
                                    lSign = -1;
                                }
                                else
                                {
                                    const d13 = d1 * d1 * d1;
                                    const h2 = VectorDataGenerator.computeHessian(te, se, d1, d2, d3);

                                    const alpha1 = HESSIAN_COEFF * d13 * h1;
                                    const alpha2 = HESSIAN_COEFF * d13 * h2;
                                    const alpha = Math.max(alpha1, alpha2);

                                    if (alpha <= EPSILON)
                                    {
                                        kSign = 1;
                                        lSign = 1;
                                    }
                                    else
                                    {
                                        kSign = Math.sign(alpha) || 1;
                                        lSign = Math.sign(alpha) || 1;
                                    }
                                }

                                break;
                            }
                            case CubicType.CUSP2:
                            {
                                let tl = d3;
                                let sl = 3 * d2;
                                const l = Math.sqrt(tl * tl + sl * sl);
                                tl /= l;
                                sl /= l;

                                const ratio = tl / sl;

                                if (this.subdivideSegment(segment, j, vector, i, ratio, -1))
                                    continue;

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

                                // HACK: not certain this works correctly
                                if (segment.flip)
                                {
                                    kSign = Math.sign(d2);
                                    lSign = Math.sign(d2);
                                }
                                else
                                {
                                    kSign = -Math.sign(d2);
                                    lSign = -Math.sign(d2);
                                }

                                break;
                            }
                            case CubicType.QUADRATIC:
                            case CubicType.LINE:
                            {
                                // these are special cases
                                break;
                            }
                        }
                        // ---

                        let k1: number;
                        let l1: number;
                        let m1: number;

                        let k2: number;
                        let l2: number;
                        let m2: number;

                        let k3: number;
                        let l3: number;
                        let m3: number;

                        let k4: number;
                        let l4: number;
                        let m4: number;

                        // --- calculate MI3 * F and get k, l and m
                        if (cubicType === CubicType.QUADRATIC)
                        {
                            // NOTE: the article actually gives completely
                            // different values, but they don't work.
                            // These are taken from Figma, but flipped,
                            // because of course it doesn't work as is, for some reason
                            k1 = 0;
                            l1 = 0;
                            m1 = 0;

                            k2 = -QUAD_K2;
                            l2 = 0;
                            m2 = QUAD_K2;

                            k3 = -QUAD_K3;
                            l3 = -QUAD_L3;
                            m3 = QUAD_K3;

                            k4 = -1;
                            l4 = -1;
                            m4 = 1;
                        }
                        else
                        {
                            if (cubicType === CubicType.LINE)
                            {
                                // removes redundant triangulation
                                // (probably a rare case)
                                rows.push(
                                    [
                                        [segment.x1, segment.y1, 0, 0, 0],
                                        [segment.x2, segment.y2, 0, 0, 0],
                                    ]
                                );

                                continue;
                            }

                            const res = mult4x4Fast(F.elements, MI3.elements);

                            k1 = kSign * res[0];
                            l1 = lSign * res[1];
                            m1 = res[2];

                            k2 = kSign * res[4];
                            l2 = lSign * res[5];
                            m2 = res[6];

                            k3 = kSign * res[8];
                            l3 = lSign * res[9];
                            m3 = res[10];

                            k4 = kSign * res[12];
                            l4 = lSign * res[13];
                            m4 = res[14];
                        }

                        rows.push(
                            [
                                [segment.x1,   segment.y1,   k1, l1, m1],
                                [segment.cx1!, segment.cy1!, k2, l2, m2],
                                [segment.cx2!, segment.cy2!, k3, l3, m3],
                                [segment.x2,   segment.y2,   k4, l4, m4],
                            ]
                        );
                        // ---

                        continue;
                    }
                }
            }
        }

        return rows;
    }
}



const COMPONENT_COUNT = 5;

export function triangulateVectorGeometryFromData(data: VectorGeometryRow[][]): [vertices: number[], len: number]
{
    const stack1 = new ReservableStack<VectorGeometryRow>(0);
    const stack2 = new ReservableStack<VectorGeometryRow>(0);
    const vertices = new Array<number>();

    for (let i = 0; i < data.length; i++)
    {
        const _data = data[i];
        stack1.takeOverFromArray(_data);

        // let's hope the branch predictor fail results
        // in less performance loss than a redundant allocation
        if (stack2.maxSize < _data.length)
            stack2.setSize(_data.length);

        stack2.clear();

        const top = stack1.pop()!;

        while (!stack1.isEmpty())
        {
            stack2.push(stack1.pop()!);

            if (stack1.peek() === null) break;

            const p2 = stack2.peek()!;
            const p3 = stack1.peek()!;

            if (top[0] === p2[0] && top[1] === p2[1]) continue;
            if (top[0] === p3[0] && top[1] === p3[1]) continue;
            if (p2[0] === p3[0] && p2[1] === p3[1]) continue;

            vertices.push(
                top[0], top[1], top[2], top[3], top[4],
                p2[0], p2[1], p2[2], p2[3], p2[4],
                p3[0], p3[1], p3[2], p3[3], p3[4],
            );
        }
    }

    return [vertices, vertices.length / COMPONENT_COUNT];
}
