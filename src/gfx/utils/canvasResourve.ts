export default class CanvasResource
{
    private canvas: HTMLCanvasElement;
    private _channels: number;

    constructor(canvas: HTMLCanvasElement)
    {
        this.canvas = canvas;
        this._channels = 4;
    }

    public get width(): number
    {
        return this.canvas.width;
    }

    public get height(): number
    {
        return this.canvas.height;
    }

    public get channels(): number
    {
        return this._channels;
    }

    public get data(): Readonly<HTMLCanvasElement>
    {
        return this.canvas;
    }
}
