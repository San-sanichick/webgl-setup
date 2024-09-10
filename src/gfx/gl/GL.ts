export default class GL
{
    private static gl: WebGL2RenderingContext;

    private constructor() {}

    public static get(ctx?: WebGL2RenderingContext): WebGL2RenderingContext
    {
        if (!this.gl && ctx)
            this.gl = ctx;

        return this.gl;
    }
}
