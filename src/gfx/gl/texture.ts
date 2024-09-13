import ImageResource from "../utils/imageResource";
import GL from "./GL";

// I love javascript, I hope the WebGL spec doesn't change these number, istg
export enum TextureMode
{
    RGB = 0x1907,
    RGBA = 0x1908,
}

export enum TextureWrapping
{
    Repeat = 0x2901,
    Mirror = 0x8370,
    ClampToEdge = 0x812F,
}


export enum TextureFiltering
{
    Linear   = 0x2600,
    Nearest  = 0x2601,
    MipmapNN = 0x2700,
    MipmapLN = 0x2701,
    MipmapNL = 0x2702,
    MipmapLL = 0x2703,
}

export interface TextureSpec
{
    sourceMode: TextureMode;
    storeMode : TextureMode;

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

    constructor(spec: Readonly<TextureSpec>);
    constructor(res: Readonly<ImageResource>);
    constructor(source: Readonly<TextureSpec | ImageResource>)
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

            let sourceMode = TextureMode.RGBA;
            let storeMode  = TextureMode.RGBA;

            if (source.channels === 3)
            {
                sourceMode = TextureMode.RGB;
                storeMode  = TextureMode.RGB;
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
            const spec = source as Readonly<TextureSpec>;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, spec.wrapS);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, spec.wrapT);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, spec.min);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, spec.mag);

            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                spec.sourceMode,
                spec.width,
                spec.height,
                0,
                spec.storeMode,
                gl.UNSIGNED_BYTE,
                null
            );

            gl.generateMipmap(gl.TEXTURE_2D);
        }
    }


    public get id()
    {
        return this._id;
    }


    public bind(slot: number): void
    {
        console.assert(slot < 31, "Slot greater than 31");
        const gl = GL.get();

        gl.activeTexture(gl.TEXTURE0 + slot);
        gl.bindTexture(gl.TEXTURE_2D, this._id);
    }
}
