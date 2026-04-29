interface Env {
  GlobalDurableObject: DurableObjectNamespace<import("./worker/core-utils").GlobalDurableObject>;
}

declare module 'cloudflare:workers' {
  export interface DurableObjectState {
    id: DurableObjectId;
    storage: DurableObjectStorage;
  }

  export class DurableObject {
    constructor(state: DurableObjectState, env: Env);
  }

  export interface DurableObjectNamespace<T extends DurableObject> {
    idFromName(name: string): DurableObjectId;
    idFromString(id: string): DurableObjectId;
    get(id: DurableObjectId): Promise<DurableObjectStub<T>>;
    getFromName(name: string): Promise<DurableObjectStub<T>>;
  }

  export class DurableObjectId {
    toString(): string;
  }

  export interface DurableObjectStub<T extends DurableObject> {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  }

  export interface DurableObjectStorage {
    get<T = unknown>(key: string): Promise<T | undefined>;
    put(key: string, value: unknown): Promise<void>;
    delete(key: string): Promise<boolean>;
    deleteAll(): Promise<void>;
    list<T = unknown>(): Promise<{ keys: string[] }>;
  }

  export interface DurableObjectTransaction {
    [key: string]: any;
  }
}