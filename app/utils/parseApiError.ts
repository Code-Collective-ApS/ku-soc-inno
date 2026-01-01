import type { FetchContext, ResponseType } from "ofetch";

export async function parseApiError(_res: ApiErrorType): Promise<string> {
  // if res is string, return it already
  if (typeof _res === "string") {
    return _res.trim();
  }

  // set initial variables
  let json: undefined | AnyBody = undefined;
  let status = 500;

  // if _res is context, update it to be Response

  if ((_res as FetchContext<AnyBody, ResponseType>)?.response) {
    _res = (_res as FetchContext<AnyBody, ResponseType>).response as Response;
  }

  if (
    (_res as { _data: AnyBody })?._data?.message &&
    (_res as { _data: AnyBody })?._data?.message.startsWith("[")
  ) {
    json = JSON.parse(_res._data.message);
  } else if (
    (_res as { _data: AnyBody })?._data?.data?.message &&
    (_res as { _data: AnyBody })?._data?.data?.message.startsWith("[")
  ) {
    json = JSON.parse(_res._data.data.message);
  } else if (_res instanceof Response && _res.json && !_res.bodyUsed) {
    // res is a normal response object
    json = await _res.json();
    status = _res.status;
  } else {
    // res is a custom body
    json = _res as AnyBody;
  }

  const err = (
    "" +
    (json?.message ||
      json?.statusText ||
      json?.statusMessage ||
      JSON.stringify(json))
  )
    .replaceAll("\n", "")
    .trim();
  const errMsg = errFromJson(err);
  return errMsg || `Unknown error (status ${status})`;
}

function errFromJson(txt: string) {
  try {
    const parsed = JSON.parse(txt);
    console.log("parsed:", { parsed, txt });
    const obj = Array.isArray(parsed) ? parsed[0] : parsed;
    let msg = obj?.message || "Error could not be parsed";
    const zodErrPath = obj?.path?.[0];
    if (zodErrPath) {
      console.log("error is zod path!");
      // msg = `[${zodErrPath}] ${msg}`;
      msg = `${msg}`;
    }
    console.log("final msg is ", msg);
    return msg;
  } catch {
    return txt;
  }
}
