export interface IBaseStack<T>
{
    maxSize: number;
    takeOverFromArray(arr: T[]): void;
    isEmpty(): boolean;
    clear(): void;

    push(val: T): void;
    pop(): T | null;
    peek(): T | null;

}

export interface IStack<T> extends IBaseStack<T>
{
    setSize(size: number): void;

    pushMany(vals: T[]): void;

    pushFromOtherStack(o: IStack<T>): void;
    pushAsCopyFromOtherStack(o: IStack<T>): void;

    popUntil(callbackfn: (top: T) => boolean): boolean;
    popCount(count: number): T[];
}



export class ReservableStack<T> implements IBaseStack<T>
{
    private _stack: T[];
    private topIndex = -1;

    constructor(size: number)
    {
        this._stack = new Array<T>(size);
    }


    public get maxSize()
    {
        return this._stack.length;
    }


    public takeOverFromArray(arr: T[]): void
    {
        this._stack = arr;
        this.topIndex = arr.length - 1;
    }


    public clear(): void
    {
        this.topIndex = 0;
    }

    public  peek(): T | null
    {
        if (this.topIndex === -1) return null;
        return this._stack[this.topIndex];
    }

    public pop(): T | null
    {
        if (this.topIndex === -1) return null;
        const top = this._stack[this.topIndex];
        this.topIndex--;
        return top;
    }

    public push(val: T): void
    {
        this.topIndex++;
        this._stack[this.topIndex] = val;
    }


    public isEmpty(): boolean
    {
        return this.topIndex === -1;
    }
}


export class Stack<T> implements IStack<T>
{
    private stack: T[] = [];
    private _maxSize: number;

    constructor(maxSize = 30)
    {
        this._maxSize = maxSize;
    }

    public get maxSize()
    {
        return this._maxSize;
    }

    public takeOverFromArray(arr: T[]): void
    {
        this.stack = arr;
    }


    public isEmpty()
    {
        return this.stack.length === 0;
    }

    public setSize(size: number)
    {
        this._maxSize = size;
    }

    public push(val: T)
    {
        // console.assert(this.stack.length <= this._maxSize, `Max stack size exceeded (stack size: ${this.stack.length})`);
        this.stack.push(val);
    }

    public pushMany(vals: T[])
    {
        // console.assert(this.stack.length <= this._maxSize, `Max stack size exceeded (stack size: ${this.stack.length})`);
        this.stack.push.apply(this.stack, vals);
    }

    public pushFromOtherStack(o: Stack<T>)
    {
        // console.assert(this.stack.length <= this._maxSize, `Max stack size exceeded (stack size: ${this.stack.length})`);
        for (let i = o.stack.length - 1; i >= 0; i--)
        {
            this.stack.push(o.stack[i]);
        }
    }

    public pushAsCopyFromOtherStack(o: Stack<T>)
    {
        // console.assert(this.stack.length <= this._maxSize, `Max stack size exceeded (stack size: ${this.stack.length})`);
        this.stack.push.apply(this.stack, o.stack);
    }

    public pop(): T | null
    {
        return this.stack.pop() ?? null;
    }

    public peek(): T | null
    {
        return this.stack.at(-1) ?? null;
    }

    /**
     * @param callbackfn - условие, при котором мы перестаём делать pop 
     * @returns true если условие оказалось true
     */
    public popUntil(callbackfn: (top: T) => boolean): boolean
    {
        const index = this.stack.findLastIndex(callbackfn);
        if (index === -1)
        {
            this.stack = [];
            return false;
        }

        this.stack.splice(index + 1, this.stack.length - index - 1);
        return true;
    }

    public popCount(count: number): T[]
    {
        return this.stack.splice(this.stack.length - count, count);
    }

    public clear(): void
    {
        this.stack.length = 0;
    }
}
