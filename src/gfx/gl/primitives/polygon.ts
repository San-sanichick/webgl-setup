import GL from "../GL";
import type { IDisposable } from "@/gfx/utils/types";

import VertexArray from "../vertexArray";
import {VertexBuffer} from "../vertexBuffer";
import {
    VertexBufferElement,
    VertexBufferLayout
} from "../vertexBuffer";
import { Matrix3 } from "@/gfx/utils/Matrix3";
import { BUFFER_TYPE } from "../utils";




export class Polygon implements IDisposable
{
    private vertices: number[];

    private vao: VertexArray;
    private _model: Matrix3 = new Matrix3();
    private len: number = 0;

    constructor(vertices: number[], len: number)
    {
        this.vertices = vertices;
        this.len = len;

        const layout = new VertexBufferLayout([
            new VertexBufferElement("a_pos", BUFFER_TYPE.Float2),
            new VertexBufferElement("a_klm", BUFFER_TYPE.Float3),
        ]);

        const vbo = new VertexBuffer(this.vertices);
        vbo.layout = layout;

        this.vao = new VertexArray();
        this.vao.addVertexBuffer(vbo);
    }

    public setData(vertices: number[], len: number): void
    {
        this.len = len;
        this.vao.setVBOData(vertices, 0);
    }

    public model()
    {
        return this._model;
    }


    public delete(): void
    {
        this.vao.delete();
    }


    public draw()
    {
        const gl = GL.get();

        this.vao.bind();

        gl.drawArrays(gl.TRIANGLES, 0, this.len);

        this.vao.unbind();
    }
}
