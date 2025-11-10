import Camera      from "./camera";



export default class OrthoCamera extends Camera
{
    private _scale: number = 10.0;


    constructor(width: number, height: number)
    {
        super(width, height);
        this.update(width, height);
    }


    public override setScale(scale: number)
    {
        this._scale = scale;
    }

    public override getScale(): number
    {
        return this._scale;
    }


    public override update(width: number, height: number)
    {
        this._width = width;
        this._height = height;

        this._projection
            .set(
                2 / this._width, 0, 0,
                0, -(2 / this._height), 0,
                -1, 1, 1,
            )

        this._view
            .identity()
            .scale(this._scale, this._scale)
            .translate(-this._pos.x, -this._pos.y)
    }
}
