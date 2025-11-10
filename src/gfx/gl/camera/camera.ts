import { Matrix3 } from "@/gfx/utils/Matrix3";
import { Vector2 } from "threejs-math";


export default abstract class Camera
{
    protected _width: number;
    protected _height: number;

    protected _projection: Matrix3 = new Matrix3();
    protected _view: Matrix3 = new Matrix3();

    protected _pos: Vector2;


    constructor(width: number, height: number)
    {
        this._width = width;
        this._height = height;

        this._pos = new Vector2(0.0, 0.0);

        this._projection.identity();
        this._view.identity();
    }


    public view()
    {
        return this._view;
    }

    public projection()
    {
        return this._projection;
    }

    public getCurPos(): Readonly<Vector2>
    {
        return this._pos;
    }


    public moveTo(pos: Readonly<Vector2>)
    {
        this._pos = pos;
    }


    abstract setScale(scale: number): void;
    abstract getScale(): number;


    abstract update(width: number, height: number): void;
}
