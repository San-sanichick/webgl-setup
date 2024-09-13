import { Matrix4, Vector3 } from "threejs-math";
import Camera      from "./camera";



export default class OrthoCamera extends Camera
{
    private _scale: number = 10.0;
    // private _dir: Vector3 = new Vector3(0.0, 0.0, -5.0);
    // private _up: Vector3 = new Vector3(0.0, 1.0, 0.0);
    // private _right: Vector3 = new Vector3(1.0, 0.0, 0.0);

    constructor(width: number, height: number, nearPlane: number, farPlane: number)
    {
        super(width, height, nearPlane, farPlane);
        this.update();
    }


    public override setScale(scale: number)
    {
        this._scale = scale;

        const RATIO = this._scale;
        // this._projection.makeOrthographic(
        //     0.0 * RATIO,
        //     this._width * RATIO,
        //     0.0 * RATIO,
        //     this._height * RATIO,
        //     this._nearPlane,
        //     this._farPlane
        // );
        this._projection.makeOrthographic(
            -this._aspectRatio * RATIO,
             this._aspectRatio * RATIO,
            -RATIO,
             RATIO,
             this._nearPlane,
             this._farPlane
        );
    }

    public override getScale(): number
    {
        return this._scale;
    }


    public override update()
    {
        // const hw = this._width / 2;
        // const hh = this._height / 2;
        // const offset = new Vector3(-hw * this._scale, -hh * this._scale, 0);
        //
        // const finalPos = this._pos.clone().add(offset);
        //
        // this._up.crossVectors(this._right, this._dir);

        this._view.identity();
        // this._view.lookAt(finalPos, finalPos.add(this._dir), this._up);
        this._view.makeTranslation(this._pos.x * this._scale, this._pos.y * this._scale, this._pos.z);
        this._view.multiply(new Matrix4().makeRotationZ(this._angle));
        // this._view.scale(new Vector3(100));

    }
}
