import type { Matrix4, Vector2, Vector4 } from "threejs-math";
import type TextResource from "../utils/textResource";
import GL from "./GL";


export default class Shader
{
    private _programId: WebGLProgram | null;
    private _vertId: WebGLShader | null;
    private _fragId: WebGLShader | null;


    constructor(vertRes: Readonly<TextResource>, fragRes: Readonly<TextResource>)
    {
        const gl = GL.get();

        this._vertId = gl.createShader(gl.VERTEX_SHADER);
        this._fragId = gl.createShader(gl.FRAGMENT_SHADER);

        if (!this._vertId || !this._fragId)
            throw new Error("Could not create shader");

        gl.shaderSource(this._vertId, vertRes.text);
        gl.shaderSource(this._fragId, fragRes.text);

        gl.compileShader(this._vertId);
        const vertLog = gl.getShaderInfoLog(this._vertId);
        if (vertLog) console.log(vertLog);
        
        gl.compileShader(this._fragId);
        const fragLog = gl.getShaderInfoLog(this._fragId);
        if (fragLog) console.log(fragLog);

        if (vertLog || fragLog) throw new Error("Error during shader compilation");

        this._programId = gl.createProgram();
        if (!this._programId) throw new Error("Could not create program");

        gl.attachShader(this._programId, this._vertId);
        gl.attachShader(this._programId, this._fragId);
        gl.linkProgram(this._programId);

        const progLog = gl.getProgramInfoLog(this._programId);
        if (progLog)
        {
            console.log(progLog);
            throw new Error(progLog);
        }

        gl.deleteShader(this._vertId);
        gl.deleteShader(this._fragId);
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
