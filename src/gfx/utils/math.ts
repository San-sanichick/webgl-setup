import { Vector3 } from "threejs-math";

export const EPSILON = 1e-8; // not sure what to consider small enough
export const BIG_EPSILON = 1e-5;

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


export function isZero(val: number): boolean
{
    return Math.abs(val) <= EPSILON;
}

export function greaterThanZero(val: number): boolean
{
    return Math.abs(val) > EPSILON && val > 0;
}

export function lessThanZero(val: number): boolean
{
    return Math.abs(val) > EPSILON && val < 0;
}

export function equalOrLessThanZero(val: number): boolean
{
    const abs = Math.abs(val);
    return abs <= EPSILON || (abs > EPSILON && val < 0)
}
