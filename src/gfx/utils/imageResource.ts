type ImageChannels = 3 | 4;

export default class ImageResource
{
    private _data: HTMLImageElement;
    private _channels: number;

    constructor(data: Readonly<HTMLImageElement>, channels: ImageChannels)
    {
        this._data     = data;
        this._channels = channels;
    }

    public get width(): number
    {
        return this._data.width;
    }

    public get height(): number
    {
        return this._data.height;
    }

    public get channels(): number
    {
        return this._channels;
    }

    public get data(): Readonly<HTMLImageElement>
    {
        return this._data;
    }
}
