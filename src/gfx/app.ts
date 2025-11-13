import {
    Vector4,
    MathUtils as ThreeMathUtils,
    Vector2,
} from "threejs-math";

import GL           from "./gl/GL";
import OrthoCamera  from "./gl/camera/orthoCamera";
import TextResource from "./utils/textResource";
import Shader       from "./gl/shader";
import Quad         from "./gl/primitives/quad";

import { ImageUtils } from "./utils";
import ImageResource  from "./utils/imageResource";
import Texture        from "./gl/texture";

import Vert from "@/assets/shaders/vert.glsl";
import Frag from "@/assets/shaders/frag.glsl"

import PolyVert from "@/assets/shaders/vector/vert.glsl";
import PolyFrag from "@/assets/shaders/vector/frag.glsl";

// @ts-ignore
// import Container from "@/assets/textures/container.jpg?uint8array";
import Font from "@/assets/fonts/font.ttf?uint8array";
import { generateVectorGeometryFromData, VectorDataGenerator } from "./utils/vectorGeometryGenerator";
import { Polygon } from "./gl/primitives/polygon";
import { getFont } from "./utils/font";



export default class App2D
{
    private _canvas: HTMLCanvasElement;
    private _scale: number = 1;


    constructor(canvas: HTMLCanvasElement, width: number, height: number)
    {
        this._canvas = canvas;

        const attrs: WebGLContextAttributes = {
            antialias                   : false,
            powerPreference             : "high-performance",
            alpha                       : false,
            depth                       : false,
            stencil                     : true,
            premultipliedAlpha          : true,
            preserveDrawingBuffer       : false,
            failIfMajorPerformanceCaveat: false
        };

        canvas.width = width;
        canvas.height = height;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("webgl2", attrs)!;
        GL.get(ctx);
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


        const polyVertRes = new TextResource(PolyVert);
        const polyFragRes = new TextResource(PolyFrag);

        const quadVertRes = new TextResource(Vert);
        const quadFragRes = new TextResource(Frag);

        const shaderQuad = new Shader(quadVertRes, quadFragRes);
        const shaderPoly = new Shader(polyVertRes, polyFragRes);

        const font = getFont(Font);


        const width = this._canvas.width;
        const height = this._canvas.height;
        this._canvas.style.width = `${width}px`;
        this._canvas.style.height = `${height}px`;

        const camera = new OrthoCamera(width, height);

        const delta = 1;

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

            const newPos = oldPos.add(new Vector2(dx, dy));

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

            if (e.code === "Escape")
            {
                cancelAnimationFrame(requestId);
                requestId = -1;
                return;
            }

            if (e.code === "KeyW")
            {
                camera.moveTo(curPos.setY(curPos.y + delta));
            }
            if (e.code === "KeyS")
            {
                camera.moveTo(curPos.setY(curPos.y - delta));
            }
            if (e.code === "KeyA")
            {
                camera.moveTo(curPos.setX(curPos.x + delta));
            }
            if (e.code === "KeyD")
            {
                camera.moveTo(curPos.setX(curPos.x - delta));
            }
        });


        const color = new Vector4(0.5, 1.0, 0.3, 1.0);

        const quad = new Quad(0, 0, 1450, 450);


        const fontPath = font.getPath("The quick brown fox jumps over the lazy dog", 0, 150, 20);
        const commands = fontPath.commands;

        const gen = new VectorDataGenerator();
        for (let i = 0; i < commands.length; i++)
        {
            const command = commands[i];

            switch (command.type)
            {
                case "M":
                    gen.moveTo(command.x, command.y);
                    break;
                case "L":
                    gen.lineTo(command.x, command.y);
                    break;
                case "C":
                    gen.cubicTo(command.x, command.y, command.x1, command.y1, command.x2, command.y2);
                    break;
                case "Q":
                    gen.quadTo(command.x, command.y, command.x1, command.y1);
                    break;
                case "Z":
                    gen.close();
                    break;
            }
        }

        // gen
        //     .moveTo(20, 20)
        //     .cubicTo(220, 20, 40, 0, 200, 90)
        //     .lineTo(220, 220)
        //     .cubicTo(20, 220, 200, 200, 40, 200)
        //     .close()
        //     .moveTo(50, 80)
        //     .lineTo(250, 80)
        //     .lineTo(250, 300)
        //     .close();

        // gen
        //     .moveTo(0, 199)
        //     .lineTo(293, 0)
        //     .cubicTo(277, 376, 340.67, 117.33, 384, 330)
        //     .cubicTo(0, 199, 170, 422, 39.33, 266)
        //     .close();

        // gen
        //     .moveTo(20, 20)
        //     .lineTo(220, 20)
        //     .lineTo(220, 220)
        //     .lineTo(20, 220)
        //     .close()
        //     .moveTo(40, 40)
        //     .lineTo(100, 40)
        //     .lineTo(100, 100)
        //     .lineTo(40, 100)
        //     .close()
        //     .moveTo(110, 110)
        //     .lineTo(200, 110)
        //     .lineTo(250, 250)
        //     .lineTo(110, 200)
        //     .close();



        // gen
        //     .moveTo(0, 199)
        //     .lineTo(293, 0)
        //     .lineTo(277, 376)
        //     .lineTo(0, 199)
        //     .close();

        // gen
        //     .moveTo(0, 37.5)
        //     .cubicTo(200, 37.5, 50, -12.5, 150, -12.5)
        //     .lineTo(200, 237.5)
        //     .lineTo(0, 237.5)
        //     .close()
        //     .moveTo(10, 10)
        //     .lineTo(100, 10)
        //     .lineTo(150, 150)
        //     .lineTo(10, 150)
        //     .close();


        const now = performance.now();
        const rows = gen.buildGeometry();
        const [vertices, len] = generateVectorGeometryFromData(rows);
        console.log(performance.now() - now);
        
        const poly = new Polygon(vertices, len);
        poly.model().translate(0, 30);

        // for (let i = 0; i < vertices.length; i += 15)
        // {
        //     console.log("p1", vertices[i], vertices[i + 1])
        //     console.log("p2", vertices[i + 5], vertices[i + 6])
        //     console.log("p3", vertices[i + 10], vertices[i + 11])
        //     console.log("===")
        // }


        let prevTime = 0;


        const draw = (time: number) =>
        {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            gl.clearColor(0.2, 0.3, 0.3, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

            camera.setScale(this._scale);
            camera.update(gl.canvas.width, gl.canvas.height);

            // NOTE: This case might just work with everything, LMAO
            // polygons with holes
            gl.enable(gl.BLEND);
            gl.enable(gl.STENCIL_TEST);
            {
                // draw stencil
                gl.colorMask(false, false, false, false);
                gl.stencilFuncSeparate(gl.FRONT, gl.ALWAYS, 0, 1);
                gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.INVERT, gl.INVERT);
                gl.stencilMaskSeparate(gl.FRONT, 63);

                gl.stencilFuncSeparate(gl.BACK, gl.ALWAYS, 0, 1);
                gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.INVERT, gl.INVERT);
                gl.stencilMaskSeparate(gl.BACK, 63);

                shaderPoly.bind();
                poly.draw(shaderPoly, camera);
                shaderPoly.unbind();
            }

            gl.enable(gl.BLEND);
            {
                // draw cover
                gl.colorMask(true, true, true, true);
                gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                gl.stencilFuncSeparate(gl.FRONT_AND_BACK, gl.NOTEQUAL, 0, 1);
                gl.stencilOpSeparate(gl.FRONT_AND_BACK, 0, 0, 0);
                gl.stencilMaskSeparate(gl.FRONT_AND_BACK, 63);

                shaderQuad.bind();
                shaderQuad.setUniform4f("color", color);
                quad.draw(shaderQuad, camera);
                shaderQuad.unbind();
            }

            // polygons with curves
            // gl.enable(gl.BLEND);
            // gl.enable(gl.STENCIL_TEST);
            // {
            //     // draw stencil
            //     gl.colorMask(false, false, false, false);
            //     gl.stencilFuncSeparate(gl.FRONT, gl.ALWAYS, 0, 63);
            //     gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.INCR_WRAP, gl.INCR_WRAP);
            //     gl.stencilMaskSeparate(gl.FRONT, 63);
            //
            //     gl.stencilFuncSeparate(gl.BACK, gl.ALWAYS, 0, 63);
            //     gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.DECR_WRAP, gl.DECR_WRAP);
            //     gl.stencilMaskSeparate(gl.BACK, 63);
            //
            //     shaderPoly.bind();
            //     poly.draw(shaderPoly, camera);
            //     shaderPoly.unbind();
            // }
            //
            // gl.enable(gl.BLEND);
            // {
            //     // draw cover
            //     gl.colorMask(true, true, true, true);
            //     gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            //     gl.stencilFuncSeparate(gl.FRONT_AND_BACK, gl.NOTEQUAL, 0, 63);
            //     gl.stencilOpSeparate(gl.FRONT_AND_BACK, 0, 0, 0);
            //     gl.stencilMaskSeparate(gl.FRONT_AND_BACK, 63);
            //
            //     shaderQuad.bind();
            //     shaderQuad.setUniform4f("color", color);
            //     quad.draw(shaderQuad, camera);
            //     shaderQuad.unbind();
            // }

            gl.disable(gl.STENCIL_TEST);
            gl.stencilFuncSeparate(gl.FRONT_AND_BACK, gl.ALWAYS, 0, 0);
            gl.stencilOpSeparate(gl.FRONT_AND_BACK, gl.KEEP, gl.KEEP, gl.KEEP);
            gl.stencilMaskSeparate(gl.FRONT_AND_BACK, 255);

            prevTime = time;
            requestId = requestAnimationFrame(draw);
        }

        draw(0);
    }
}
