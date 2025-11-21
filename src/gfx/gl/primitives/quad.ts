import type { IDisposable } from "@/gfx/utils/types";

import {
    VertexBuffer, 
    VertexBufferElement,
    VertexBufferLayout
} from "../vertexBuffer";

import GL          from "../GL";
import { Matrix3 } from "@/gfx/utils/Matrix3";
import IndexBuffer from "../indexBuffer";
import VertexArray from "../vertexArray";
import { BUFFER_TYPE } from "../utils";



export default class Quad implements IDisposable
{
    private _vertices: Array<number>;
    private _indices: Array<number> = [
        0, 1, 3,
        1, 2, 3
    ];

    private vao: VertexArray;

    private _model: Matrix3 = new Matrix3();


    constructor(left: number, top: number, width: number, height: number)
    {
        this._vertices = [
            // pos                        // UV
            left + width, top,            width, 0.0,
            left + width, top + height,   width, height,
            left,         top + height,   0.0, height,
            left,         top,            0.0, 0.0,
        ];

        const vb = new VertexBuffer(this._vertices);
        const ib = new IndexBuffer(this._indices);

        const layout = new VertexBufferLayout([
            new VertexBufferElement("aPos", BUFFER_TYPE.Float2),
            new VertexBufferElement("aUV", BUFFER_TYPE.Float2),
        ]);

        vb.layout = layout;

        this.vao = new VertexArray();
        this.vao.addVertexBuffer(vb);
        this.vao.setIndexBuffer(ib);

        this._model.identity();
    }

    public delete(): void
    {
        this.vao.delete();
    }


    public model()
    {
        return this._model;
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
