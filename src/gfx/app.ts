import {
    Vector4,
    MathUtils as ThreeMathUtils,
    Vector2,
    Vector3
} from "threejs-math";

import GL           from "./gl/GL";
import OrthoCamera  from "./gl/camera/orthoCamera";
import TextResource from "./utils/textResource";
import Shader       from "./gl/shader";
import Quad         from "./gl/primitives/quad";

import { ImageUtils } from "./utils";
import ImageResource    from "./utils/imageResource";
import Texture, { TextureFiltering, TextureMode, TextureWrapping }          from "./gl/texture";

import Vert from "@/assets/shaders/vert.glsl";
import Frag from "@/assets/shaders/frag.glsl"

// @ts-ignore
import Container from "@/assets/textures/container.jpg?uint8array";
import Framebuffer from "./gl/framebuffer";




export default class App2D
{
    private _canvas: HTMLCanvasElement;
    private _scale: number = 1;


    constructor(canvas: HTMLCanvasElement, width: number, height: number)
    {
        this._canvas = canvas;

        const attrs: WebGLContextAttributes = {
            antialias                   : true,
            powerPreference             : "default",
            alpha                       : false,
            depth                       : false,
            stencil                     : false,
            premultipliedAlpha          : true,
            preserveDrawingBuffer       : false,
            failIfMajorPerformanceCaveat: false
        }

        canvas.width = width;
        canvas.height = height;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("webgl2", attrs)!;
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


    public async run()
    {
        const gl = GL.get();
        let requestId: number;
        

        const vertRes = new TextResource(Vert);
        const fragRes = new TextResource(Frag);

        const data = await ImageUtils.getImageData(Container);
        const texRes = new ImageResource(data, 3);

        const shader = new Shader(vertRes, fragRes);
        const texture = new Texture(texRes);
        texture.bind(0);

        const left = -0.5;
        const top  = 0.5;
        const w = 1;
        const h = 1;

        const quad = new Quad(left, top, w, h);

        const width = this._canvas.width;
        const height = this._canvas.height;

        const camera = new OrthoCamera(width, height, -100, 100);

        const delta = 1;
        const angleDelta = ThreeMathUtils.degToRad(5);

        // let oldX = width / 2;
        // let oldY = height / 2;

        let drag = false;

        let oldX = 0;
        let oldY = 0;
        this._canvas.addEventListener("mousedown", (e: MouseEvent) =>
        {
            drag = true;
            oldX = e.clientX;
            oldY = e.clientY;
        })

        this._canvas.addEventListener("mouseup", () =>
        {
            drag = false;
        })

        const maxScale = 19;

        this._canvas.addEventListener("mousemove", (e: MouseEvent) =>
        {
            if (!drag) return;

            const cx = e.clientX;
            const cy = e.clientY;

            const oldPos = camera.getCurPos();
            const dx = (cx - oldX) / (width);
            const dy = (cy - oldY) / (height);

            const newPos = oldPos.add(new Vector3(dx, dy, 0.0));

            camera.moveTo(newPos);

            oldX = cx;
            oldY = cy;
        });


        document.addEventListener("wheel", (e: WheelEvent) =>
        {
            const oldScale = this._scale;
            const delta = e.deltaY / 100;

            this._scale += delta;

            if (this._scale === 0)
                this._scale = oldScale;
        });

        document.addEventListener("keydown", (e: KeyboardEvent) =>
        {
            const curPos = camera.getCurPos();
            const angle = camera.getCurAngle();

            if (e.code === "Escape")
            {
                cancelAnimationFrame(requestId);
                requestId = -1;
                return;
            }

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
            
            console.log(curPos.x, curPos.y);
        });


        const color = new Vector4(0.5, 1.0, 0.3, 1.0);
        const cRadius = 0.5;
        const cCenter = new Vector2(w / 2, h / 2);

        // const drawTexture = new Texture({
        //     width: width,
        //     height: height,
        //     sourceMode: TextureMode.RGBA,
        //     storeMode: TextureMode.RGBA,
        //     wrapS: TextureWrapping.ClampToEdge,
        //     wrapT: TextureWrapping.ClampToEdge,
        //     min: TextureFiltering.Linear,
        //     mag: TextureFiltering.Nearest,
        // });
        //
        // const framebuffer = new Framebuffer();
        // framebuffer.attach(drawTexture, 0);


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
