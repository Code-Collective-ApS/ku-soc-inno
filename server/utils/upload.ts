import type { Files } from "h3-formidable";
import * as fs from "node:fs";
import { prettyByteSize } from "~~/shared/utils/text";

export function readFormidableFormFiles(
  files: Files,
  maxFileSize: number,
  allowedTypes?: string[],
): File[] {
  const resultFiles: File[] = [];
  for (const f of files) {
    let lastModified = new Date(f.lastModifiedDate).getTime();
    let fileName = f.originalFilename;
    const size = f.size;
    const mimetype = f.mimetype;

    if (isNaN(lastModified)) {
      console.warn(
        "lastModifiedDate was not present in file. Setting it to now",
      );
      lastModified = Date.now();
    } else if (!fileName) {
      console.warn(
        "originalFilename was not present in file. Setting it to `newFilename`",
      );
      fileName = f.newFilename;
    }

    // ensure that all the meta values are truthy
    if (!fileName || !lastModified || !size || !mimetype) {
      const missing = !fileName
        ? "filename"
        : !lastModified
          ? "lastModified"
          : !size
            ? "size"
            : !mimetype
              ? "mimetype"
              : "unknown";
      throw createError({
        statusCode: 500,
        statusMessage: `Unable to read ${missing} from file upload. Halting operation.`,
      });
    }

    // ensure mimetype is allowed if allowedTypes is defined
    if (allowedTypes && !allowedTypes.includes(mimetype)) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Invalid file type. Allowed types are: " +
          allowedTypes.join(", ") +
          ".",
      });
    }

    // ensure file size does not exceed max size
    if (size > maxFileSize) {
      throw createError({
        statusCode: 400,
        statusMessage: `File size ${prettyByteSize(size)} is too large. Max allowed is ${prettyByteSize(maxFileSize)}`,
      });
    }

    // start reading file
    const buf = fs.readFileSync(f.filepath);
    const file = new File([buf], fileName, {
      type: mimetype,
      lastModified,
    });
    resultFiles.push(file);
  }

  return resultFiles;
}
