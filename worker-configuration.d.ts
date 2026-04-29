interface Env {
  GlobalDurableObject: DurableObjectNamespace<import("./worker/core-utils").GlobalDurableObject>;
}
declare module 'cloudflare:workers' {
  export interface DurableObjectState {
    id: DurableObjectId;
    storage: DurableObjectStorage;
  }
  export abstract class DurableObject<E = any, S = any> {
    constructor(state: DurableObjectState, env: E);
  }
  export interface DurableObjectNamespace<T> {
    idFromName(name: string): DurableObjectId;
    idFromString(id: string): DurableObjectId;
    get(id: DurableObjectId): DurableObjectStub<T>;
    newUniqueId(): DurableObjectId;
  }
  export interface DurableObjectId {
    toString(): string;
  }
  export interface DurableObjectStub<T> {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    [key: string]: any;
  }
  export interface DurableObjectStorage {
    get<T = unknown>(key: string): Promise<T | undefined>;
    put(key: string, value: unknown): Promise<void>;
    delete(key: string): Promise<boolean>;
    deleteAll(): Promise<void>;
    list<T = unknown>(options?: { prefix?: string; limit?: number; startAfter?: string; reverse?: boolean }): Promise<Map<string, T>>;
    transaction<T>(closure: (txn: DurableObjectTransaction) => Promise<T>): Promise<T>;
  }
  export interface DurableObjectTransaction {
    get<T = unknown>(key: string): Promise<T | undefined>;
    put(key: string, value: unknown): Promise<void>;
    delete(key: string): Promise<boolean>;
  }
}
interface ExportedHandler<E = any> {
  fetch: (request: Request, env: E, ctx: any) => Promise<Response> | Response;
}