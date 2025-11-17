import type { IDisposable } from "@/gfx/utils/types";
import GL from "../GL";

import VertexArray from "../vertexArray";
import { Matrix3 } from "@/gfx/utils/Matrix3";
import IndexBuffer from "../indexBuffer";

import VertexBuffer, {
    BufferType,
    VertexBufferElement,
    VertexBufferLayout
} from "../vertexBuffer";



export class GradientQuad implements IDisposable
{
    private _vertices: Array<number>;
    private _indices: Array<number> = [
        0, 1, 2,
        2, 3, 0,
    ];

    private vao: VertexArray;

    private _model = new Matrix3();
    private _paintTransform = new Matrix3();


    constructor(left: number, top: number, width: number, height: number)
    {
        this._vertices = [
            // pos                        // UV
            left,         top,            0.0, 0.0,
            left + width, top,            1.0, 0.0,
            left + width, top + height,   1.0, 1.0,
            left,         top + height,   0.0, 1.0,
        ];

        const vb = new VertexBuffer(this._vertices);
        const ib = new IndexBuffer(this._indices);

        const layout = new VertexBufferLayout([
            new VertexBufferElement("a_pos", BufferType.Float2),
            new VertexBufferElement("a_uv", BufferType.Float2),
        ]);

        vb.layout = layout;

        this.vao = new VertexArray();
        this.vao.addVertexBuffer(vb);
        this.vao.setIndexBuffer(ib);

        this._model.identity();
        this._paintTransform
            .identity()
            // .translate(-0.25, 0)
            .scale(1, 1);
    }

    public delete(): void
    {
        this.vao.delete();
    }


    public model()
    {
        return this._model;
    }

    public paintTransform()
    {
        return this._paintTransform;
    }

    public draw(): void
    {
        this.vao.bind();


        const gl = GL.get();
        gl.drawElements(
            gl.TRIANGLES,
            this.vao.getIndexBuffer()!.count,
            gl.UNSIGNED_INT,
            0
        );

        this.vao.unbind();
    }
}
