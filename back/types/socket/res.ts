export type Socket_event = `${Lowercase<string>}` & Exclude<string, `.${string}` | `${string}.`>;

export type Socket_StandardRes_Error = [
    "error" | "error.valid",
    Socket_event,
    ...any[]
  ];  

export interface Socket_StandardRes<T=any> {
    err: boolean | Socket_StandardRes_Error[]
    res?: T
}