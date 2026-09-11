import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";
import { createError, type H3Event } from "h3";
import { useRuntimeConfig } from "#imports";
import {
  S3Client,
  GetObjectCommand,
  type GetObjectCommandOutput,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import * as fs from "node:fs";
import { captureException } from "@sentry/nuxt";

const config = useRuntimeConfig() || {};

export async function getUpload(
  event: H3Event,
  key: string,
  range?: string,
): Promise<{
  readable: Readable;
  s3Res: GetObjectCommandOutput;
}> {
  // console.log('begin listen:', key)
  const fullPath = config.s3Prefix + key;
  const s3 = getS3();

  // console.log('getting upload:', { bucket: config.s3BucketName, fullPath })
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: config.s3BucketName,
      Key: fullPath,
      Range: range || undefined,
    }),
  );

  // validate response
  if (
    ![200, 206].includes(res.$metadata.httpStatusCode as number) ||
    !res.Body
  ) {
    throw createError({
      statusCode: res.$metadata.httpStatusCode,
      statusMessage: "File could not be retrieved on server",
    });
  }

  // create and return stream
  const _stream = res.Body.transformToWebStream();
  const readable = Readable.fromWeb(_stream as ReadableStream<unknown>, {});
  let destroyed = false;
  const safeDestroy = () => {
    if (!destroyed) {
      try {
        readable.destroy();
      } catch {
        // do nothing
      }
      // destroy the SDK body directly — this closes the HTTP connection to rustfs
      try {
        (res.Body as Readable)?.destroy?.();
      } catch {
        // do nothing
      }
      destroyed = true;
    }
  };

  // fires when the client disconnects, incl. mid-seek
  event.node.req.on("close", () => {
    safeDestroy();
  });
  event.node.res.on("close", () => {
    safeDestroy();
  });
  readable.on("error", (err) => {
    console.error(err);
    if (
      (err as unknown as Record<string, string>)?.code !==
      "ERR_STREAM_PREMATURE_CLOSE"
    ) {
      captureException(err);
    }
    safeDestroy();
  });

  return {
    s3Res: res,
    readable,
  };
}

let _S3Global: S3Client | null = null;
export function getS3() {
  if (!_S3Global) {
    const s3 = new S3Client({
      tls: config.s3UseSsl === "true",
      region: config.s3Region,
      credentials: {
        accessKeyId: config.s3AccessKey as string,
        secretAccessKey: config.s3SecretAccessKey as string,
      },
      endpoint: config.s3Endpoint as string,
      forcePathStyle: true,
    });
    _S3Global = s3;
  }

  return _S3Global;
}

// upload a file to configured s3
export async function uploadFile(
  key: string,
  file: string | Buffer | Uint8Array<ArrayBuffer>,
): Promise<void> {
  const contents = typeof file === "string" ? fs.readFileSync(file) : file;
  const s3 = getS3();

  try {
    const res = await s3.send(
      new PutObjectCommand({
        Bucket: config.s3BucketName,
        Key: config.s3Prefix + key,
        Body: contents,
      }),
    );
    if (res.$metadata.httpStatusCode !== 200) {
      console.error("upload not succeeded!", res.$metadata);
      const err = createError({
        statusCode: res.$metadata.httpStatusCode,
        statusMessage: "Unable to upload file",
      });
      captureException(err);
      throw err;
    } else {
      console.info("upload succeeded", key);
    }
  } catch (e) {
    console.error(e);
    captureException(e);
    if (e instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    } else {
      throw e;
    }
  }
}

export async function deleteFile(key: string): Promise<void> {
  const s3 = getS3();

  const deleteRes = await s3.send(
    new DeleteObjectCommand({
      Bucket: config.s3BucketName,
      Key: config.s3Prefix + key,
    }),
  );

  if (deleteRes.$metadata.httpStatusCode !== 204) {
    // TODO: add details on captured error
    const err = createError({
      statusCode: deleteRes.$metadata.httpStatusCode,
      statusMessage: "Unable to delete existing file",
    });
    captureException(err, { data: { path: key, s3: true } });
    throw err;
  } else {
    console.info("successfully deleted file:", config.s3Prefix + key);
  }
}
