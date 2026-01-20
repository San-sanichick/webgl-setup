import GL           from "./gl/GL";
import OrthoCamera  from "./gl/camera/orthoCamera";
import TextResource from "./utils/textResource";
import Shader       from "./gl/shader";

import parseSVG from "svg-path-parser";

// import Quad         from "./gl/primitives/quad";
import { Polygon } from "./gl/primitives/polygon";
import { GradientQuad } from "./gl/primitives/gradientQuad";


// import Vert from "@/assets/shaders/vert.glsl";
// import Frag from "@/assets/shaders/frag.glsl"
import Vert from "@/assets/shaders/gradient/2d/vert.glsl";
import Frag from "@/assets/shaders/gradient/2d/frag.glsl";

import PolyVert from "@/assets/shaders/vector/vert.glsl";
import PolyFrag from "@/assets/shaders/vector/frag.glsl";

// @ts-ignore
import Font from "@/assets/fonts/font.ttf?uint8array";
import { getFont } from "./utils/font";

import {
    triangulateVectorGeometryFromData,
    // VectorDataGenerator
} from "./utils/vectorGeometryGenerator";
import { VectorDataGenerator } from "./utils/newVectorGeometryGenerator";
import { GradientGenerator, type GradientStop } from "./gl/gradient/gradientGenerator";

// import Commands from "@/assets/commands.json" with { type: "json" }
//
//
// const frames = Commands as parseSVG.Command[][][];


export default class App2D
{
    private _canvas: HTMLCanvasElement;
    private _scale: number = 2.6;


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

        document.body.addEventListener("wheel", (e: WheelEvent) =>
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

            if (e.code === "Escape" || e.code === "KeyQ")
            {
                cancelAnimationFrame(requestId);
                // video?.pause();
                requestId = -1;
                return;
            }

            if (e.code === "KeyF")
            {
                draw(frametime, true);
            }

            if (e.code === "KeyB")
            {
                frameIndex -= 2;
                draw(frametime, true);
            }

            if (e.code === "KeyP")
            {
                // video?.play();
                draw(frametime);
                // requestAnimationFrame(draw);
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




        const gen = new VectorDataGenerator();
        // console.log(Commands);

        // const font = getFont(Font);
        // const fontPath = font.getPath("The quick brown fox jumps over the lazy dog", 0, 150, 20);
        // const commands = fontPath.commands;
        // const commands = [parseSVG.parseSVG("M136.3 8.1c-5 2.1-6.2 5.1-4.3 11.2 1.1 3.7 1 4.3-.5 5.2-9.6 5.6-15.7 13.9-17 23-.4 2.7-1.1 5.7-1.6 6.7-.6 1.1-.4 1.8.6 2.2.8.3 1.5 1.5 1.5 2.6 0 1.2.6 2.7 1.3 3.4 2 2 8 5 9.5 4.8 1.5-.3 1.6 3.2.2 5.9-.9 1.6-.3 2.7 3.5 6.6 4.1 4.3 4.6 5.3 4.4 8.8-.2 2.3.1 4.6.5 5.3s.5 1.9.2 2.7-.1 1.7.3 2c2 1.1 2.3 7.8.5 11.6-1.5 3.4-2 3.7-4.5 3.2-4-.8-5.9 1-5.2 5.2.5 2.9 0 3.9-3.3 7.5-3.9 4.1-3.9 4.1-7.4 2.7-1.9-.8-7.8-2.8-13-4.3s-10-3.5-10.6-4.3c-.7-.9-1.4-3.9-1.6-6.8-.3-3.8-1.1-6-2.9-7.9-2.1-2.3-3-2.5-7.1-2-4.4.5-4.8.3-4.9-1.7-.1-2.1-.1-2.1-.8.1-.4 1.5-2.3 3.2-5 4.5-5.2 2.6-7.8 7.8-6.1 12.3.6 1.4 1 3.6 1 4.8s1.7 4.1 3.8 6.3c2.9 3.1 4.9 4.2 9.4 5.2l5.7 1.2-.6 8.7c-.3 4.8-1.1 10.9-1.9 13.6s-1.4 6-1.4 7.3v2.3h114l-3-6.1c-2.2-4.2-3-7.2-2.8-9.7.3-3.2.7-3.7 3.8-4.5 1.9-.5 4.4-2 5.7-3.3l2.2-2.4h-3c-1.6 0-4.6.7-6.6 1.5-2 .9-3.9 1.2-4.3.8-.8-1-4-17.6-4.4-22.6-.3-3.3-.1-3.7 1.5-3.2 2.3.8 2.3.8-.1-4-2-3.9-2.4-8.8-1.1-13.5.7-2.4.7-2.4 2.1.9 1.2 2.9 1.5 3.1 2 1.5.6-1.6 1-1.3 2.9 2.1 2 3.6 2.1 3.7 1.6 1-.6-2.8-.6-2.9 1.3-1.2 1.8 1.7 1.9 1.4 1.6-15-.6-29.2-2-39.7-6.9-51.3-1.3-3-2.6-7.2-3-9.2-.8-5-8.4-13.4-13.5-14.9-2.6-.8-4.7-.8-6.7-.2-3.4 1.2-7.4.1-12.1-3.4-6.1-4.6-9.2-5.3-13.9-3.2m11.1 79.8c1.5 2.8 1.4 3-.9 4.5L144 94v-3.8c0-3.4.6-5.2 1.6-5.2.2 0 1 1.3 1.8 2.9")];
        const commands = [parseSVG.parseSVG("M8.49,12.68v4.61c0,.34,.23,.61,.53,.71v5.48c0,.13-.14,3.21,1.88,5.34,1.22,1.28,2.93,1.94,5.09,1.94s3.88-.65,5.09-1.94c2.02-2.13,1.89-5.21,1.88-5.3v-5.52c.3-.1,.53-.37,.53-.71v-4.61c1.71-.69,2.92-2.36,2.92-4.32,0-2.57-2.09-4.67-4.67-4.67-.49,0-.98,.08-1.46,.23-1.09-1.67-2.93-2.68-4.94-2.68s-3.68,.91-4.79,2.46c-2.74-.22-5.01,1.96-5.01,4.65,0,1.96,1.21,3.63,2.92,4.32Zm11.51,15.11c-.92,.97-2.27,1.46-4,1.46s-3.07-.49-4-1.46c-1.58-1.66-1.48-4.21-1.48-4.28v-5.48h10.96v5.51s.1,2.58-1.48,4.24Zm2.01-14.77v3.51H9.99v-3.51h12.02ZM10.23,5.19c.21,0,.4,.02,.59,.05,.3,.05,.61-.09,.77-.35,.81-1.34,2.22-2.15,3.78-2.15,1.68,0,3.19,.94,3.95,2.45,.09,.18,.25,.31,.43,.38,.19,.06,.39,.05,.57-.04,.45-.23,.95-.35,1.44-.35,1.75,0,3.17,1.42,3.17,3.17s-1.42,3.17-3.17,3.17H10.23c-1.75,0-3.17-1.42-3.17-3.17s1.42-3.17,3.17-3.17Z")];
        // const commands = [parseSVG.parseSVG("M19.1419 5.66898C17.5585 3.39794 15.036 2.59863 12.9163 3.18559C11.8034 3.49375 10.8106 4.18473 10.1596 5.22709C9.67314 6.00594 9.39431 6.95333 9.3764 8.03736C8.75208 7.7428 8.10095 7.27847 7.47014 6.7248C6.53358 5.90279 5.73333 4.96612 5.25678 4.35642C5.10885 4.16716 4.87922 4.06021 4.63916 4.06877C4.3991 4.07732 4.17766 4.20035 4.04358 4.39966C1.48952 8.19618 2.06206 12.8986 4.61855 16.2466C3.89832 16.6316 3.18421 16.8366 2.59054 16.9658C2.31707 17.0253 2.09948 17.2322 2.02619 17.5023C1.9529 17.7724 2.03611 18.0608 2.242 18.2504C5.21903 20.9915 9.89766 21.7188 13.759 20.2696C17.6429 18.8121 20.6823 15.1662 20.4992 9.27094L21.9023 6.78796C22.0335 6.55576 22.0315 6.27135 21.8971 6.04099C21.7627 5.81063 21.5161 5.66898 21.2493 5.66898H19.1419ZM11.4318 6.02168C10.9938 6.72309 10.7554 7.70368 10.9363 8.98171L11.0797 9.99503L10.0703 9.82661C8.75774 9.60762 7.49113 8.73904 6.48066 7.85216C5.82746 7.27885 5.24114 6.66167 4.76937 6.1203C3.12265 9.36926 3.88374 13.2391 6.30103 15.9276L6.86123 16.5507L6.18015 17.0387C5.57063 17.4755 4.94982 17.7825 4.37029 18.0037C6.87506 19.6132 10.308 19.9626 13.232 18.8653C16.548 17.6208 19.2296 14.5019 18.9925 9.11986L18.983 8.90506L19.0888 8.71786L19.9641 7.16898H18.7367H18.3168L18.0973 6.81103C16.8678 4.80586 14.8649 4.20245 13.3166 4.63119C12.5415 4.8458 11.8711 5.31836 11.4318 6.02168Z")];
        // const commands = [parseSVG.parseSVG("M12 2C6.475 2 2 6.35878 2 11.7403C2 16.0504 4.8625 19.6908 8.8375 20.9814C9.3375 21.0666 9.525 20.7744 9.525 20.5187C9.525 20.2874 9.5125 19.5203 9.5125 18.7046C7 19.1551 6.35 18.108 6.15 17.5601C6.0375 17.2801 5.55 16.4156 5.125 16.1843C4.775 16.0017 4.275 15.5512 5.1125 15.539C5.9 15.5268 6.4625 16.2452 6.65 16.5374C7.55 18.0106 8.9875 17.5966 9.5625 17.341C9.65 16.7078 9.9125 16.2817 10.2 16.0382C7.975 15.7947 5.65 14.9546 5.65 11.2289C5.65 10.1697 6.0375 9.29304 6.675 8.61122C6.575 8.36772 6.225 7.36934 6.775 6.03005C6.775 6.03005 7.6125 5.77436 9.525 7.02843C10.325 6.80927 11.175 6.69969 12.025 6.69969C12.875 6.69969 13.725 6.80927 14.525 7.02843C16.4375 5.76219 17.275 6.03005 17.275 6.03005C17.825 7.36934 17.475 8.36772 17.375 8.61122C18.0125 9.29304 18.4 10.1575 18.4 11.2289C18.4 14.9668 16.0625 15.7947 13.8375 16.0382C14.2 16.3426 14.5125 16.927 14.5125 17.8401C14.5125 19.1429 14.5 20.19 14.5 20.5187C14.5 20.7744 14.6875 21.0788 15.1875 20.9814C17.1727 20.3286 18.8977 19.0859 20.1198 17.4282C21.3419 15.7704 21.9995 13.7811 22 11.7403C22 6.35878 17.525 2 12 2Z")];
        // const commands = [parseSVG.parseSVG("M17.28 20.9956L18.6242 18.8551C18.7569 18.6373 18.8046 18.3753 18.7603 18.1201C18.7127 17.8649 18.5766 17.6403 18.3724 17.4803L17.8755 17.089C17.4366 16.7419 17.1371 16.2416 17.0384 15.6869C16.9397 15.1322 17.0486 14.5605 17.3413 14.0807L17.6714 13.543C17.8075 13.3218 17.8551 13.0632 17.8109 12.808C17.7632 12.5527 17.6271 12.3247 17.4263 12.1648L16.9295 11.7735C16.4905 11.4263 16.1911 10.9261 16.0924 10.3714C15.9937 9.81672 16.1026 9.24502 16.3952 8.76519L16.7015 8.26495C15.8439 8.17987 14.9932 8.04035 14.1561 7.84638L12.9888 9.75207C12.8527 9.97326 12.8051 10.2353 12.8493 10.4871C12.8969 10.7389 13.0331 10.9669 13.2338 11.1269L13.7307 11.5182C14.1697 11.8653 14.4691 12.3656 14.5678 12.9203C14.6665 13.475 14.5576 14.0467 14.2649 14.5265L13.9349 15.0676C13.7987 15.2888 13.7511 15.5474 13.7953 15.8026C13.843 16.0579 13.9791 16.2859 14.1799 16.4458L14.6767 16.8371C15.1157 17.1842 15.4152 17.6845 15.5139 18.2392C15.6125 18.7939 15.5036 19.3656 15.211 19.8454L14.5066 20.9956H17.28ZM20.666 2C21.1322 2 21.367 2 21.544 2.09188C21.7005 2.17355 21.8264 2.29947 21.9081 2.456C22 2.63296 22 2.86777 22 3.33398V6.76422L21.9592 6.77103C20.2577 7.11813 17.5455 7.36655 14.2956 6.59407C10.6203 5.7229 7.36023 3.61303 5.27419 2H20.666ZM22 8.04716C20.8804 8.25474 19.7438 8.36023 18.6072 8.36023C18.5272 8.36023 18.4455 8.35938 18.3639 8.35853C18.2822 8.35768 18.2005 8.35683 18.1206 8.35683L17.4706 9.42198C17.3345 9.64317 17.2868 9.9018 17.3311 10.157C17.3787 10.4123 17.5148 10.6403 17.7156 10.8002L18.2124 11.1915C18.6514 11.5386 18.9509 12.0389 19.0496 12.5936C19.1483 13.1483 19.0394 13.72 18.7467 14.1998L18.4132 14.7375C18.2805 14.9587 18.2329 15.2173 18.2771 15.4725C18.3247 15.7278 18.4609 15.9558 18.6616 16.1157L19.1585 16.507C19.5975 16.8542 19.8969 17.3544 19.9956 17.9091C20.0943 18.4638 19.9854 19.0355 19.6928 19.5153L18.7637 20.999H20.666C21.1322 20.999 21.367 20.999 21.544 20.9071C21.7005 20.8289 21.8298 20.6996 21.9081 20.543C22 20.3661 22 20.1313 22 19.665V8.04716ZM13.9042 17.8172L13.4074 17.4259C12.965 17.0754 12.6689 16.5751 12.5668 16.0204C12.4682 15.4657 12.5771 14.894 12.8697 14.4142L13.2032 13.8765C13.3393 13.6553 13.387 13.3967 13.3427 13.1415C13.2951 12.8862 13.159 12.6582 12.9582 12.4983L12.4614 12.107C12.0224 11.7598 11.7229 11.2596 11.6242 10.7049C11.5255 10.1502 11.6344 9.57851 11.9271 9.09869L12.9003 7.51288C9.14001 6.37287 5.95139 4.17793 4.00826 2.60574V10.2183L2.81721 10.6573C2.28634 10.8512 1.82693 11.2052 1.50024 11.6714C1.17355 12.1376 1 12.6889 1 13.2572V14.6694C1 14.7885 1.03063 14.9076 1.08508 15.0131C1.13952 15.1186 1.2212 15.2105 1.31988 15.2786C1.41857 15.3466 1.53087 15.3909 1.64998 15.4045C1.76908 15.4181 1.88819 15.4011 2.00049 15.3602L4.00826 14.6388V16.1565C4.93048 16.1531 5.82547 15.8537 6.56733 15.3058C7.30579 14.7545 7.85367 13.9854 8.12591 13.104C8.17355 12.9441 8.28245 12.8114 8.42878 12.7365C8.57511 12.6582 8.74526 12.6412 8.9052 12.6889C9.06514 12.7365 9.19786 12.8454 9.27613 12.9917C9.3544 13.1381 9.37142 13.3082 9.32377 13.4682C8.98007 14.5946 8.28585 15.5814 7.34662 16.2927C6.38697 17.0209 5.21633 17.4123 4.01167 17.4088C4.01167 17.9601 4.01167 18.2324 4.0491 18.4638C4.24988 19.7535 5.26057 20.7642 6.55032 20.965C6.78172 21.0024 7.05396 21.0024 7.60525 21.0024H13.0535L14.1561 19.1988C14.2888 18.9776 14.3398 18.7156 14.2922 18.4604C14.2445 18.2052 14.1084 17.9771 13.9042 17.8172ZM8.36412 10.2931C8.4492 10.2183 8.51726 10.1264 8.5649 10.0209C8.61254 9.91541 8.63636 9.80311 8.63296 9.69081C8.62615 9.48323 8.53768 9.28585 8.38794 9.13952C8.23821 8.99319 8.03743 8.91152 7.82985 8.91152C7.62227 8.91152 7.42149 8.99319 7.27175 9.13952C7.12202 9.28245 7.03354 9.48323 7.02674 9.69081C7.02674 9.80311 7.04716 9.91541 7.0948 10.0209C7.14244 10.1264 7.2105 10.2183 7.29558 10.2931C6.48906 9.99368 5.92076 9.12251 5.92076 9.12251C5.92076 9.12251 6.7545 7.84978 7.82985 7.84978C8.86777 7.84978 9.73894 9.12251 9.73894 9.12251C9.73894 9.12251 9.16724 9.99368 8.36412 10.2931Z")];
        // const commands = [parseSVG.parseSVG("M18.2508 7.01222H19C20.1046 7.01222 21 7.90765 21 9.01222V11.0246V12.5246V15.5432V17.0432V18.0556C21 19.7125 19.6569 21.0556 18 21.0556H6C4.34315 21.0556 3 19.7125 3 18.0556V9.01222C3 7.90765 3.89543 7.01222 5 7.01222H7.8743L14.3586 3.25688C15.0755 2.8417 15.9917 3.08719 16.4049 3.80518L18.2508 7.01222ZM16.5201 7.01222L15.1069 4.55692L10.8673 7.01222H16.5201ZM19 8.51222H5C4.72386 8.51222 4.5 8.73608 4.5 9.01222V18.0556C4.5 18.884 5.17157 19.5556 6 19.5556H18C18.8284 19.5556 19.5 18.884 19.5 18.0556V17.0432H14C12.8954 17.0432 12 16.1478 12 15.0432V13.0246C12 11.92 12.8954 11.0246 14 11.0246H19.5V9.01222C19.5 8.73608 19.2761 8.51222 19 8.51222ZM19.5 12.5246V15.5432H14C13.7239 15.5432 13.5 15.3194 13.5 15.0432V13.0246C13.5 12.7485 13.7239 12.5246 14 12.5246H19.5Z")];

        // const now = performance.now();

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
        //     .moveTo(0, 75.54)
        //     .cubicTo(73.38, 0, 0.1, 33.73, 32.76, 0.1)
        //     .cubicTo(146.75, 75.54, 113.98, 0.1, 146.66, 33.73)
        //     .cubicTo(73.38, 151.07, 146.99, 117.34, 113.99, 150.98)
        //     .cubicTo(0, 75.54, 32.76, 151.17, 0.1, 117.34)
        //     .close()
        //     .moveTo(29.63, 75.54)
        //     .cubicTo(73.38, 30.5, 29.68, 50.61, 49.17, 30.55)
        //     .cubicTo(117.13, 75.54, 97.6, 30.55, 117.07, 50.61)
        //     .cubicTo(73.38, 120.57, 117.07, 100.46, 97.6, 120.52)
        //     .cubicTo(29.62, 75.54, 49.16, 120.63, 29.68, 100.46)
        //     .close();

        const rows = gen.buildGeometry();
        const [vertices, len] = triangulateVectorGeometryFromData(rows);
        const poly = new Polygon(vertices, len);
        buildFrame(commands);


        function buildFrame(commands: parseSVG.Command[][])
        {
            gen.reset();
            for (let i = 0; i < commands.length; i++)
            {
                const frame = commands[i];
                for (let j = 0; j < frame.length; j++)
                {
                    const command = frame[j];
                    if (j === 0 && command.code === "m")
                    {
                        // HACK: if the SVG has a "path" element, that begins with
                        // "m" and not "M", that "m" is treated like "M".
                        // Geometry builder can't really take care of that,
                        // as it is a geometry builder, not an SVG parser.
                        // So we just hack it.
                        command.code = "M";
                    }

                    switch (command.code)
                    {
                        case "M":
                            gen.moveTo(command.x, command.y);
                            break;
                        case "m":
                            gen.moveToRelative(command.x, command.y);
                            break;
                        case "L":
                            gen.lineTo(command.x, command.y);
                            break;
                        case "l":
                            gen.lineToRelative(command.x, command.y);
                            break;
                        case "V":
                            gen.verticalTo(command.y);
                            break;
                        case "v":
                            gen.vertivalToRelative(command.y);
                            break;
                        case "H":
                            gen.horizontalTo(command.x);
                            break;
                        case "h":
                            gen.horizontalToRelative(command.x);
                            break;
                        case "C":
                            gen.cubicTo(command.x, command.y, command.x1, command.y1, command.x2, command.y2);
                            break;
                        case "c":
                            gen.cubicToRelative(command.x, command.y, command.x1, command.y1, command.x2, command.y2);
                            break;
                        case "S":
                            gen.sCubicTo(command.x, command.y, command.x2, command.y2);
                            break;
                        case "s":
                            gen.sCubicToRelative(command.x, command.y, command.x2, command.y2);
                            break;
                        case "Q":
                            gen.quadTo(command.x, command.y, command.x1, command.y1);
                            break;
                        case "q":
                            gen.quadToRelative(command.x, command.y, command.x1, command.y1);
                            break;
                        case "T":
                            gen.tQuadTo(command.x, command.y);
                            break;
                        case "t":
                            gen.tQuadToRelative(command.x, command.y);
                            break;
                        case "z":
                        case "Z":
                            gen.close();
                            break;
                    }
                }
            }

            const rows = gen.buildGeometry();
            const [vertices, len] = triangulateVectorGeometryFromData(rows);

            poly.setData(vertices, len);
        }

        // console.log(performance.now() - now);
        // poly.model().scale(1, -1).translate(0, -200);

        // const quad = new Quad(0, 0, 1450, 450);
        const quad = new GradientQuad(0, 0, 500, 500);


        const gradientGen = new GradientGenerator();
        const stops: GradientStop[] = [
            {
                position: 0,
                color: [1, 0, 0, 1],
            },
            {
                position: 0.25,
                color: [0.25, 0.8, 0, 1],
            },
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

        // const video = document.querySelector<HTMLVideoElement>("#video");
        // video?.pause();

        function cleanup()
        {
            gradientStripTexture.delete();
            shaderQuad.delete();
            shaderPoly.delete();
            quad.delete();
            poly.delete();
        }

        let frameIndex = 0;
        let prevTime = 0;

        const frametime = 1000 / 40;

        const frameCounter = document.querySelector<HTMLDivElement>("#frameCounter")!;

        const draw = (time: number, frameByFrame?: boolean) =>
        {
            const elapsed = performance.now() - prevTime - 1;
            if (elapsed > frametime)
            {
                frameCounter.textContent = String(frameIndex);

                // buildFrame(frames[frameIndex]);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

                gl.clearColor(1, 1, 1, 1.0);
                gl.clearStencil(0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

                camera.setScale(this._scale);
                camera.update(gl.canvas.width, gl.canvas.height);

                // NOTE: This case might just work with everything, LMAO
                // polygons with holes
                gl.disable(gl.BLEND);
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
                    // draw cover (this is the fill)
                    gl.colorMask(true, true, true, true);
                    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

                    gl.stencilFuncSeparate(gl.FRONT_AND_BACK, gl.NOTEQUAL, 0, 1);
                    gl.stencilOpSeparate(gl.FRONT_AND_BACK, 0, 0, 0);
                    gl.stencilMaskSeparate(gl.FRONT_AND_BACK, 63);

                    shaderQuad.bind();
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
                //     shaderPoly.setUniformMat3("view", camera.view());
                //     shaderPoly.setUniformMat3("projection", camera.projection());
                //     shaderPoly.setUniformMat3("model", poly.model());
                //
                //     poly.draw();
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
                //     shaderQuad.setUniformInt("u_gradient_type", 1);
                //
                //     shaderQuad.setUniformMat3("view", camera.view());
                //     shaderQuad.setUniformMat3("projection", camera.projection());
                //     shaderQuad.setUniformMat3("model", quad.model());
                //     shaderQuad.setUniformMat3("u_paint_transform", quad.paintTransform());
                //
                //     quad.draw();
                //     shaderQuad.unbind();
                // }

                gl.disable(gl.STENCIL_TEST);
                gl.stencilFuncSeparate(gl.FRONT_AND_BACK, gl.ALWAYS, 0, 0);
                gl.stencilOpSeparate(gl.FRONT_AND_BACK, gl.KEEP, gl.KEEP, gl.KEEP);
                gl.stencilMaskSeparate(gl.FRONT_AND_BACK, 255);

                frameIndex++;
                if (frameIndex >= frames.length)
                {
                    frameIndex = 0;
                }

                prevTime = performance.now();
            }

            if (!frameByFrame)
                requestId = requestAnimationFrame(draw);
        }

        // video?.play();
        // video!.muted = false;
        // draw(frametime);
    }
}
