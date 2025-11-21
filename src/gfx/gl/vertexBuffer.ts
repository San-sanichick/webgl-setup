import GL from "./GL";
import { BUFFER_OBJECT_DRAW_MODE, BUFFER_TYPE, bufferTypeSize, getGLDrawMode } from "./utils";



export class VertexBufferElement
{
    public name: string;
    public type: BUFFER_TYPE;
    public size: number;
    public offset: number = 0;

    constructor(name: string, type: BUFFER_TYPE)
    {
        this.name = name;
        this.type = type;
        this.size = bufferTypeSize(type);
    }

    public componentCount(): number
    {
        switch (this.type)
        {
            case BUFFER_TYPE.Float:
                return 1;
            case BUFFER_TYPE.Float2:
                return 2;
            case BUFFER_TYPE.Float3:
                return 3;
            case BUFFER_TYPE.Float4:
                return 4;
            case BUFFER_TYPE.Int:
                return 1;
            default:
                return 1;
        }
    }
}

export class VertexBufferLayout
{
    private _stride: number = 0;
    private _elements: VertexBufferElement[];

    constructor(elements: VertexBufferElement[])
    {
        this._elements = elements;
        this.calcStride();
    }

    public get elements(): readonly VertexBufferElement[]
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



export class VertexBuffer
{
    private _vbo   : WebGLBuffer | null;
    private _size  : number;
    private _layout: VertexBufferLayout | null = null;
    private _mode  : BUFFER_OBJECT_DRAW_MODE;
    private gl     : WebGL2RenderingContext;

    private buffer: Float32Array;
    
    constructor(
        vertices: readonly number[],
        mode = BUFFER_OBJECT_DRAW_MODE.DYNAMIC
    )
    {
        this.gl = GL.get();
        this._vbo = this.gl.createBuffer();
        this._size = vertices.length;
        this._mode = mode;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._vbo);
        this.buffer = new Float32Array(vertices);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.buffer, getGLDrawMode(this.gl, mode));
    }

    public delete(): void
    {
        this.gl.deleteBuffer(this._vbo);
    }


    public setData(vertices: readonly number[]): void
    {
        this._size = vertices.length;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._vbo);

        this.buffer.set(vertices);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.buffer);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    public resizeAndSetData(vertices: readonly number[]): void
    {
        this._size = vertices.length;
        this.gl.deleteBuffer(this._vbo);

        this._vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._vbo);

        this.buffer = new Float32Array(vertices);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.buffer, getGLDrawMode(this.gl, this._mode));

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    public bind(): void
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._vbo);
    }

    public unbind(): void
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    public set layout(layout: VertexBufferLayout)
    {
        this._layout = layout;
    }

    public get layout(): VertexBufferLayout | null
    {
        return this._layout;
    }

    public get size(): number
    {
        return this._size;
    }
}

