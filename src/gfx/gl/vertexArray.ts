import type { IDisposable } from "../utils/types";
import GL                from "./GL";
import type IndexBuffer  from "./indexBuffer";
import { BUFFER_TYPE } from "./utils";
import type { VertexBuffer } from "./vertexBuffer";
import { VertexBufferElement, VertexBufferLayout }    from "./vertexBuffer";



export function bufferTypeToGLType(type: BUFFER_TYPE)
{
    const gl = GL.get();
    switch (type)
    {
        case BUFFER_TYPE.Float:
        case BUFFER_TYPE.Float2:
        case BUFFER_TYPE.Float3:
        case BUFFER_TYPE.Float4:
            return gl.FLOAT;
        case BUFFER_TYPE.Int:
            return gl.INT;
    }

    return 0;
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

    private setBufferLayout(layout: VertexBufferLayout, el: VertexBufferElement, index: number)
    {
        const gl = GL.get();
        switch (el.type)
        {
            case BUFFER_TYPE.Float:
            case BUFFER_TYPE.Float2:
            case BUFFER_TYPE.Float3:
            case BUFFER_TYPE.Float4:
            {
                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer(
                    index,
                    el.componentCount(),
                    bufferTypeToGLType(el.type),
                    false,
                    layout.stride,
                    el.offset
                );
                break;
            }
            case BUFFER_TYPE.Int:
            {
                gl.enableVertexAttribArray(index);
                gl.vertexAttribIPointer(
                    index,
                    el.componentCount(),
                    bufferTypeToGLType(el.type),
                    layout.stride,
                    el.offset
                );
                break;
            }
        }
    }

    /**
     * Передаём вершинный буфер во владение вершинному массиву
     * VAO теперь ответственен за освобождение его ресурсов
     * @param buffer
     */
    public addVertexBuffer(buffer: VertexBuffer)
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
                case BUFFER_TYPE.Float:
                case BUFFER_TYPE.Float2:
                case BUFFER_TYPE.Float3:
                case BUFFER_TYPE.Float4:
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
                    break;
                }
                case BUFFER_TYPE.Int:
                {
                    gl.enableVertexAttribArray(this._lastBufferIndex);
                    gl.vertexAttribIPointer(
                        this._lastBufferIndex,
                        el.componentCount(),
                        bufferTypeToGLType(el.type),
                        layout.stride,
                        el.offset
                    );
                    break;
                }
            }
            this._lastBufferIndex++;
        }

        this._vertexBuffers.push(buffer);
        buffer.unbind();
        this.unbind();
    }


    public setVBOData(vertices: readonly number[], index: number)
    {
        const vbo = this._vertexBuffers[index];

        if (vertices.length === vbo.size)
        {
            vbo.setData(vertices)
            return;
        }

        const layout = vbo.layout;
        if (!layout) return;

        vbo.resizeAndSetData(vertices);
        this.bind();
        vbo.bind();

        for (let i = 0; i < layout.elements.length; i++)
        {
            const el = layout.elements[i];
            this.setBufferLayout(layout, el, i);
        }

        vbo.unbind();
        this.unbind();
    }


    public getVertexBuffer(index: number): Readonly<VertexBuffer>
    {
        return this._vertexBuffers[index];
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
