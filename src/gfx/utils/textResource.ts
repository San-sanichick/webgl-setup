export default class TextResource
{
    private _text: string;

    constructor(text: string)
    {
        this._text = text;
    }

    public get text(): string
    {
        return this._text;
    }
}
