import GL from "./GL";


export enum BufferType
{
    Float = 0,
    Float2,
    Float3,
    Float4,
    Int,
}


function bufferTypeSize(type: BufferType): number
{
    switch (type)
    {
        case BufferType.Float:
            return 4;
        case BufferType.Float2:
            return 4 * 2;
        case BufferType.Float3:
            return 4 * 3;
        case BufferType.Float4:
            return 4 * 4;
        case BufferType.Int:
            return 4;
    }
}


export class VertexBufferElement
{
    public name: string;
    public type: BufferType;
    public size: number;
    public offset: number = 0;

    constructor(name: string, type: BufferType)
    {
        this.name = name;
        this.type = type;
        this.size = bufferTypeSize(type);
    }

    public componentCount(): number
    {
        switch (this.type)
        {
            case BufferType.Float:
                return 1;
            case BufferType.Float2:
                return 2;
            case BufferType.Float3:
                return 3;
            case BufferType.Float4:
                return 4;
            case BufferType.Int:
                return 1;
        }

        return 0;
    }
}

export class VertexBufferLayout
{
    private _stride: number = 0;
    private _elements: Array<VertexBufferElement>;

    constructor(elements: Array<VertexBufferElement>)
    {
        this._elements = elements;
    }

    public get elements(): Array<VertexBufferElement>
    {
        return this._elements;
    }

    public get stride(): number
    {
        return this._stride;
    }

    private calcStride()
    {
        let offset: number = 0;
        this._stride = 0;

        for (let i = 0; i < this._elements.length; i++)
        {
            const el = this._elements[i];
            el.offset = offset;
            offset += el.size;
            this._stride += el.size;
        }
    }
}



export default class VertexBuffer
{
    private _id: WebGLBuffer | null;
    private _layout: VertexBufferLayout | null = null;
    
    constructor(vertices: Array<number>)
    {
        const gl = GL.get();
        this._id = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this._id);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }

    public delete(): void
    {
        GL.get().deleteBuffer(this._id);
    }

    public bind(): void
    {
        const gl = GL.get();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._id);
    }

    public unbind(): void
    {
        const gl = GL.get();
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public set layout(layout: VertexBufferLayout)
    {
        this._layout = layout;
    }

    public get layout(): VertexBufferLayout | null
    {
        return this._layout;
    }
}
