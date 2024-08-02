/**
 * @module servell
 * @version 0.0.1
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
export declare function server(options?: RpcHelperProps): ReturnType<typeof rpcHelper>;
export declare function server<This extends new (...args: any[]) => any>(klass: This, context: ClassDecoratorContext<This>): ReturnType<typeof rpcHelper>;
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
export declare function client(options?: RpcHelperProps): ReturnType<typeof rpcHelper>;
export declare function client<This extends new (...args: any[]) => any>(klass: This, context: ClassDecoratorContext<This>): ReturnType<typeof rpcHelper>;
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
export declare function params(options?: RpcFnHelperProps): (fn: Parameters<typeof rpcFnHelper>[1], context: Parameters<typeof rpcFnHelper>[2]) => void;
export declare function params<This, Args extends any[], Return>(fn: ExtendedFunction<This, Args, Return>, context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>): void;
/**
 * @description A route handler to intercept GET requests
 * @example
 * ```typescript
 * // /api/rpc/route.ts or /your-endpoint/route.ts
 * import { getHandler } from "servell"
 * export const GET = getHandler
 * ```
 */
export declare const getHandler: (req: Request, res: Response) => Promise<Response>;
/**
 * @description A route handler to intercept POST requests
 * @example
 * ```typescript
 * // /api/rpc/route.ts or /your-endpoint/route.ts
 * import { postHandler } from "servell"
 * export const POST = postHandler
 * ```
 */
export declare const postHandler: (req: Request, res: Response) => Promise<Response>;
/**
 * @description A route handler to intercept PUT requests
 * @example
 * ```typescript
 * // /api/rpc/route.ts or /your-endpoint/route.ts
 * import { putHandler } from "servell"
 * export const PUT = putHandler
 * ```
 */
export declare const putHandler: (req: Request, res: Response) => Promise<Response>;
/**
 * @description A route handler to intercept PATCH requests
 * @example
 * ```typescript
 * // /api/rpc/route.ts or /your-endpoint/route.ts
 * import { patchHandler } from "servell"
 * export const PATCH = patchHandler
 * ```
 */
export declare const patchHandler: (req: Request, res: Response) => Promise<Response>;
/**
 * @description A route handler to intercept DELETE requests
 * @example
 * ```typescript
 * // /api/rpc/route.ts or /your-endpoint/route.ts
 * import { deleteHandler } from "servell"
 * export const DELETE = deleteHandler
 * ```
 */
export declare const deleteHandler: (req: Request, res: Response) => Promise<Response>;
declare const RPCExtension: unique symbol;
declare function rpcHelper<This extends new (...args: any[]) => any>(rpcProps: RpcHelperProps, klass: This, context: ClassDecoratorContext<This>): {
    new (...args: any[]): {
        [x: string]: any;
    };
} & This;
declare function rpcFnHelper<This, Args extends any[], Return>(rpcFnProps: RpcFnHelperProps, fn: ExtendedFunction<This, Args, Return>, context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>): void;
export declare function isBrowser(): boolean;
export declare function isAsyncFunction(fn: Function): boolean;
export type Result<T = undefined, U = undefined> = {
    status: "ok";
    data?: T;
} | {
    status: "error";
    data?: U;
};
interface RpcFnHelperProps {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    content?: "json" | "text";
    headers?: HeadersInit;
    body?: BodyInit | boolean;
    cache?: RequestCache;
}
interface RpcHelperProps {
    endpoint: string;
    _context?: "server" | "client";
}
interface ExtendedFunction<This, Args extends any[], Return> {
    (this: This, ...args: Args): Return;
    [RPCExtension]?: RpcFnHelperProps;
}
export {};
