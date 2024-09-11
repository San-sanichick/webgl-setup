type ImageChannels = 3 | 4;

export default class ImageResource
{
    private _data: ImageData;
    private _channels: number;

    constructor(data: ImageData, channels: ImageChannels)
    {
        this._data     = data;
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
