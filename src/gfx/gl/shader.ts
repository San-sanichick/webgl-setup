import type { Matrix4, Vector2, Vector4 } from "threejs-math";
import type TextResource from "../utils/textResource";
import GL from "./GL";
import type { IDisposable } from "../utils/types";


export default class Shader implements IDisposable
{
    private _programId: WebGLProgram | null;


    constructor(vertRes: Readonly<TextResource>, fragRes: Readonly<TextResource>)
    {
        const gl = GL.get();

        const vertId = gl.createShader(gl.VERTEX_SHADER);
        const fragId = gl.createShader(gl.FRAGMENT_SHADER);

        if (!vertId || !fragId)
            throw new Error("Could not create shaders");

        gl.shaderSource(vertId, vertRes.text);
        gl.shaderSource(fragId, fragRes.text);

        gl.compileShader(vertId);
        const vertLog = gl.getShaderInfoLog(vertId);

        gl.compileShader(fragId);
        const fragLog = gl.getShaderInfoLog(fragId);

        if (vertLog)
            throw new Error("Could not compile shader: " + vertLog);

        if (fragLog)
            throw new Error("Could not compile shader: " + fragLog);

        this._programId = gl.createProgram();
        if (!this._programId)
            throw new Error("Could not create program");

        gl.attachShader(this._programId, vertId);
        gl.attachShader(this._programId, fragId);
        gl.linkProgram(this._programId);

        const progLog = gl.getProgramInfoLog(this._programId);
        if (progLog)
            throw new Error(progLog);

        gl.deleteShader(vertId);
        gl.deleteShader(fragId);
    }

    public delete(): void
    {
        GL.get().deleteProgram(this._programId);
    }


    public bind(): void
    {
        GL.get().useProgram(this._programId);
    }

    public unbind(): void
    {
        GL.get().useProgram(null);
    }


    public setUniformFloat(name: string, value: number)
    {
        const gl = GL.get();
        const loc = gl.getUniformLocation(this._programId!, name);
        gl.uniform1f(loc, value);
    }

    public setUniform2f(name: string, value: Readonly<Vector2>)
    {
        const gl = GL.get();
        const loc = gl.getUniformLocation(this._programId!, name);
        gl.uniform2f(loc, value.x, value.y);
    }

    public setUniform4f(name: string, value: Readonly<Vector4>)
    {
        const gl = GL.get();
        const loc = gl.getUniformLocation(this._programId!, name);
        gl.uniform4f(loc, value.x, value.y, value.z, value.w);
    }

    public setUniformMat4(name: string, value: Readonly<Matrix4>)
    {
        const gl = GL.get();
        const loc = gl.getUniformLocation(this._programId!, name);
        gl.uniformMatrix4fv(loc, false, value.toArray());
    }
}
