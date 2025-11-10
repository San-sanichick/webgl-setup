import { Vector2 } from "threejs-math";
import type { Tuple } from "./types";


const RADIAN_MULT = 180 / Math.PI;




export class Matrix3
{
    
    public elements: Tuple<number, 9> = [1, 0, 0, 0, 1, 0, 0, 0, 1];

    
    constructor(elements?: Tuple<number, 9>) 
    {
        if (elements)
        {
            this.elements[0] = elements[0];
            this.elements[1] = elements[1];
            this.elements[2] = elements[2];
            this.elements[3] = elements[3];
            this.elements[4] = elements[4];
            this.elements[5] = elements[5];
            this.elements[6] = elements[6];
            this.elements[7] = elements[7];
            this.elements[8] = elements[8];
        }
    }

    
    public set(
        n11: number,
        n12: number,
        n13: number,
        n21: number,
        n22: number,
        n23: number,
        n31: number,
        n32: number,
        n33: number
    ) {
        this.elements[0] = n11;
        this.elements[1] = n12;
        this.elements[2] = n13;
        this.elements[3] = n21;
        this.elements[4] = n22;
        this.elements[5] = n23;
        this.elements[6] = n31;
        this.elements[7] = n32;
        this.elements[8] = n33;

        return this;
    }

    public translate(x: number, y: number) 
    {
        _m3.set(1, 0, 0, 0, 1, 0, x, y, 1);
        return this.multiply(_m3);
    }


    public setPosition(x: number, y: number) 
    {
        this.elements[6] = x;
        this.elements[7] = y;
        return this;
    }


    public rotate(angleInRadians: number) 
    {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        _m3.set(c, -s, 0, s, c, 0, 0, 0, 1);
        return this.multiply(_m3);
    }


    public setRotation(angleInRadians: number) 
    {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        this.elements[0] = c;
        this.elements[1] = -s;
        this.elements[3] = s;
        this.elements[4] = c;

        return this;
    }



    public scale(x: number, y: number) 
    {
        _m3.set(x, 0, 0, 0, y, 0, 0, 0, 1);
        return this.multiply(_m3);
    }


    public setScale(x: number, y: number) 
    {
        this.elements[0] = x;
        this.elements[4] = y;

        return this;
    }


    public multiply(o: Matrix3) 
    {
        this.set(
            o.elements[0] * this.elements[0] +
            o.elements[1] * this.elements[3] +
            o.elements[2] * this.elements[6],

            o.elements[0] * this.elements[1] +
            o.elements[1] * this.elements[4] +
            o.elements[2] * this.elements[7],

            o.elements[0] * this.elements[2] +
            o.elements[1] * this.elements[5] +
            o.elements[2] * this.elements[8],

            o.elements[3] * this.elements[0] +
            o.elements[4] * this.elements[3] +
            o.elements[5] * this.elements[6],

            o.elements[3] * this.elements[1] +
            o.elements[4] * this.elements[4] +
            o.elements[5] * this.elements[7],

            o.elements[3] * this.elements[2] +
            o.elements[4] * this.elements[5] +
            o.elements[5] * this.elements[8],

            o.elements[6] * this.elements[0] +
            o.elements[7] * this.elements[3] +
            o.elements[8] * this.elements[6],

            o.elements[6] * this.elements[1] +
            o.elements[7] * this.elements[4] +
            o.elements[8] * this.elements[7],

            o.elements[6] * this.elements[2] +
            o.elements[7] * this.elements[5] +
            o.elements[8] * this.elements[8]
        );

        return this;
    }


    public identity() 
    {
        this.elements[0] = 1;
        this.elements[1] = 0;
        this.elements[2] = 0;
        this.elements[3] = 0;
        this.elements[4] = 1;
        this.elements[5] = 0;
        this.elements[6] = 0;
        this.elements[7] = 0;
        this.elements[8] = 1;
        return this;
    }


    public copy(m: Matrix3) 
    {
        this.elements[0] = m.elements[0];
        this.elements[1] = m.elements[1];
        this.elements[2] = m.elements[2];
        this.elements[3] = m.elements[3];
        this.elements[4] = m.elements[4];
        this.elements[5] = m.elements[5];
        this.elements[6] = m.elements[6];
        this.elements[7] = m.elements[7];
        this.elements[8] = m.elements[8];

        return this;
    }


    public clone(): Matrix3 
    {
        return new Matrix3().copy(this);
    }


    public toArray() 
    {
        return this.elements;
    }


    public invert() 
    {
        const a1  = this.elements[0];
        const b1  = this.elements[1];
        const c1  = this.elements[3];
        const d1  = this.elements[4];
        const tx1 = this.elements[6];

        const n = a1 * d1 - b1 * c1;

        this.elements[0] = d1 / n;
        this.elements[1] = -b1 / n;
        this.elements[3] = -c1 / n;
        this.elements[4] = a1 / n;
        this.elements[6] = (c1 * this.elements[7] - d1 * tx1) / n;
        this.elements[7] = -(a1 * this.elements[7] - b1 * tx1) / n;

        return this;
    }


    public determinant(): number
    {


        return 0;
    }


    public getPosition(): Vector2
    {
        return new Vector2(this.elements[6], this.elements[7]);
    }


    public getRadAngle(): number
    {
        return Math.atan2(-this.elements[1], this.elements[0]);
    }


    public getDegreeAngle() 
    {
        return this.getRadAngle() * RADIAN_MULT;
    }

    
    /**
     * @link https://stackoverflow.com/questions/45159314/decompose-2d-transformation-matrix/45160616#45160616
     * @returns 
     */
    public getSkew(): number
    {
        // | Xx Xy 0 |
        // | Yx Yy 0 |
        // | Ox Oy 1 |

        return Math.acos(
            (this.elements[0] * this.elements[3] + this.elements[1] * this.elements[4]) / 
            Math.sqrt(
                (this.elements[0] * this.elements[0] + this.elements[1] * this.elements[1]) * 
                (this.elements[3] * this.elements[3] + this.elements[4] * this.elements[4])
            )
        ) - 0.5 * Math.PI;
    }


    /**
     * 
     * @param skewY 
     * @param angle 
     * @returns 
     */
    public skew(skewY: number, angle: number)
    {
        skewY = Math.PI * 2 - skewY;
        angle = Math.PI * 2 - angle;
        
        _m3.set(
            Math.cos(angle), Math.sin(angle), 0,

            Math.tan(skewY) * Math.cos(angle) - Math.sin(angle), 
            Math.tan(skewY) * Math.sin(angle) + Math.cos(angle), 
            0,

            0, 0, 1
        );

        this.multiply(_m3);

        return this;
    }


    public skewY(skewY: number)
    {
        skewY = Math.PI * 2 - skewY;
        
        _m3.set(
            1, 0, 0,
            Math.tan(skewY), 1, 0,
            0, 0, 1
        );

        this.multiply(_m3);

        return this;
    }
    

    public roundPosition() 
    {
        this.elements[6] = Math.round(this.elements[6]);
        this.elements[7] = Math.round(this.elements[7]);

        return this;
    }


    /**
     * 
     * @param m 
     * @returns 
     */
    public compare(m: Matrix3): boolean 
    {
        if (this === m) return true;

        for (let i = 0; i < this.elements.length; i++) 
        {
            if (this.elements[i] != m.elements[i]) return false;
        }

        return true;
    }


    /**
     *
     * @param angle
     * @param anchor
     * @returns
     */
    public static makeRotationMatrix(angle: number, anchor: Vector2): Matrix3 
    {
        const matrix = new Matrix3();
        this.fillRotationMatrix(angle, anchor, matrix);
        return matrix;
    }


    /**
     * 
     * @param angle 
     * @param anchor 
     * @param matrix 
     */
    public static fillRotationMatrix(
        angle : number,
        anchor: Vector2,
        matrix: Matrix3
    ): void 
    {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        let m = 0;
        let n = 0;

        if (anchor.x != 0 && anchor.y != 0) 
        {
            m = -anchor.x * (cos - 1) + anchor.y * sin;
            n = -anchor.y * (cos - 1) - anchor.x * sin;
        }

        matrix.elements[0] = cos;
        matrix.elements[1] = sin;
        matrix.elements[2] = 0;

        matrix.elements[3] = -sin;
        matrix.elements[4] = cos;
        matrix.elements[5] = 0;

        matrix.elements[6] = m;
        matrix.elements[7] = n;
        matrix.elements[8] = 1;
    }

    
    /**
     *
     * @param coeffX
     * @param coeffY
     * @param anchor
     * @returns
     */
    public static fillScaleMatrix(
        coeffX: number,
        coeffY: number,
        angle : number,
        anchor: Vector2,
        matrix: Matrix3
    ): void 
    {
        const sDiff1 = coeffX - coeffY;
        const sDiff2 = coeffY - coeffX;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const sinCos = sin * cos;
        const cos2 = cos * cos;

        const mult1 = sDiff1 * cos2;
        const mult2 = sDiff1 * sinCos;

        const m = -anchor.x * mult1 - anchor.y * mult2 - anchor.x * (coeffY - 1);
        const n = anchor.y * mult1 - anchor.x * mult2 - anchor.y * (coeffX - 1);

        matrix.elements[0] = mult1 + coeffY;
        matrix.elements[1] = mult2;
        matrix.elements[2] = 0;

        matrix.elements[3] = mult2;
        matrix.elements[4] = sDiff2 * cos2 + coeffX;
        matrix.elements[5] = 0;

        matrix.elements[6] = m;
        matrix.elements[7] = n;
        matrix.elements[8] = 1;
    }


    /**
     *
     * @param coeffX
     * @param coeffY
     * @param angle
     * @param anchor
     * @returns
     */
    public static makeScaleMatrix(
        coeffX: number,
        coeffY: number,
        angle : number,
        anchor: Vector2
    ): Matrix3 
    {
        const matrix = new Matrix3();
        this.fillScaleMatrix(coeffX, coeffY, angle, anchor, matrix);
        return matrix;
    }


    /**
     * 
     * @param scale 
     * @param anchor 
     * @param tempMatrix 
     * @returns 
     */
    public static fillScaleMatrixByAnchor(
        scale     : Vector2,
        anchor    : Vector2,
        tempMatrix: Matrix3,
        nullVal   : number = 1e-5
    ): Matrix3
    {
        const sx = scale.x || nullVal;
        const sy = scale.y || nullVal;

        const ax = anchor.x;
        const ay = anchor.y;
      
        const px = scale.x === 0 ? ax : ax * (1 - sx);
        const py = scale.y === 0 ? ay : ay * (1 - sy);
      
        tempMatrix.set(sx, 0, 0, 0, sy, 0, px, py, 1);
        
        return tempMatrix;
    }
    

    /**
     * 
     * @param tempMatrix 
     * @param size 
     * @returns 
     */
    public static extractScaleFromMatrixAndApplyToSize(
        tempMatrix: Matrix3,
        size      : Vector2,
    ): Vector2
    {
        const a = tempMatrix.elements[0];
        const b = tempMatrix.elements[1];
        const c = tempMatrix.elements[3];
        const d = tempMatrix.elements[4];
        const e = tempMatrix.elements[6];
        const f = tempMatrix.elements[7];
      
        // Применяем трансформацию к векторам ширины и высоты
        const widthVec  = [a * size.x, b * size.x];
        const heightVec = [c * size.y, d * size.y];
      
        // Вычисляем реальные длины
        const realWidth = Math.hypot(...widthVec);
        const realHeight = Math.hypot(...heightVec);
      
        // Масштаб по каждому направлению
        const scaleX = realWidth / size.x;
        const scaleY = realHeight / size.y;
      
        // Применяем масштаб к размеру
        const scaledSize = new Vector2(size.x * scaleX, size.y * scaleY)
      
        tempMatrix.set(a / scaleX, b / scaleX, 0, c / scaleY, d / scaleY, 0, e, f, 1);
      
        return scaledSize;
    }


    public toString(): string
    {
        return `[${this.elements.join(', ')}]`;
    }

}


const _m3 = new Matrix3();
