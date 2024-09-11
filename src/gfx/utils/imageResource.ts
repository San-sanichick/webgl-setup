
type ImageChannels = 3 | 4;

export default class ImageResource
{
    private _data: ImageData;
    private _channels: number;

    constructor(data: Uint8Array, channels: ImageChannels)
    {
        const clamped = new Uint8ClampedArray(data);
        this._data    = new ImageData(clamped, 200);

        this._channels = channels;
    }

    public get width()
    {
        return this._data.width;
    }

    public get height()
    {
        return this._data.height;
    }

    public get channels()
    {
        return this._channels;
    }

    public get data()
    {
        return this._data;
    }
}
