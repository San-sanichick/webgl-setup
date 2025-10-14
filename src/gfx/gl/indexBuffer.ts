import GL from "./GL";



export default class IndexBuffer
{
    private _id: WebGLBuffer | null;
    private _count: number;


    constructor(indices: ReadonlyArray<number>)
    {
        this._count = indices.length;

        const gl = GL.get();
        this._id = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._id);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint32Array(indices),
            gl.STATIC_DRAW
        );
    }

    public delete()
    {
        GL.get().deleteBuffer(this._id);
    }

    public bind()
    {
        const gl = GL.get();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._id);
    }


    public unbind()
    {
        const gl = GL.get();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    public get count()
    {
        return this._count;
    }


    public get id()
    {
        return this._id;
    }
}
