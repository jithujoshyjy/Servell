/**
 * @module servell
 * @version 0.0.4
 * @author Jithu Joshy &lt;jithujoshyjy@gmail.com>
 * @description # Remote Procedure Call - RPC implementation (sort of 😅)\
 * just so that I don't have to deal with the boilerplate
 * of writing routes handlers and fetch requests!\
 * Only public async methods of the class are modified.
 */

/**
 * @summary Can be used in a server-only context (like in a server component)
 * @description Modifies public async methods used in the class to read/write data from a server context
 * to work seamlessly with route handlers and calls from frontend.\
 * Use the `@⁣params` decorator on methods to supply additional information to the route handler.
 * 
 * @example
 * ```typescript
   ＠server
   class KlassName {
      async methodName(...args: any[]) { }
   }
   ```
 * @example
 * The default **endpoint** is `/api/rpc`, you must provide `@server({ endpoint }) to change it`\
 * Also the endpoint must have the required HTTP method handlers like so:
 * ```typescript
 * // /api/rpc/route.ts or /your-endpoint/route.ts
   import { deleteHandler, getHandler, patchHandler, postHandler, putHandler } from "servell"
   export const GET = getHandler
   export const POST = postHandler
   export const PUT = putHandler
   export const PATCH = patchHandler
   export const DELETE = deleteHandler
   ```
 */
export function server(options?: RpcHelperProps): ReturnType<typeof rpcHelper>
export function server<This extends new (...args: any[]) => any>(klass: This, context: ClassDecoratorContext<This>): ReturnType<typeof rpcHelper>

export function server(arg0: any = { ...rpcHelperProps }, context?: any) {
    if (typeof arg0 == "function")
        return rpcHelper.call(null, { ...rpcHelperProps, _context: "server" }, arg0, context)
    return rpcHelper.bind(null, { ...arg0, _context: "server" })
}

/**
 * @summary Can be used in a client-only context (like in a client component)
 * @description Modifies public async methods used in the class to fetch/mutate data from the client.\
 * The class and method names must match that on the server.\
 * The result of the fetch is passed as the last argument to the original method.\
 * Use the `@⁣params` decorator on methods to supply additional information to the fetch request.
 * @example
 * ```typescript
   ＠client
   class KlassName {
      async methodName(...args: any[], result: type) { }
   }
   ```
 */
export function client(options?: RpcHelperProps): ReturnType<typeof rpcHelper>
export function client<This extends new (...args: any[]) => any>(klass: This, context: ClassDecoratorContext<This>): ReturnType<typeof rpcHelper>

export function client(arg0: any = { ...rpcHelperProps }, context?: any) {
    if (typeof arg0 == "function")
        return rpcHelper.call(null, { ...rpcHelperProps, _context: "client" }, arg0, context)
    return rpcHelper.bind(null, { ...arg0, _context: "client" })
}

/**
 * @description Can be used to supply additional information to the fetch request on the client\
 * or the route handler on the server.
 * @example
 * ```typescript
 * ＠client
   class KlassName {
      ＠params({ method: "POST" })
      async methodName(...args: any[], result: type) { }
   }
   ```
 */
export function params(options?: RpcFnHelperProps): (fn: Parameters<typeof rpcFnHelper>[1], context: Parameters<typeof rpcFnHelper>[2]) => void
export function params<This, Args extends any[], Return>(fn: ExtendedFunction<This, Args, Return>, context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>): void

export function params(arg0: any = { ...rpcFnHelperProps }, context?: any) {
    if (typeof arg0 == "function")
        return rpcFnHelper.call(null, { ...rpcFnHelperProps }, arg0, context)
    return rpcFnHelper.bind(null, arg0)
}

/**
 * @description A route handler to intercept GET requests
 * @example
 * ```typescript
 * // /api/rpc/route.ts or /your-endpoint/route.ts
 * import { getHandler } from "servell"
 * export const GET = getHandler
 * ```
 */
export const getHandler = async (req: Request, res: Response) => {
    return await genericHandler(req, res)
}

/**
 * @description A route handler to intercept POST requests
 * @example
 * ```typescript
 * // /api/rpc/route.ts or /your-endpoint/route.ts
 * import { postHandler } from "servell"
 * export const POST = postHandler
 * ```
 */
export const postHandler = async (req: Request, res: Response) => {
    return await genericHandler(req, res)
}

/**
 * @description A route handler to intercept PUT requests
 * @example
 * ```typescript
 * // /api/rpc/route.ts or /your-endpoint/route.ts
 * import { putHandler } from "servell"
 * export const PUT = putHandler
 * ```
 */
export const putHandler = async (req: Request, res: Response) => {
    return await genericHandler(req, res)
}

/**
 * @description A route handler to intercept PATCH requests
 * @example
 * ```typescript
 * // /api/rpc/route.ts or /your-endpoint/route.ts
 * import { patchHandler } from "servell"
 * export const PATCH = patchHandler
 * ```
 */
export const patchHandler = async (req: Request, res: Response) => {
    return await genericHandler(req, res)
}

/**
 * @description A route handler to intercept DELETE requests
 * @example
 * ```typescript
 * // /api/rpc/route.ts or /your-endpoint/route.ts
 * import { deleteHandler } from "servell"
 * export const DELETE = deleteHandler
 * ```
 */
export const deleteHandler = async (req: Request, res: Response) => {
    return await genericHandler(req, res)
}

const RPCExtension = Symbol("ServellRPCExtension")
const rpcNamespaces: RpcNamespaces = (globalThis as any)["ServellRPCExtension"] ??= new Map()

const rpcHelperProps: RpcHelperProps = {
    endpoint: "/api/rpc",
    _context: "server"
}

const rpcFnHelperProps: RpcFnHelperProps = {
    method: "GET",
}

function rpcHelper<This extends new (...args: any[]) => any>(rpcProps: RpcHelperProps, klass: This, context: ClassDecoratorContext<This>) {
    const { endpoint, _context: ctx } = rpcProps

    if (!endpoint) {
        throw new Error("Missing 'endpoint' option in args to route the requests")
    }

    const subclass = class X extends klass {
        constructor(...args: any[]) {
            super(...args)
        }
    }

    context.addInitializer(() => {
        const name = endpoint + ':' + context.name
        if (!rpcNamespaces.has(name)) rpcNamespaces.set(name, new Map())

        const fnMap = rpcNamespaces.get(name)!
        const parent = klass.prototype

        for (const key of Reflect.ownKeys(parent)) {
            const member = parent[key]
            if (typeof member == "function") {
                parent[key] = member.bind(parent)
                if (!isAsyncFunction(member)) continue

                if (ctx == "client") {
                    if (!isBrowser()) continue
                    // "The decorator '@client' can only be used on the client"
                    parent[key] = browserRequestWrapper(key, parent[key])
                }

                if (ctx == "server") {
                    if (isBrowser()) continue
                    // "The decorator '@server' can only be used on the server"
                    fnMap.set(String(key), parent[key] = serverResponseWrapper(parent[key]))
                }
            }
        }
    })

    for (const key of Reflect.ownKeys(klass)) {
        if (!(key in subclass))
            // @ts-ignore
            subclass[key] = klass[key as keyof typeof klass]
    }

    return subclass

    function browserRequestWrapper<Args extends any[], Return>(fnName: string | symbol, fn: ExtendedFunction<This, Args, Return>) {
        return async (...args: any[]) => {
            const { method = "GET", body, cache, headers: h } = fn[RPCExtension] ?? {}
            const hasBody = method != "GET" && body === true

            const headers = new Headers(h)
            headers.set("X-Servell-Function", context.name + '.' + String(fnName))
            headers.set("X-Servell-Args", hasBody ? "body" : JSON.stringify(args))

            const result = await fetch(endpoint, {
                method,
                body: hasBody ? JSON.stringify(args) : undefined,
                cache,
                headers,
            })

            await (fn as any)(...args, result) ?? result
        }
    }

    function serverResponseWrapper<Args extends any[], Return>(fn: ExtendedFunction<This, Args, Return>) {
        return async (...args: any[]) => {
            const content = fn[RPCExtension]?.content ?? "json"
            let wrappedResult: Result<any, any> = { status: "error" }
            try {
                const result = await (fn as any)(...args)
                switch (content) {
                    case "json":
                        wrappedResult = { status: "ok", data: result }
                        break
                    case "text":
                        wrappedResult = { status: "ok", data: String(result) }
                        break
                    default:
                        wrappedResult = { status: "ok", data: null }
                }
            }
            catch (e) {
                wrappedResult = { status: "error", data: String(e) }
            }
            finally {
                return wrappedResult
            }
        }
    }
}

function rpcFnHelper<This, Args extends any[], Return>(rpcFnProps: RpcFnHelperProps, fn: ExtendedFunction<This, Args, Return>, context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>) {
    const { body, cache, content, headers, method } = rpcFnProps
    context.addInitializer(() => {
        fn[RPCExtension] = {
            body,
            cache,
            content,
            headers,
            method,
        }
    })
}

const genericHandler = async (req: Request, res: Response) => {
    const functionName = req.headers.get("X-Servell-Function")
    const functionArgs = req.headers.get("X-Servell-Args")

    if (!functionName || !functionArgs) {
        throw new Error("Required headers 'X-Servell-Function' or 'X-Servell-Args' missing from the request")
    }

    const [klassName, fnName] = functionName.split('.')

    if (!klassName || !fnName) {
        throw new Error("The value of the 'X-Servell-Function' header is invalid")
    }

    const args: any[] = functionArgs == "body" ? await req.json() : JSON.parse(functionArgs)
    const url = new URL(req.url).pathname
    const fn = rpcNamespaces.get(url + ':' + klassName)?.get(fnName)

    const data = `The rpc method '${klassName}.${fnName}' not found on path '${url}'`
    if (!fn) return Response.json({ status: "error", data }, { status: 404 })
    const result = await fn(...args)

    const status = result.status == "ok" ? 200 : 500
    return Response.json(result, { status })
}

export function isBrowser() {
    return typeof window != "undefined"
        && window.document
        && Object.is(globalThis, window)
}
export function isAsyncFunction(fn: Function) {
    const AsyncFunction = (async () => { }).constructor
    return fn instanceof AsyncFunction
}

export type Result<T = undefined, U = undefined> =
    | {
        status: "ok",
        data?: T
    }
    | {
        status: "error",
        data?: U
    }

type Class<T = any> = new (...args: any[]) => T

type RpcNamespaces = Map<
    string, Map<
        string, (...args: any[]) => Promise<Result>
    >
>

interface RpcFnHelperProps {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    content?: "json" | "text",
    headers?: HeadersInit,
    body?: BodyInit | boolean,
    cache?: RequestCache,
}

interface RpcHelperProps {
    endpoint: string,
    _context?: "server" | "client"
}

interface ExtendedFunction<This, Args extends any[], Return> {
    (this: This, ...args: Args): Return,
    [RPCExtension]?: RpcFnHelperProps,
}