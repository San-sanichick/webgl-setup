import ImageResource from "../utils/imageResource";
import GL from "./GL";

// I love javascript, this probably won't work
enum ImageMode
{
    RGB = GL.get().RGB,
    RGBA = GL.get().RGBA,
}

enum TextureWrapping
{
    Repeat = GL.get().REPEAT,
    Mirror = GL.get().MIRRORED_REPEAT,
    ClampToEdge = GL.get().CLAMP_TO_EDGE,
}

enum TextureFiltering
{
    Linear   = GL.get().LINEAR,
    Nearest  = GL.get().NEAREST,
    MipmapNN = GL.get().NEAREST_MIPMAP_NEAREST,
    MipmapLN = GL.get().LINEAR_MIPMAP_NEAREST,
    MipmapNL = GL.get().NEAREST_MIPMAP_LINEAR,
    MipmapLL = GL.get().LINEAR_MIPMAP_LINEAR,
}

interface TextureSpec
{
    sourceMode: ImageMode;
    storeMode : ImageMode;

    width: number;
    height: number;

    wrapS: TextureWrapping;
    wrapT: TextureWrapping;

    min: TextureFiltering;
    mag: TextureFiltering;
}


export default class Texture
{
    private _id: WebGLTexture | null;

    constructor(spec: TextureSpec);
    constructor(res: ImageResource);
    constructor(source: TextureSpec | ImageResource)
    {
        const gl = GL.get();

        this._id = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this._id);

        if (source instanceof ImageResource)
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            let sourceMode = ImageMode.RGBA;
            let storeMode  = ImageMode.RGBA;

            if (source.channels === 3)
            {
                sourceMode = ImageMode.RGB;
                storeMode  = ImageMode.RGB;
            }
            
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                sourceMode,
                source.width,
                source.height,
                0,
                storeMode,
                gl.UNSIGNED_BYTE,
                source.data
            );

            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, source.wrapS);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, source.wrapT);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, source.min);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, source.mag);

            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                source.sourceMode,
                source.width,
                source.height,
                0,
                source.storeMode,
                gl.UNSIGNED_BYTE,
                null
            );

            gl.generateMipmap(gl.TEXTURE_2D);
        }
    }


    public bind(slot: number): void
    {
        console.assert(slot < 31, "Slot greater than 31");
        const gl = GL.get();

        gl.activeTexture(gl.TEXTURE0 + slot);
        gl.bindTexture(gl.TEXTURE_2D, this._id);
    }
}
