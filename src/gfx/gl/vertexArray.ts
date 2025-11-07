import type { IDisposable } from "../utils/types";
import GL                from "./GL";
import type IndexBuffer  from "./indexBuffer";
import type VertexBuffer from "./vertexBuffer";
import { BufferType }    from "./vertexBuffer";



function bufferTypeToGLType(type: BufferType)
{
    const gl = GL.get();
    switch (type)
    {
        case BufferType.Float:
        case BufferType.Float2:
        case BufferType.Float3:
        case BufferType.Float4:
            return gl.FLOAT;
        case BufferType.Int:
            return gl.INT;
    }
}


export default class VertexArray implements IDisposable
{
    private _id: WebGLVertexArrayObject | null;
    private _vertexBuffers: Array<VertexBuffer> = [];
    private _indexBuffer: IndexBuffer | null = null;
    private _lastBufferIndex: number = 0;

    constructor()
    {
        const gl = GL.get();
        this._id = gl.createVertexArray();
        gl.bindVertexArray(this._id);
    }

    public delete()
    {
        GL.get().deleteVertexArray(this._id);

        for (let i = 0; i < this._vertexBuffers.length; i++)
        {
            this._vertexBuffers[i].delete();
        }

        this._indexBuffer?.delete();
    }

    public bind()
    {
        GL.get().bindVertexArray(this._id);
    }

    public unbind()
    {
        GL.get().bindVertexArray(null);
    }

    public addVertexBuffer(buffer: Readonly<VertexBuffer>)
    {
        const gl = GL.get();
        this.bind();
        buffer.bind();

        const layout = buffer.layout;
        if (!layout) throw new Error("No layout in vertex buffer");

        for (let i = 0; i < layout.elements.length; i++)
        {
            const el = layout.elements[i];
            switch (el.type)
            {
                case BufferType.Float:
                case BufferType.Float2:
                case BufferType.Float3:
                case BufferType.Float4:
                {
                    gl.enableVertexAttribArray(this._lastBufferIndex);

                    gl.vertexAttribPointer(
                        this._lastBufferIndex,
                        el.componentCount(),
                        bufferTypeToGLType(el.type),
                        false,
                        layout.stride,
                        el.offset
                    );

                    this._lastBufferIndex++;
                    break;
                }
                case BufferType.Int: break;
            }
        }

        this._vertexBuffers.push(buffer as VertexBuffer);
    }

    public setIndexBuffer(buffer: Readonly<IndexBuffer>)
    {
        this.bind();
        buffer.bind();
        this._indexBuffer = buffer as IndexBuffer;
    }

    public getIndexBuffer()
    {
        return this._indexBuffer;
    }
}
