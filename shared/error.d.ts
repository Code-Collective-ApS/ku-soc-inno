import type { FetchContext, FetchResponse, ResponseType } from "ofetch";

// TODO: rename this file ?

declare global {
  type AnyType = string | number | boolean | null;
  type AnyObject = Record<string, AnyType>;
  type AnyBody = Record<string, AnyType | AnyObject | AnyBody>;
  type ApiErrorType =
    | string
    | Error
    | AnyBody
    | Response
    | (FetchContext<AnyBody, ResponseType> & {
        response: FetchResponse<AnyBody>;
      });
}

export {};
