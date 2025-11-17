import {
    Vector4,
    Vector2,
} from "threejs-math";

import GL           from "./gl/GL";
import OrthoCamera  from "./gl/camera/orthoCamera";
import TextResource from "./utils/textResource";
import Shader       from "./gl/shader";
import Quad         from "./gl/primitives/quad";


// import Vert from "@/assets/shaders/vert.glsl";
// import Frag from "@/assets/shaders/frag.glsl"
import Vert from "@/assets/shaders/gradient/2d/vert.glsl";
import Frag from "@/assets/shaders/gradient/2d/frag.glsl";

import PolyVert from "@/assets/shaders/vector/vert.glsl";
import PolyFrag from "@/assets/shaders/vector/frag.glsl";

// @ts-ignore
import Font from "@/assets/fonts/font.ttf?uint8array";
import { Polygon } from "./gl/primitives/polygon";
import { getFont } from "./utils/font";

import {
    generateVectorGeometryFromData,
    VectorDataGenerator
} from "./utils/vectorGeometryGenerator";
import { GradientGenerator, type GradientStop } from "./gl/gradient/gradientGenerator";
import { GradientQuad } from "./gl/primitives/gradientQuad";



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

        // @ts-ignore
        // const ctx = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl2"));
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

        // const quad = new Quad(0, 0, 1450, 450);
        const quad = new GradientQuad(0, 0, 400, 400);


        const gen = new VectorDataGenerator();
        // const fontPath = font.getPath("The quick brown fox jumps over the lazy dog", 0, 150, 20);
        // const commands = fontPath.commands;
        //
        // for (let i = 0; i < commands.length; i++)
        // {
        //     const command = commands[i];
        //
        //     switch (command.type)
        //     {
        //         case "M":
        //             gen.moveTo(command.x, command.y);
        //             break;
        //         case "L":
        //             gen.lineTo(command.x, command.y);
        //             break;
        //         case "C":
        //             gen.cubicTo(command.x, command.y, command.x1, command.y1, command.x2, command.y2);
        //             break;
        //         case "Q":
        //             gen.quadTo(command.x, command.y, command.x1, command.y1);
        //             break;
        //         case "Z":
        //             gen.close();
        //             break;
        //     }
        // }

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

        gen
            .moveTo(0, 199)
            .lineTo(293, 0)
            .cubicTo(277, 376, 340.67, 117.33, 384, 330)
            .cubicTo(0, 199, 170, 422, 39.33, 266)
            .close();



        const now = performance.now();
        const rows = gen.buildGeometry();
        const [vertices, len] = generateVectorGeometryFromData(rows);
        console.log(performance.now() - now);
        
        const poly = new Polygon(vertices, len);
        // poly.model().scale(1, -1).translate(0, -200);

        // for (let i = 0; i < vertices.length; i += 15)
        // {
        //     console.log("p1", vertices[i], vertices[i + 1])
        //     console.log("p2", vertices[i + 5], vertices[i + 6])
        //     console.log("p3", vertices[i + 10], vertices[i + 11])
        //     console.log("===")
        // }


        const gradientGen = new GradientGenerator();
        const stops: GradientStop[] = [
            {
                position: 0,
                color: [1, 0, 0, 1],
            },
            // {
            //     position: 0.25,
            //     color: [0.25, 0.8, 0, 1],
            // },
            {
                position: 0.5,
                color: [0, 0, 1, 1],
            },
            {
                position: 1,
                color: [0, 1, 0, 1],
            },
        ];

        const gradientStripTexture = GradientGenerator.getTexture();
        gradientGen.generateGradient(gradientStripTexture, stops);

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
                shaderPoly.setUniformMat3("view", camera.view());
                shaderPoly.setUniformMat3("projection", camera.projection());
                shaderPoly.setUniformMat3("model", poly.model());

                poly.draw();
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
                // shaderQuad.setUniform4f("color", color);
                shaderQuad.setUniformInt("u_gradient_type", 1);

                shaderQuad.setUniformMat3("view", camera.view());
                shaderQuad.setUniformMat3("projection", camera.projection());
                shaderQuad.setUniformMat3("model", quad.model());
                shaderQuad.setUniformMat3("u_paint_transform", quad.paintTransform());

                quad.draw();
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
