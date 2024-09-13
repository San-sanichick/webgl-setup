import { Vector3 } from "threejs-math";

const TO_RADIANS = Math.PI / 180;


export function toRadians(angle: number)
{
    return angle * TO_RADIANS;
}



export function clamp(val: number, min: number, max: number): number
{
    return Math.max(Math.min(val, max), min);
}



export function screenToWorldSpace(point: Vector3, scale: number, offsetX: number, offsetY: number): Vector3
{
    const coeff = 1 / scale;

    return new Vector3(
        coeff * point.x - offsetX,
        coeff * point.y - offsetY,
        point.z
    );
}
