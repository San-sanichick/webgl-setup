import type { IDisposable, Tuple } from "@/gfx/utils/types";

import Framebuffer from "../framebuffer";
import Shader      from "../shader";
import Texture, {
    TextureFiltering,
    TextureMode,
    TextureWrapping
} from "../texture";

import Vert1D from "@/assets/shaders/gradient/1d/vert.glsl";
import Frag1D from "@/assets/shaders/gradient/1d/frag.glsl";

import TextResource from "@/gfx/utils/textResource";
import { GradientStrip } from "../primitives/gradientStrip";
import { Matrix3 } from "@/gfx/utils/Matrix3";
import GL from "../GL";


const WIDTH = 1024;
const HEIGHT = 1;


export type GradientStop = {
    position: number;
    color: Tuple<number, 4>;
}



/**
 * @see https://mtldoc.com/metal/2022/08/04/shaders-explained-gradients
 */
export class GradientGenerator implements IDisposable
{
    private fb: Framebuffer;
    private shader1d: Shader;
    private strip: GradientStrip;

    private proj = new Matrix3([
        2 / WIDTH, 0, 0,
        0, -2 / HEIGHT , 0,
        -1, 1, 1,
    ]);



    constructor()
    {
        this.fb = new Framebuffer();
        const vert1d = new TextResource(Vert1D);
        const frag1d = new TextResource(Frag1D);
        this.shader1d = new Shader(vert1d, frag1d);

        this.strip = new GradientStrip();
    }

    public delete(): void
    {
        this.fb.delete();
        this.shader1d.delete();
        this.strip.delete();
    }



    public static getTexture(): Texture
    {
        return new Texture({
            width: WIDTH,
            height: HEIGHT,
            sourceMode: TextureMode.RGBA,
            storeMode: TextureMode.RGBA,
            wrapS: TextureWrapping.ClampToEdge,
            wrapT: TextureWrapping.ClampToEdge,
            min: TextureFiltering.Linear,
            mag: TextureFiltering.Linear,
        });
    }


    public generateGradient(texture1d: Texture, stops: GradientStop[]): void
    {
        console.assert(stops.length !== 0, "Stops array should not be empty");

        this.fb.attach(texture1d, 0);
        const _stops = stops.slice();
        const first = _stops[0];
        const last = _stops[_stops.length - 1];

        if (_stops[0].position !== 0)
        {
            _stops.unshift({
                position: 0,
                color: first.color,
            });
        }

        if (_stops[_stops.length - 1].position !== 1)
        {
            _stops.push({
                position: 1,
                color: last.color,
            });
        }

        const tex1dVertices = new Array<number>(_stops.length * 18);

        let j = 0;

        for (let i = 0; i < _stops.length - 1; i++)
        {
            const stop = _stops[i];
            const nStop = _stops[i + 1];
            const color1 = stop.color;
            const color2 = nStop.color;

            const pos1 = stop.position;
            const pos2 = nStop.position;

            tex1dVertices[j    ] = pos1 * WIDTH;
            tex1dVertices[j + 1] = 0;
            tex1dVertices[j + 2] = color1[0];
            tex1dVertices[j + 3] = color1[1];
            tex1dVertices[j + 4] = color1[2];
            tex1dVertices[j + 5] = color1[3];

            tex1dVertices[j + 6] = pos2 * WIDTH;
            tex1dVertices[j + 7] = 0;
            tex1dVertices[j + 8] = color2[0];
            tex1dVertices[j + 9] = color2[1];
            tex1dVertices[j + 10] = color2[2];
            tex1dVertices[j + 11] = color2[3];

            tex1dVertices[j + 12] = pos1 * WIDTH;
            tex1dVertices[j + 13] = HEIGHT;
            tex1dVertices[j + 14] = color1[0];
            tex1dVertices[j + 15] = color1[1];
            tex1dVertices[j + 16] = color1[2];
            tex1dVertices[j + 17] = color1[3];

            tex1dVertices[j + 18] = pos1 * WIDTH;
            tex1dVertices[j + 19] = HEIGHT;
            tex1dVertices[j + 20] = color1[0];
            tex1dVertices[j + 21] = color1[1];
            tex1dVertices[j + 22] = color1[2];
            tex1dVertices[j + 23] = color1[3];

            tex1dVertices[j + 24] = pos2 * WIDTH;
            tex1dVertices[j + 25] = 0;
            tex1dVertices[j + 26] = color2[0];
            tex1dVertices[j + 27] = color2[1];
            tex1dVertices[j + 28] = color2[2];
            tex1dVertices[j + 29] = color2[3];

            tex1dVertices[j + 30] = pos2 * WIDTH;
            tex1dVertices[j + 31] = HEIGHT;
            tex1dVertices[j + 32] = color2[0];
            tex1dVertices[j + 33] = color2[1];
            tex1dVertices[j + 34] = color2[2];
            tex1dVertices[j + 35] = color2[3];
            j += 36;
        }

        this.strip.setVertices(tex1dVertices, tex1dVertices.length / 6);


        // generate 1d texture
        const gl = GL.get();
        this.fb.bind();
        gl.viewport(0, 0, WIDTH, HEIGHT);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.shader1d.bind();
        this.shader1d.setUniformMat3("u_proj", this.proj);
        this.strip.draw();
        this.shader1d.unbind();


        this.fb.unbind();
        this.fb.dettach(0);
    }
}
