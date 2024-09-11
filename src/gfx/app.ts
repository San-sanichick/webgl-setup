import { Vector4, MathUtils, Vector2 } from "threejs-math";
// import WebGLDebugUtils        from "webgl-debug";

import GL           from "./gl/GL";
import OrthoCamera  from "./gl/camera/orthoCamera";
import TextResource from "./utils/textResource";
import Shader       from "./gl/shader";
import Quad         from "./gl/primitives/quad";

import Vert from "@/assets/shaders/vert.glsl";
import Frag from "@/assets/shaders/frag.glsl"




export default class App2D
{
    private _canvas: HTMLCanvasElement;
    private _scale: number = 10;


    constructor(canvas: HTMLCanvasElement)
    {
        this._canvas = canvas;
        const ctx = canvas.getContext("webgl2")!;
        // const gl = GL.get(WebGLDebugUtils.makeDebugContext(ctx));
        const gl = GL.get(ctx);
        gl.viewport(0, 0, canvas.width, canvas.height);
    }


    public get scale()
    {
        return this._scale;
    }

    public set scale(val: number)
    {
        this._scale = val;
    }


    public run()
    {
        const gl = GL.get();
        let requestId: number;
        

        const vertRes = new TextResource(Vert);
        const fragRes = new TextResource(Frag);

        const shader = new Shader(vertRes, fragRes);
        
        const left = -2;
        const top = 2;
        const w = 4;
        const h = 4;

        const quad = new Quad(left, top, w, h);

        const width = this._canvas.width;
        const height = this._canvas.height;
        const aspectRatio = width / height;

        const camera = new OrthoCamera(aspectRatio, -1000, 1000);

        const delta = 1;
        const angleDelta = MathUtils.degToRad(5);

        document.addEventListener("keydown", (e: KeyboardEvent) =>
        {
            const curPos = camera.getCurPos();
            const angle = camera.getCurAngle();

            if (e.code === "KeyQ")
            {
                camera.rotateTo(angle - angleDelta);
            }
            if (e.code === "KeyE")
            {
                camera.rotateTo(angle + angleDelta);
            }

            if (e.code === "KeyW")
            {
                console.log(e.code);
                camera.moveTo(curPos.setY(curPos.y - delta));
            }
            if (e.code === "KeyS")
            {
                camera.moveTo(curPos.setY(curPos.y + delta));
            }
            if (e.code === "KeyA")
            {
                camera.moveTo(curPos.setX(curPos.x - delta));
            }
            if (e.code === "KeyD")
            {
                camera.moveTo(curPos.setX(curPos.x + delta));
            }
        });


        const color = new Vector4(0.5, 1.0, 0.3, 1.0);
        const cRadius = w / 4;
        const cCenter = new Vector2(w / 2, h / 2);

        const draw = () =>
        {
            gl.clearColor(0.2, 0.3, 0.3, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            camera.setScale(this._scale);
            camera.update();

            quad.draw(shader, camera);
            shader.setUniform2f("cCenter", cCenter);
            shader.setUniformFloat("cRadius", cRadius);
            shader.setUniform4f("color", color);
            requestId = requestAnimationFrame(draw);
        }

        draw();
    }
}
