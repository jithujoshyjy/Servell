/**
 * @module servell
 * @version 0.0.1
 * @author Jithu Joshy &lt;jithujoshyjy@gmail.com>
 * @description # Remote Procedure Call - RPC implementation (sort of 😅)\
 * just so that I don't have to deal with the boilerplate
 * of writing routes handlers and fetch requests!\
 * Only public async methods of the class are modified.\
 * -- WARNING -- The code in the examples uses Invisible Separator U+2063 to render '@'. Copy with caution.
 */

/**
 * @summary Can be used in a server-only context (like in a server component)
 * @description Modifies public async methods used in the class to read/write data from a server context
 * to work semalessy with route handlers and calls from frontend.\
 * Use the `@⁣param` decorator to supply additional information to the route handler.
 * @example
 * ```typescript
   @server
   class KlassName {
      async methodName(...args: any[]) { }
   }
   ```
 * @example
 * The default **endpoint** is `/api/rpc`, you must provide `@erver({ endpoint }) to change it`\
 * Also the endpoint must have the required HTTP method handlers like so:
 * ```typescript
 * // /api/rpc/route.ts or your-endpoint/route.ts
   import { deleteHandler, getHandler, patchHandler, postHandler, putHandler } from "servell"
   export const GET = getHandler
   export const POST = postHandler
   export const PUT = putHandler
   export const PATCH = patchHandler
   export const DELETE = deleteHandler
   ```
 */
export function server<T>(arg0: RpcHelperProps | Class<T> = { ...rpcHelperProps }, context?: ClassDecoratorContext) {
    if (typeof arg0 == "function")
        return rpcHelper.call(null, { ...rpcHelperProps, _context: "server" }, arg0, context!)
    return rpcHelper.bind(null, { ...arg0, _context: "server" })
}

/**
 * @summary Can be used in a client-only context (like in a client component)
 * @description Modifies public async methods used in the class to fetch/mutate data from the client.\
 * The class and method names must match that on the server.\
 * The result of the fetch is passed as the last argument to the original method.\
 * Use the `@⁣param` decorator to supply additional information to the fetch request.
 * @example
 * ```typescript
   @client
   class KlassName {
      async methodName(...args: any[], result: type) { }
   }
   ```
 */
export function client<T>(arg0: RpcHelperProps | Class<T> = { ...rpcHelperProps }, context?: ClassDecoratorContext) {
    if (typeof arg0 == "function")
        return rpcHelper.call(null, { ...rpcHelperProps, _context: "client" }, arg0, context!)
    return rpcHelper.bind(null, { ...arg0, _context: "client" })
}

/**
 * @description Can be used to supply additional information to the fetch request on the client\
 * or the route handler on the server.
 * @example
 * ```typescript
 * @client
   class KlassName {
      @param({ method: "POST" })
      async methodName(...args: any[], result: type) { }
   }
   ```
 */
export function param<T>(arg0: RpcFnHelperProps | ExtendedFunction = { ...rpcFnHelperProps }, context?: RpcFnHelperDecoratorContext<T>) {
    if (typeof arg0 == "function")
        return rpcFnHelper.call(null, { ...rpcFnHelperProps }, arg0, context!)
    return rpcFnHelper.bind(null, arg0)
}

export const getHandler = async (req: Request, res: Response) => {
    return await genericHandler(req, res)
}

export const postHandler = async (req: Request, res: Response) => {
    return await genericHandler(req, res)
}

export const putHandler = async (req: Request, res: Response) => {
    return await genericHandler(req, res)
}

export const patchHandler = async (req: Request, res: Response) => {
    return await genericHandler(req, res)
}

export const deleteHandler = async (req: Request, res: Response) => {
    return await genericHandler(req, res)
}

export type ClassDecoratorContext = {
    kind: "class";
    name: string | undefined;
    addInitializer(initializer: () => void): void;
}

const RPCExtension = Symbol("RPCExtension")
const rpcNamespaces: RpcNamespaces = new Map()

const rpcHelperProps: RpcHelperProps = {
    endpoint: "/api/rpc",
    _context: "server"
}

const rpcFnHelperProps: RpcFnHelperProps = {
    method: "GET",
}

function rpcHelper(rpcProps: RpcHelperProps, klass: Class, context: ClassDecoratorContext) {
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
        const fnMap = new Map()
        rpcNamespaces.set(endpoint + ':' + context.name, fnMap)
        const parent = klass.prototype

        for (const key of Reflect.ownKeys(parent)) {
            const member = parent[key]
            if (typeof member == "function") {
                parent[key] = member.bind(parent)
                if (!isAsyncFunction(member) || member.name.startsWith("#")) continue

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
            subclass[key as keyof typeof subclass] = klass[key as keyof typeof klass]
    }

    return subclass

    function browserRequestWrapper(fnName: string | symbol, fn: ExtendedFunction) {
        return async (...args: any[]) => {
            const headers = new Headers(fn[RPCExtension]?.headers)
            headers.set("X-Servell-Function", context.name + '.' + String(fnName))
            headers.set("X-Servell-Args", JSON.stringify(args))

            const result = await fetch(endpoint, {
                method: fn[RPCExtension]?.method ?? "GET",
                body: fn[RPCExtension]?.body,
                cache: fn[RPCExtension]?.cache,
                headers: headers,
            })
            await fn(...args, result) ?? result
        }
    }

    function serverResponseWrapper(fn: ExtendedFunction) {
        return async (...args: any[]) => {
            const content = fn[RPCExtension]?.content ?? "json"
            let wrappedResult = { status: "error", data: undefined as any | undefined }
            try {
                const result = await fn(...args)
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

function rpcFnHelper<T>(rpcFnProps: RpcFnHelperProps, fn: ExtendedFunction, context: RpcFnHelperDecoratorContext<T>) {
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

    const args = JSON.parse(functionArgs) as any[]
    const url = new URL(req.url).pathname
    const fn = rpcNamespaces.get(url + ':' + klassName)?.get(fnName)

    if (!fn) return Response.json({ status: "error" }, { status: 404 })
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

type RpcFnHelperDecoratorContext<T> = ClassMethodDecoratorContext<T, (...args: any[]) => Promise<any>>

type Class<T = any> = new (...args: any[]) => T

type RpcNamespaces = Map<
    string, Map<
        string, (...args: any[]) => Promise<{ status: "ok" | "error", data?: any }>
    >
>

interface RpcFnHelperProps {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    content?: "json" | "text",
    headers?: HeadersInit,
    body?: BodyInit,
    cache?: RequestCache,
}

interface RpcHelperProps {
    endpoint: string,
    _context?: "server" | "client"
}

interface ExtendedFunction {
    (...args: any[]): any,
    [RPCExtension]: RpcFnHelperProps,
}