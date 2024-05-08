import { type Logger } from "winston";

type RequestContextType = {
  logger: Logger;
  requestId: string;
  userId: number | string;
};

// NOTE: if we ever moved our node backend to a standalone server, we'd need to use middleware on our web server (express, etc) for
// managing this request context between concurrent requests. Serverless functions run in isolation, so they can't ever share memory.
// But a traditional express app would handle multiple requests at the same time in the same process, so there'd be multiple requests
// that would be sharing this data. Something like https://www.npmjs.com/package/express-http-context
const requestData: Partial<RequestContextType> = {};

export const RequestContext = {
  get<T extends keyof RequestContextType>(
    key: T,
  ): RequestContextType[T] | null {
    return requestData[key] ?? null;
  },

  getEnforce<T extends keyof RequestContextType>(
    key: T,
  ): RequestContextType[T] {
    const value = requestData[key];
    if (!value) {
      throw new Error(`Expected RequestContext to have a value for ${key}`);
    }
    return value as RequestContextType[T];
  },

  set<T extends keyof RequestContextType>(
    key: T,
    value: RequestContextType[T],
  ): void {
    requestData[key] = value;
  },
};
