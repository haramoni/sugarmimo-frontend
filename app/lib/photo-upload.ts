export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export const MAX_PHOTO_SIZE_LABEL = "15 MB";
export const MAX_TOTAL_PHOTO_BYTES = 45 * 1024 * 1024;
export const MAX_TOTAL_PHOTO_SIZE_LABEL = "45 MB";

export const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const PHOTO_INPUT_ACCEPT =
  ".jpg,.jpeg,.jpe,.jfif,.png,.webp,.avif,.heic,.heif,image/jpeg,image/pjpeg,image/png,image/x-png,image/webp,image/avif,image/heic,image/heif,image/heic-sequence,image/heif-sequence";

export async function normalizeMobilePhoto(file: File) {
  const stableFile = await copyPhotoWhileAccessible(file);

  if (isHeicPhoto(stableFile)) {
    try {
      const { default: heic2any } = await import("heic2any");
      const converted = await heic2any({
        blob: stableFile,
        toType: "image/jpeg",
        quality: 0.95,
      });
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted;

      return new File(
        [jpegBlob],
        replaceFileExtension(stableFile.name, ".jpg"),
        {
          type: "image/jpeg",
          lastModified: stableFile.lastModified,
        },
      );
    } catch {
      throw new Error(
        "Não foi possível converter uma foto HEIC/HEIF. Tente escolher outra imagem ou exportá-la como JPEG.",
      );
    }
  }

  const inferredType = inferSupportedPhotoType(stableFile);

  return inferredType && inferredType !== stableFile.type
    ? new File([stableFile], stableFile.name, {
        type: inferredType,
        lastModified: stableFile.lastModified,
      })
    : stableFile;
}

async function copyPhotoWhileAccessible(file: File) {
  try {
    const contents = await file.arrayBuffer();

    if (contents.byteLength === 0) {
      throw new Error("empty-photo");
    }

    // Some Android document providers expose a temporary file reference. Keep
    // an app-owned Blob copy so it remains readable after the picker closes.
    return new File([contents], file.name || "foto", {
      type: file.type,
      lastModified: file.lastModified,
    });
  } catch {
    throw new Error(
      `Não foi possível acessar a foto “${file.name || "selecionada"}”. Salve a imagem na galeria e tente novamente.`,
    );
  }
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
