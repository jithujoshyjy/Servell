# Servell

<table>
    <tr>
    <td valign="center">
        <img src="./servell.png" alt="Servell Logo" width="50"/>
    </td>
    <td>A minimal RPC library inspired by React Server Actions</td>
    </tr>
</table>

<table border="0">
    <tr>
        <td>version</td>
        <td>:</td>
        <td>v0.0.4</td>
    </tr>
    <tr>
        <td>description</td>
        <td>:</td>
        <td>
        I created it out of frustration just so that I don't have to deal with the boilerplate of writing routes handlers and fetch requests! It uses decorators and similar classes on both frontend and backend to work its magic!<br/>
        </td>
    </tr>
</table>

-- NOTES --
* Only public async methods of the class are modified.
* NextJS as of v14.2.3 does not support stage 3 ecmascript decorators by default, so you'll have to do some node_modules gymnastics to get it working (See this [issue](https://github.com/vercel/next.js/issues/48360#issuecomment-1687020800) from nextjs repo)

## Why not Server Actions?
* Server actions are limited to POST requests
* Request/Response cannot be customized
* Not ideal for fetching data
* May not be used like regular functions in a Server Component

## Usage

The package is available in npm
```bash
npm i servell
```

-- NOTE -- I'm using this library in the context of NextJS, however it is designed to work without it, so feel free to experiment.<br/><br/>

Following is the client code for fetching some todos!
```tsx
// todo-list.tsx
"use client"
import { useState, useEffect } from "react"
import { client, type Result } from "servell"

export default function TodoList() {
    const [todos, setTodos] =  useState<Todo[]>([])
    // You can use react query as well
    // sticking to stinky useEffect for simplicity
    useEffect(async () => await getTodos(setTodos), [])
    return (
        <ul>
            {todos.map(todo =>
                <li>
                    <input
                        type="checkbox"
                        checked={todo.completed}
                    />
                    <b>{todo.title}</b>
                    <p>{todo.desc}</p>
                </li>
            )}
        </ul>
    )
}

@client
class TodoActions {
    async getTodos(setTodos:  any, result?: Result) {
        if(result!.status == "ok")
            return setTodos(result!.data as Todo[])
        console.log("Error: ", result!.data)
    }
}

type Todo = {
    title: string,
    desc: string,
    completed: boolean
}
```
Now to fetch the data from the database at the server side.<br/>
Calling an method on a class marked with `@server` doesn't make a fetch call unlike a server action in React.

```tsx
// page.tsx
"use server"
import prisma from "@/lib/db"
import { server } from "servell"
import TodoList from "./_components/todo-list"

export default async function TodoPage() {
    return (
        <div>
            <TodoList />
        </div>
    )
    // we could have also fetched the data here in the
    // server component and passed it down to the `TodoList`
    /*
        const res: Result = await new TodoActions().getTodos()
        const todos = res.status == "ok" ? res.data : []
        return <div><TodoList todos={todos}/></div>
    */
}

@server
class TodoActions {
    async getTodos() {
        const todos = await prisma.todos.findMany({
            select: {
                title: true,
                desc: true,
                completed: true,
            }
        })
        return todos
    }
}
```

The final thing to do is to set up the rpc **endpoints**.<br/>
By default both `@server` and `@client` decorators use `/api/rpc` as the endpoint.<br/>
You can change it by specifying it as an argument to these decorators: `@server({ endpoint: "/your-endpoint" })`

```typescript
// /api/rpc/route.ts or /your-endpoint/route.ts
import {
    deleteHandler,
    getHandler,
    patchHandler,
    postHandler,
    putHandler
} from "servell"

export const GET = getHandler
export const POST = postHandler
export const PUT = putHandler
export const PATCH = patchHandler
export const DELETE = deleteHandler
```

You can customize the `method`, `content`, `headers`, `body` and `cache` properties of a Request/Response with the `@params` decorator.

```typescript
import { client, params } from "servell"

@client
class TodoActions {
    @params({ method: "PATCH" })
    async updateTodos(todo: Todo, result?: Result) {
        if(result!.status == "ok")
            return console.log("Update succeeded")
        console.log("Update failed!")
    }
}
```

Let me know if you enjoy it!

---
<center>peace✌</center>
