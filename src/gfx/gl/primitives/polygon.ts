import GL from "../GL";
import type { IDisposable } from "@/gfx/utils/types";
import type Shader from "../shader";
import type Camera from "../camera/camera";

import VertexArray from "../vertexArray";
import VertexBuffer from "../vertexBuffer";
import {
    BufferType,
    VertexBufferElement,
    VertexBufferLayout
} from "../vertexBuffer";
import { Matrix3 } from "@/gfx/utils/Matrix3";




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
            new VertexBufferElement("a_pos", BufferType.Float2),
            new VertexBufferElement("a_klm", BufferType.Float3),
        ]);

        const vbo = new VertexBuffer(this.vertices);
        vbo.layout = layout;

        this.vao = new VertexArray();
        this.vao.addVertexBuffer(vbo);
    }


    public model()
    {
        return this._model;
    }


    public delete(): void
    {
        this.vao.delete();
    }


    public draw(shader: Readonly<Shader>, camera: Readonly<Camera>)
    {
        const gl = GL.get();

        this.vao.bind();

        shader.setUniformMat3("view", camera.view());
        shader.setUniformMat3("projection", camera.projection());

        shader.setUniformMat3("model", this._model);

        gl.drawArrays(gl.TRIANGLES, 0, this.len);

        this.vao.unbind();
    }
}
