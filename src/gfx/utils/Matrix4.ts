import type { Tuple } from "./types";



export class Matrix4
{
    public elements: Tuple<number, 16>;


    constructor(elements?: Tuple<number, 16>)
    {
        this.elements = elements ?? [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }


    public set(
        n11: number,
        n12: number,
        n13: number,
        n14: number,
        n21: number,
        n22: number,
        n23: number,
        n24: number,
        n31: number,
        n32: number,
        n33: number,
        n34: number,
        n41: number,
        n42: number,
        n43: number,
        n44: number,
    ) {
        this.elements[0] = n11;
        this.elements[1] = n12;
        this.elements[2] = n13;
        this.elements[3] = n14;
        this.elements[4] = n21;
        this.elements[5] = n22;
        this.elements[6] = n23;
        this.elements[7] = n24;
        this.elements[8] = n31;
        this.elements[9] = n32;
        this.elements[10] = n33;
        this.elements[11] = n34;
        this.elements[12] = n41;
        this.elements[13] = n42;
        this.elements[14] = n43;
        this.elements[15] = n44;

        return this;
    }



    public multiply(o: Matrix4)
    {
        this.set(
            o.elements[0] * this.elements[0] +
            o.elements[1] * this.elements[4] +
            o.elements[2] * this.elements[8] +
            o.elements[3] * this.elements[12],

            o.elements[0] * this.elements[1] +
            o.elements[1] * this.elements[5] +
            o.elements[2] * this.elements[9] +
            o.elements[3] * this.elements[13],

            o.elements[0] * this.elements[2] +
            o.elements[1] * this.elements[6] +
            o.elements[2] * this.elements[10] +
            o.elements[3] * this.elements[14],

            o.elements[0] * this.elements[3] +
            o.elements[1] * this.elements[7] +
            o.elements[2] * this.elements[11] +
            o.elements[3] * this.elements[15],

            o.elements[4] * this.elements[0] +
            o.elements[5] * this.elements[4] +
            o.elements[6] * this.elements[8] +
            o.elements[7] * this.elements[12],

            o.elements[4] * this.elements[1] +
            o.elements[5] * this.elements[5] +
            o.elements[6] * this.elements[9] +
            o.elements[7] * this.elements[13],

            o.elements[4] * this.elements[2] +
            o.elements[5] * this.elements[6] +
            o.elements[6] * this.elements[10] +
            o.elements[7] * this.elements[14],

            o.elements[4] * this.elements[3] +
            o.elements[5] * this.elements[7] +
            o.elements[6] * this.elements[11] +
            o.elements[7] * this.elements[15],

            o.elements[8] * this.elements[0] +
            o.elements[9] * this.elements[4] +
            o.elements[10] * this.elements[8] +
            o.elements[11] * this.elements[12],

            o.elements[8] * this.elements[1] +
            o.elements[9] * this.elements[5] +
            o.elements[10] * this.elements[9] +
            o.elements[11] * this.elements[13],

            o.elements[8] * this.elements[2] +
            o.elements[9] * this.elements[6] +
            o.elements[10] * this.elements[10] +
            o.elements[11] * this.elements[14],

            o.elements[8] * this.elements[3] +
            o.elements[9] * this.elements[7] +
            o.elements[10] * this.elements[11] +
            o.elements[11] * this.elements[15],

            o.elements[12] * this.elements[0] +
            o.elements[13] * this.elements[4] +
            o.elements[14] * this.elements[8] +
            o.elements[15] * this.elements[12],

            o.elements[12] * this.elements[1] +
            o.elements[13] * this.elements[5] +
            o.elements[14] * this.elements[9] +
            o.elements[15] * this.elements[13],

            o.elements[12] * this.elements[2] +
            o.elements[13] * this.elements[6] +
            o.elements[14] * this.elements[10] +
            o.elements[15] * this.elements[14],

            o.elements[12] * this.elements[3] +
            o.elements[13] * this.elements[7] +
            o.elements[14] * this.elements[11] +
            o.elements[15] * this.elements[15],
        );

        return this;
    }


    public identity()
    {
        this.elements[0] = 1;
        this.elements[1] = 0;
        this.elements[2] = 0;
        this.elements[3] = 0;

        this.elements[4] = 0;
        this.elements[5] = 1;
        this.elements[6] = 0;
        this.elements[7] = 0;

        this.elements[8] = 0;
        this.elements[9] = 0;
        this.elements[10] = 1;
        this.elements[11] = 0;

        this.elements[12] = 0;
        this.elements[13] = 0;
        this.elements[14] = 0;
        this.elements[15] = 1;
        return this;
    }


    public copy(m: Matrix4)
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
        this.elements[9] = m.elements[9];
        this.elements[10] = m.elements[10];
        this.elements[11] = m.elements[11];

        this.elements[12] = m.elements[12];
        this.elements[13] = m.elements[13];
        this.elements[14] = m.elements[14];
        this.elements[15] = m.elements[15];

        return this;
    }


    public clone(): Matrix4
    {
        return new Matrix4().copy(this);
    }


    public toArray()
    {
        return this.elements;
    }


    /**
     *
     * @param m
     * @returns
     */
    public compare(m: Matrix4): boolean
    {
        if (this === m) return true;

        for (let i = 0; i < this.elements.length; i++)
        {
            if (this.elements[i] !== m.elements[i]) return false;
        }

        return true;
    }



    public toString(): string
    {
        return `[${this.elements.join(', ')}]`;
    }
}

