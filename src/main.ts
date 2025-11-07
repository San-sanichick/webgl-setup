import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import "./index.css"

createApp(App).mount('#app')



// type Context = { cond: boolean; };
// type Hanler = (ctx: Context) => boolean;
//
// function handleChain(chain: Hanler[], ctx: Context): void
// {
//     for (let i = 0; i < chain.length; i++)
//     {
//         const success = chain[i](ctx);
//         if (success) break;
//     }
// }
//
// const chain: Hanler[] = [
//     (ctx) => {
//         if (!ctx.cond) return false;
//         return true;
//     },
//     (ctx) => {
//         if (ctx.cond) return false;
//         return true;
//     },
// ]
//
// const ctx: Context = { cond: false };
// handleChain(chain, ctx);

type Context = { cond: boolean; };
type Hanler = {
    conditionCheck: (ctx: Context) => boolean;
    handle: (ctx: Context) => void;
}

function handleChain(chain: Hanler[], ctx: Context): void
{
    for (let i = 0; i < chain.length; i++)
    {
        if (!chain[i].conditionCheck(ctx))
        {
            continue;
        }

        chain[i].handle(ctx);
        break;
    }
}

const chain: Hanler[] = [
    {
        conditionCheck: (ctx) => {
            if (!ctx.cond) return false;
            return true;
        },
        handle: (ctx) => {
            // do
        }
    },
    {
        conditionCheck: (ctx) => {
            if (ctx.cond) return false;
            return true;
        },
        handle: (ctx) => {
            // do
        }
    }
]

const ctx: Context = { cond: false };
handleChain(chain, ctx);
