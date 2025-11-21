export enum BUFFER_TYPE
{
    Float = 0,
    Float2,
    Float3,
    Float4,
    Int,
    Mat3,
}


export function bufferTypeSize(type: BUFFER_TYPE): number
{
    switch (type)
    {
        case BUFFER_TYPE.Float:
            return 4;
        case BUFFER_TYPE.Float2:
            return 8; // 4 * 2
        case BUFFER_TYPE.Float3:
            return 12; // 4 * 3
        case BUFFER_TYPE.Float4:
            return 16; // 4 * 4
        case BUFFER_TYPE.Int:
            return 4;
        case BUFFER_TYPE.Mat3:
            return 4 * (4 * 3);
    }
}


export enum BUFFER_OBJECT_DRAW_MODE
{
    STATIC,
    DYNAMIC,
}


export function getGLDrawMode(gl: WebGL2RenderingContext, mode: BUFFER_OBJECT_DRAW_MODE)
{
    switch (mode)
    {
        case BUFFER_OBJECT_DRAW_MODE.STATIC: return gl.STATIC_DRAW;
        case BUFFER_OBJECT_DRAW_MODE.DYNAMIC: return gl.DYNAMIC_DRAW;
    }
}

