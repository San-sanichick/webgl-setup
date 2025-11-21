import GL from "../GL";
import type { IDisposable } from "@/gfx/utils/types";

import VertexArray from "../vertexArray";
import {
    VertexBuffer, 
    VertexBufferElement,
    VertexBufferLayout
} from "../vertexBuffer";
import { BUFFER_TYPE } from "../utils";




export class GradientStrip implements IDisposable
{
    private vao: VertexArray;

    private vertices: number[] = [];
    private len: number = 0;


    constructor()
    {
        const layout = new VertexBufferLayout([
            new VertexBufferElement("a_pos", BUFFER_TYPE.Float2),
            new VertexBufferElement("a_color", BUFFER_TYPE.Float4),
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


    public setVertices(vertices: number[], len: number): void
    {
        this.vertices = vertices;
        this.len = len;

        this.vao.setVBOData(vertices, 0);
    }


    public draw()
    {
        const gl = GL.get();
        this.vao.bind();

        gl.drawArrays(gl.TRIANGLES, 0, this.len);
        this.vao.unbind();
    }
}
