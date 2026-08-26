export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export const MAX_PHOTO_SIZE_LABEL = "15 MB";

export const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const PHOTO_INPUT_ACCEPT =
  ".jpg,.jpeg,.jpe,.jfif,.png,.webp,.avif,.heic,.heif,image/jpeg,image/pjpeg,image/png,image/x-png,image/webp,image/avif,image/heic,image/heif,image/heic-sequence,image/heif-sequence";

export async function normalizeMobilePhoto(file: File) {
  if (isHeicPhoto(file)) {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.88,
    });
    const jpegBlob = Array.isArray(converted) ? converted[0] : converted;

    return new File([jpegBlob], replaceFileExtension(file.name, ".jpg"), {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  }

  const inferredType = inferSupportedPhotoType(file);

  return inferredType && inferredType !== file.type
    ? new File([file], file.name, {
        type: inferredType,
        lastModified: file.lastModified,
      })
    : file;
}

function isHeicPhoto(file: File) {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.type === "image/heic-sequence" ||
    file.type === "image/heif-sequence" ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

function inferSupportedPhotoType(file: File) {
  if (file.type === "image/jpg" || file.type === "image/pjpeg") {
    return "image/jpeg";
  }

  if (file.type === "image/x-png") {
    return "image/png";
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  const typeByExtension: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    jpe: "image/jpeg",
    jfif: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
  };

  if (ALLOWED_PHOTO_TYPES.has(file.type)) {
    return file.type;
  }

  return extension ? typeByExtension[extension] : undefined;
}

function replaceFileExtension(fileName: string, extension: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "") || "foto";
  return `${baseName}${extension}`;
}
