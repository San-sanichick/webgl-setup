import GL from "./GL";
import type Texture from "./texture";



export default class Framebuffer
{
    private _id: WebGLFramebuffer | null;

    constructor()
    {
        this._id = GL.get().createFramebuffer();
    }


    public delete()
    {
        GL.get().deleteFramebuffer(this._id);
    }

    public attach(texture: Texture, slot: number)
    {
        const gl = GL.get();
        console.assert(slot < 31, "Invalid color attachment slot");

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + slot,
            gl.TEXTURE_2D,
            texture.id,
            0
        );
    }

    public bind()
    {
        const gl = GL.get();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._id);
    }


    public unbind()
    {
        const gl = GL.get();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}
