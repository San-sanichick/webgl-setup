import { Matrix4 } from "threejs-math";
import Camera      from "./camera";



export default class OrthoCamera extends Camera
{
    private _scale: number = 10.0;

    constructor(aspectRatio: number, nearPlane: number, farPlane: number)
    {
        super(aspectRatio, nearPlane, farPlane);
        this.update();
    }


    public override setScale(scale: number)
    {
        this._scale = scale;
    }

    public override getScale(): number
    {
        return this._scale;
    }


    public override update()
    {
        this._view.identity();
        this._view.makeTranslation(this._pos.x, this._pos.y, this._pos.z);
        this._view.multiply(new Matrix4().makeRotationZ(this._angle));

        this._projection.makeOrthographic(
            -this._aspectRatio * this._scale,
             this._aspectRatio * this._scale,
            -this._scale,
             this._scale,
             this._nearPlane,
             this._farPlane
        );
    }
}
