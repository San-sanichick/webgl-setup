import type { IDisposable } from "@/gfx/utils/types";

import VertexBuffer, {
    BufferType,
    VertexBufferElement,
    VertexBufferLayout
} from "../vertexBuffer";

import GL          from "../GL";
import type Camera from "../camera/camera";
import type Shader from "../shader";
import { Matrix3 } from "@/gfx/utils/Matrix3";
import IndexBuffer from "../indexBuffer";
import VertexArray from "../vertexArray";


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
            new VertexBufferElement("aPos", BufferType.Float2),
            new VertexBufferElement("aUV", BufferType.Float2),
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


    public draw(shader: Readonly<Shader>, camera: Readonly<Camera>): void
    {
        this.vao.bind();

        shader.setUniformMat3("view", camera.view());
        shader.setUniformMat3("projection", camera.projection());

        shader.setUniformMat3("model", this._model);

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
