"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { REGISTER_PAYLOAD_KEY, setRegisterStep } from "../register-flow";
import { RegisterStepDots } from "../RegisterStepDots";
import { useRegistrationCompletion } from "./useRegistrationCompletion";

type ProfilePhoto = {
  file: File;
  previewUrl: string;
};

const MAX_PHOTOS = 3;

export default function ProfilePhotosPage() {
  const router = useRouter();
  const completeRegistration = useRegistrationCompletion();
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const photosRef = useRef<ProfilePhoto[]>([]);

  const remainingSlots = MAX_PHOTOS - photos.length;
  const canAddPhotos = remainingSlots > 0;

  useEffect(() => {
    if (!localStorage.getItem(REGISTER_PAYLOAD_KEY)) {
      router.replace("/register/basic-info");
      return;
    }

    setRegisterStep("/register/profile-photos");
  }, [router]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) =>
        URL.revokeObjectURL(photo.previewUrl),
      );
    };
  }, []);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length !== selectedFiles.length) {
      setError("Envie apenas arquivos de imagem.");
      event.target.value = "";
      return;
    }

    if (selectedFiles.length > remainingSlots) {
      setError("Você pode enviar no máximo 3 fotos.");
    } else {
      setError("");
    }

    const nextPhotos = imageFiles.slice(0, remainingSlots).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos((currentPhotos) => [...currentPhotos, ...nextPhotos]);
    event.target.value = "";
  }

  function removePhoto(previewUrl: string) {
    setPhotos((currentPhotos) => {
      const photoToRemove = currentPhotos.find(
        (photo) => photo.previewUrl === previewUrl,
      );

      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }

      return currentPhotos.filter((photo) => photo.previewUrl !== previewUrl);
    });
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (photos.length < 1) {
      setError("Envie pelo menos 1 foto para continuar.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const currentPayload = JSON.parse(
      localStorage.getItem(REGISTER_PAYLOAD_KEY) ?? "{}",
    );

    try {
      const profilePhotos = await Promise.all(
        photos.map(async (photo) => ({
          dataUrl: await fileToDataUrl(photo.file),
          fileName: photo.file.name,
          mimeType: photo.file.type,
        })),
      );

      const payload = {
        ...currentPayload,
        profilePhotos,
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ?? "Não foi possível finalizar o cadastro.",
        );
      }

      await completeRegistration(result);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível finalizar o cadastro.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[url('/register-wallpaper-marble.jpg')] bg-cover bg-center px-5 py-10 text-black-jewel">
      <section className="w-full max-w-140 bg-surface px-4 py-6 shadow-[0_22px_60px_rgba(20,17,14,0.18)] sm:px-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <RegisterStepDots currentStep="/register/profile-photos" />

          <div>
            <h1 className="text-2xl font-bold text-black-jewel">
              Fotos do perfil
            </h1>
            <p className="text-sm text-[color-mix(in_srgb,var(--black)_64%,transparent)]">
              Envie de 1 a 3 fotos para completar seu cadastro.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div
                key={photo.previewUrl}
                className="relative aspect-3/4 overflow-hidden rounded-sm border border-silver bg-[color-mix(in_srgb,var(--gold-soft)_28%,white)]"
              >
                {/* Blob previews come from local files and should not use Next image optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt={`Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Remover foto ${index + 1}`}
                  onClick={() => removePhoto(photo.previewUrl)}
                  className="absolute right-1 top-1 h-8 w-8 rounded-sm bg-[color-mix(in_srgb,var(--black)_70%,transparent)] text-white hover:bg-ruby hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {canAddPhotos &&
              Array.from({ length: remainingSlots }, (_, index) => (
                <label
                  key={index}
                  className="flex aspect-3/4 cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-[color-mix(in_srgb,var(--gold)_70%,var(--black))] bg-[color-mix(in_srgb,var(--gold-soft)_34%,white)] text-center transition hover:border-gold hover:bg-[color-mix(in_srgb,var(--gold-soft)_56%,white)]"
                >
                  <ImagePlus className="h-7 w-7 text-gold" />
                  <span className="px-2 text-xs font-bold text-black-jewel">
                    Adicionar foto
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handlePhotoChange}
                  />
                </label>
              ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-bold text-black-jewel">
              <span>{photos.length} de 3 fotos</span>
              <span>Mínimo 1</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--silver)_45%,white)]">
              <div
                className="h-full bg-gold transition-all"
                style={{ width: `${(photos.length / MAX_PHOTOS) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-sm bg-[color-mix(in_srgb,var(--ruby)_12%,white)] px-3 py-2 text-sm font-bold text-ruby">
              {error}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(getPreviousStep())}
              className="h-12 rounded-sm border border-silver text-base font-bold text-black-jewel hover:bg-[color-mix(in_srgb,var(--silver)_28%,white)]"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={photos.length < 1 || isSubmitting}
              className="h-12 rounded-sm bg-emerald text-base font-bold text-white hover:bg-emerald/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Finalizar Cadastro"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a foto."));
    reader.readAsDataURL(file);
  });
}

function getPreviousStep() {
  const payload = JSON.parse(
    window.localStorage.getItem(REGISTER_PAYLOAD_KEY) ?? "{}",
  ) as Record<string, unknown>;
  const profileType = String(payload.profileType ?? "")
    .trim()
    .toLowerCase();

  return profileType.startsWith("sugar-baby")
    ? "/register/social-contacts"
    : "/register/almost-there";
}
