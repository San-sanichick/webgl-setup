import GL from "../GL";
import type { IDisposable } from "@/gfx/utils/types";
import type Shader from "../shader";
import type Camera from "../camera/camera";
import { Matrix4 } from "threejs-math";

import VertexArray from "../vertexArray";
import VertexBuffer from "../vertexBuffer";
import {
    BufferType,
    VertexBufferElement,
    VertexBufferLayout
} from "../vertexBuffer";




export class Polygon implements IDisposable
{
    private vertices: number[];

    private vao: VertexArray;
    private _model: Matrix4 = new Matrix4();
    private len: number = 0;

    constructor(vertices: number[], len: number)
    {
        this.vertices = vertices;
        this.len = len;

        const layout = new VertexBufferLayout([
            new VertexBufferElement("a_pos", BufferType.Float3),
            new VertexBufferElement("a_klm", BufferType.Float3),
        ]);

        const vbo = new VertexBuffer(this.vertices);
        vbo.layout = layout;

        this.vao = new VertexArray();
        this.vao.addVertexBuffer(vbo);
    }


    public delete(): void
    {
        this.vao.delete();
    }


    public draw(shader: Readonly<Shader>, camera: Readonly<Camera>)
    {
        const gl = GL.get();

        this.vao.bind();

        shader.setUniformMat4("view", camera.view());
        shader.setUniformMat4("projection", camera.projection());

        shader.setUniformMat4("model", this._model);

        gl.drawArrays(gl.TRIANGLES, 0, this.len);

        this.vao.unbind();
    }
}
