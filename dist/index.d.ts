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
export declare function server<T>(arg0?: RpcHelperProps | Class<T>, context?: ClassDecoratorContext): {
    new (...args: any[]): {
        [x: string]: any;
    };
} | ((klass: Class<any>, context: ClassDecoratorContext) => {
    new (...args: any[]): {
        [x: string]: any;
    };
});
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
export declare function client<T>(arg0?: RpcHelperProps | Class<T>, context?: ClassDecoratorContext): {
    new (...args: any[]): {
        [x: string]: any;
    };
} | ((klass: Class<any>, context: ClassDecoratorContext) => {
    new (...args: any[]): {
        [x: string]: any;
    };
});
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
export declare function params<T>(arg0?: RpcFnHelperProps | ExtendedFunction, context?: RpcFnHelperDecoratorContext<T>): void | ((fn: ExtendedFunction, context: RpcFnHelperDecoratorContext<unknown>) => void);
export declare const getHandler: (req: Request, res: Response) => Promise<Response>;
export declare const postHandler: (req: Request, res: Response) => Promise<Response>;
export declare const putHandler: (req: Request, res: Response) => Promise<Response>;
export declare const patchHandler: (req: Request, res: Response) => Promise<Response>;
export declare const deleteHandler: (req: Request, res: Response) => Promise<Response>;
export type ClassDecoratorContext = {
    kind: "class";
    name: string | undefined;
    addInitializer(initializer: () => void): void;
};
declare const RPCExtension: unique symbol;
export declare function isBrowser(): boolean;
export declare function isAsyncFunction(fn: Function): boolean;
export type Result<T = undefined, U = undefined> = {
    status: "ok";
    data?: T;
} | {
    status: "error";
    data?: U;
};
type RpcFnHelperDecoratorContext<T> = ClassMethodDecoratorContext<T, (...args: any[]) => Promise<any>>;
type Class<T = any> = new (...args: any[]) => T;
interface RpcFnHelperProps {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    content?: "json" | "text";
    headers?: HeadersInit;
    body?: BodyInit;
    cache?: RequestCache;
}
interface RpcHelperProps {
    endpoint: string;
    _context?: "server" | "client";
}
interface ExtendedFunction {
    (...args: any[]): any;
    [RPCExtension]: RpcFnHelperProps;
}
export {};
