import { Matrix4, Vector3 } from "threejs-math";


export default abstract class Camera
{
    protected _projection: Matrix4 = new Matrix4();
    protected _view: Matrix4 = new Matrix4();
    protected _pos: Vector3;
    protected _axis: Vector3 = new Vector3();
    protected _angle: number = 0;

    protected _aspectRatio: number;
    protected _nearPlane: number;
    protected _farPlane: number;


    constructor(aspectRatio: number, nearPlane: number, farPlane: number)
    {
        this._aspectRatio = aspectRatio;
        this._nearPlane = nearPlane;
        this._farPlane = farPlane;

        this._pos = new Vector3(0.0, 0.0, -3.0);
    }


    public view()
    {
        return this._view;
    }

    public projection()
    {
        return this._projection;
    }

    public getCurPos(): Readonly<Vector3>
    {
        return this._pos;
    }

    public getCurAngle(): number
    {
        return this._angle;
    }


    public moveTo(pos: Readonly<Vector3>)
    {
        this._pos = pos;
    }

    public rotateTo(angle: number)
    {
        this._angle = angle;
    }


    abstract setScale(scale: number): void;
    abstract getScale(): number;


    abstract update(): void;
}
