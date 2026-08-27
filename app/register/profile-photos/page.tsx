"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  ImagePlus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_SIZE_LABEL,
  normalizeMobilePhoto,
  PHOTO_INPUT_ACCEPT,
} from "@/app/lib/photo-upload";
import {
  getStoredReferralUsername,
  REGISTER_PAYLOAD_KEY,
  setRegisterStep,
} from "../register-flow";
import { RegisterStepDots } from "../RegisterStepDots";
import { useRegistrationCompletion } from "./useRegistrationCompletion";

type ProfilePhoto = {
  file: File;
  previewUrl: string;
  rightsConfirmed: boolean;
};

type RegistrationPolicies = {
  termsVersion: string;
  privacyVersion: string;
  cookieVersion: string;
  receiptVersion: string;
};

type RegistrationSummary = {
  username: string;
  email: string;
  profileType: string;
  location: string;
  marketingConsent: boolean;
};

const MAX_PHOTOS = 3;

export default function ProfilePhotosPage() {
  const router = useRouter();
  const completeRegistration = useRegistrationCompletion();
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const photosRequired = useSyncExternalStore(
    subscribeToSavedProfile,
    arePhotosRequiredForSavedProfile,
    () => true,
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [receiptConfirmed, setReceiptConfirmed] = useState(false);
  const [receiptError, setReceiptError] = useState("");
  const [reviewedAt, setReviewedAt] = useState<Date | null>(null);
  const [registrationPolicies, setRegistrationPolicies] =
    useState<RegistrationPolicies | null>(null);
  const [registrationSummary, setRegistrationSummary] =
    useState<RegistrationSummary | null>(null);
  const photosRef = useRef<ProfilePhoto[]>([]);

  const remainingSlots = MAX_PHOTOS - photos.length;
  const canAddPhotos = remainingSlots > 0;
  const allPhotosConfirmed =
    photos.length > 0 && photos.every((photo) => photo.rightsConfirmed);

  useEffect(() => {
    const savedPayload = localStorage.getItem(REGISTER_PAYLOAD_KEY);

    if (!savedPayload) {
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

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    setIsProcessingPhotos(true);

    try {
      const oversizedSources = selectedFiles.filter(
        (file) => file.size > MAX_PHOTO_BYTES,
      );

      if (oversizedSources.length > 0) {
        setError(getOversizedPhotoMessage(oversizedSources));
        return;
      }

      const normalizedFiles = await Promise.all(
        selectedFiles.map(normalizeMobilePhoto),
      );

      const imageFiles = normalizedFiles.filter((file) =>
        ALLOWED_PHOTO_TYPES.has(file.type),
      );

      if (imageFiles.length !== normalizedFiles.length) {
        setError("Envie apenas fotos JPEG, PNG, WebP, AVIF, HEIC ou HEIF.");
        return;
      }

      const oversizedFiles = imageFiles.filter(
        (file) => file.size > MAX_PHOTO_BYTES,
      );

      if (oversizedFiles.length > 0) {
        setError(getOversizedPhotoMessage(oversizedFiles));
        return;
      }

      if (normalizedFiles.length > remainingSlots) {
        setError(
          remainingSlots === 0
            ? `Você já atingiu o limite de ${MAX_PHOTOS} fotos.`
            : `Apenas ${remainingSlots} ${remainingSlots === 1 ? "foto foi adicionada" : "fotos foram adicionadas"}. O limite do cadastro é de ${MAX_PHOTOS} fotos.`,
        );
      } else {
        setError("");
      }

      const nextPhotos = imageFiles.slice(0, remainingSlots).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        rightsConfirmed: false,
      }));

      setPhotos((currentPhotos) => [...currentPhotos, ...nextPhotos]);
    } catch {
      setError(
        "Não foi possível converter uma foto HEIC/HEIF. Tente escolher outra imagem ou exportá-la como JPEG.",
      );
    } finally {
      setIsProcessingPhotos(false);
    }
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

  function setPhotoRightsConfirmed(previewUrl: string, confirmed: boolean) {
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.previewUrl === previewUrl
          ? { ...photo, rightsConfirmed: confirmed }
          : photo,
      ),
    );
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validatePhotosForCompletion()) {
      return;
    }

    setError("");
    setIsLoadingReview(true);

    try {
      const response = await fetch("/api/auth/registration-policies", {
        cache: "no-store",
      });
      const result = (await response.json().catch(() => null)) as
        RegistrationPolicies | { message?: string } | null;

      if (!response.ok || !isRegistrationPolicies(result)) {
        throw new Error(
          result && "message" in result
            ? result.message
            : "Não foi possível consultar as versões das políticas.",
        );
      }

      const currentPayload = getCurrentRegistrationPayload();
      setRegistrationPolicies(result);
      setRegistrationSummary(buildRegistrationSummary(currentPayload));
      setReviewedAt(new Date());
      setReceiptConfirmed(false);
      setReceiptError("");
      setIsReviewOpen(true);
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Não foi possível preparar o resumo do cadastro.",
      );
    } finally {
      setIsLoadingReview(false);
    }
  }

  function validatePhotosForCompletion() {
    if (photosRequired && photos.length < 1) {
      setError("Envie pelo menos 1 foto para continuar.");
      return false;
    }

    if (photos.length > MAX_PHOTOS) {
      setError(`Você pode enviar no máximo ${MAX_PHOTOS} fotos.`);
      return false;
    }

    if (photos.length > 0 && !allPhotosConfirmed) {
      setError(
        "Confirme a titularidade e a autorização de uso de cada foto antes de finalizar.",
      );
      return false;
    }

    const oversizedPhoto = photos.find(
      (photo) => photo.file.size > MAX_PHOTO_BYTES,
    );

    if (oversizedPhoto) {
      setError(getOversizedPhotoMessage([oversizedPhoto.file]));
      return false;
    }

    setError("");
    return true;
  }

  async function finalizeRegistration() {
    if (!receiptConfirmed || !validatePhotosForCompletion()) {
      setReceiptError(
        "Confirme que revisou o resumo antes de finalizar o cadastro.",
      );
      return;
    }

    setReceiptError("");
    setIsSubmitting(true);

    const currentPayload = getCurrentRegistrationPayload();

    try {
      const profilePhotos = await Promise.all(
        photos.map(async (photo) => ({
          dataUrl: await fileToDataUrl(photo.file),
          fileName: photo.file.name,
          mimeType: photo.file.type,
          rightsConfirmed: photo.rightsConfirmed,
        })),
      );

      const payload = {
        ...currentPayload,
        referralUsername: getStoredReferralUsername(),
        profilePhotos,
        registrationReceiptConfirmed: true,
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
      setReceiptError(
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

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-black-jewel">
                  Fotos do perfil
                </h1>
                <p className="text-sm text-[color-mix(in_srgb,var(--black)_64%,transparent)]">
                  {photosRequired
                    ? "Escolha suas melhores fotos para completar o cadastro."
                    : "Você pode adicionar fotos agora ou concluir o cadastro sem elas."}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--gold-soft)_65%,white)] px-3 py-1 text-xs font-extrabold text-black-jewel">
                Até {MAX_PHOTOS} fotos
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-sm border border-gold/45 bg-[color-mix(in_srgb,var(--gold-soft)_24%,white)] p-3 text-center text-xs font-bold text-black-jewel/75">
              <span>
                {photosRequired
                  ? `De 1 a ${MAX_PHOTOS} fotos`
                  : `Até ${MAX_PHOTOS} fotos (opcional)`}
              </span>
              <span>Até {MAX_PHOTO_SIZE_LABEL} cada</span>
              <span>JPEG, PNG, WebP, AVIF ou HEIC</span>
            </div>

            <div className="space-y-2 rounded-sm border border-emerald/25 bg-white/78 p-4 text-sm leading-6 text-black-jewel/72">
              <div className="flex items-start gap-2 font-bold text-black-jewel">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald" />
                <p>Confirme separadamente a autorização de cada foto.</p>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-xs font-medium leading-5">
                <li>
                  Publique somente imagens suas ou que você esteja autorizado a
                  usar.
                </li>
                <li>É proibido publicar imagens íntimas de terceiros.</li>
                <li>
                  É proibido qualquer conteúdo envolvendo menores de 18 anos.
                </li>
                <li>
                  As fotos passam por validação e moderação e podem ser
                  removidas se violarem as regras.
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <div key={photo.previewUrl} className="space-y-2">
                <div className="relative aspect-3/4 overflow-hidden rounded-sm border border-silver bg-[color-mix(in_srgb,var(--gold-soft)_28%,white)]">
                  {/* Blob previews come from local files and should not use Next image optimization. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={`Foto ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-1 top-1 rounded-sm bg-black/68 px-2 py-1 text-[0.65rem] font-extrabold text-white">
                    Foto {index + 1}
                  </span>
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
                <label
                  htmlFor={`photo-rights-${index}`}
                  className="flex cursor-pointer items-start gap-2 rounded-sm border border-silver/80 bg-white/85 p-2 text-xs font-semibold leading-4 text-black-jewel"
                >
                  <Checkbox
                    id={`photo-rights-${index}`}
                    checked={photo.rightsConfirmed}
                    onCheckedChange={(checked) =>
                      setPhotoRightsConfirmed(
                        photo.previewUrl,
                        checked === true,
                      )
                    }
                    required
                    className="mt-0.5 shrink-0"
                  />
                  <span>
                    Confirmo que esta foto é minha ou que tenho autorização para
                    utilizá-la.
                  </span>
                </label>
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
                    aria-label={`Adicionar fotos. Restam ${remainingSlots} de ${MAX_PHOTOS}.`}
                    accept={PHOTO_INPUT_ACCEPT}
                    multiple
                    disabled={isProcessingPhotos}
                    className="sr-only"
                    onChange={handlePhotoChange}
                  />
                </label>
              ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-bold text-black-jewel">
              <span>
                {photos.length} de {MAX_PHOTOS} fotos
              </span>
              <span>{photosRequired ? "Mínimo 1" : "Opcional"}</span>
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
              disabled={
                (photosRequired && !allPhotosConfirmed) ||
                (!photosRequired && photos.length > 0 && !allPhotosConfirmed) ||
                isProcessingPhotos ||
                isLoadingReview ||
                isSubmitting
              }
              className="h-12 rounded-sm bg-emerald text-base font-bold text-white hover:bg-emerald/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessingPhotos
                ? "Preparando fotos..."
                : isSubmitting
                  ? "Enviando..."
                  : isLoadingReview
                    ? "Preparando resumo..."
                    : "Revisar e concluir"}
            </Button>
          </div>
        </form>
      </section>

      <Dialog
        open={isReviewOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) {
            setIsReviewOpen(open);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto border-gold/35 bg-surface sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald/12 text-emerald">
                <FileCheck2 className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle>Revise antes de concluir</DialogTitle>
                <DialogDescription className="mt-1">
                  Confira o resumo e as versões registradas no seu aceite.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {registrationSummary && registrationPolicies && reviewedAt ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-lg border border-emerald/25 bg-emerald/6 p-4 text-sm">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-emerald" />
                <div>
                  <p className="font-extrabold text-black-jewel">
                    Data e hora da confirmação
                  </p>
                  <p className="mt-1 text-black-jewel/70">
                    {formatReceiptDate(reviewedAt)}
                  </p>
                  <p className="mt-1 text-xs text-black-jewel/58">
                    O horário definitivo será registrado pelo servidor ao
                    concluir.
                  </p>
                </div>
              </div>

              <section aria-labelledby="registration-summary-title">
                <h3
                  id="registration-summary-title"
                  className="text-sm font-extrabold uppercase tracking-wide text-black-jewel"
                >
                  Resumo do cadastro
                </h3>
                <dl className="mt-3 grid gap-2 rounded-lg border border-silver/65 bg-white/75 p-4 text-sm sm:grid-cols-2">
                  <ReceiptItem
                    label="Usuário"
                    value={registrationSummary.username}
                  />
                  <ReceiptItem
                    label="E-mail"
                    value={registrationSummary.email}
                  />
                  <ReceiptItem
                    label="Tipo de perfil"
                    value={registrationSummary.profileType}
                  />
                  <ReceiptItem
                    label="Localização"
                    value={registrationSummary.location}
                  />
                  <ReceiptItem
                    label="Fotos"
                    value={`${photos.length} ${photos.length === 1 ? "foto" : "fotos"}`}
                  />
                  <ReceiptItem
                    label="Comunicações promocionais"
                    value={
                      registrationSummary.marketingConsent
                        ? "Aceitas"
                        : "Não aceitas"
                    }
                  />
                </dl>
              </section>

              <section aria-labelledby="policy-summary-title">
                <h3
                  id="policy-summary-title"
                  className="text-sm font-extrabold uppercase tracking-wide text-black-jewel"
                >
                  Políticas e versões
                </h3>
                <div className="mt-3 divide-y divide-silver/55 rounded-lg border border-silver/65 bg-white/75">
                  <PolicyReceiptRow
                    href="/terms"
                    label="Termos de Uso"
                    version={registrationPolicies.termsVersion}
                  />
                  <PolicyReceiptRow
                    href="/privacy"
                    label="Política de Privacidade"
                    version={registrationPolicies.privacyVersion}
                  />
                  <PolicyReceiptRow
                    href="/privacy#pagina-8"
                    label="Política de Cookies"
                    version={registrationPolicies.cookieVersion}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-black-jewel/58">
                  A ciência da Política de Cookies não altera sua escolha sobre
                  cookies opcionais.
                </p>
              </section>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gold/45 bg-gold-soft/22 p-4 text-sm font-bold leading-5 text-black-jewel">
                <Checkbox
                  checked={receiptConfirmed}
                  onCheckedChange={(checked) => {
                    setReceiptConfirmed(checked === true);
                    setReceiptError("");
                  }}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  Revisei o resumo acima e confirmo que desejo concluir meu
                  cadastro.
                </span>
              </label>

              {receiptError ? (
                <p className="rounded-lg bg-ruby/10 px-3 py-2 text-sm font-bold text-ruby">
                  {receiptError}
                </p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => setIsReviewOpen(false)}
              className="border border-silver"
            >
              Voltar e editar
            </Button>
            <Button
              type="button"
              disabled={!receiptConfirmed || isSubmitting}
              onClick={() => void finalizeRegistration()}
              className="bg-emerald font-bold text-white hover:bg-emerald/85"
            >
              {isSubmitting ? "Concluindo..." : "Confirmar e finalizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function getCurrentRegistrationPayload(): Record<string, unknown> {
  try {
    const payload = JSON.parse(
      window.localStorage.getItem(REGISTER_PAYLOAD_KEY) ?? "{}",
    );
    return payload && typeof payload === "object" ? payload : {};
  } catch {
    return {};
  }
}

function parseRegistrationPayload(value: string): Record<string, unknown> {
  try {
    const payload = JSON.parse(value);
    return payload && typeof payload === "object" ? payload : {};
  } catch {
    return {};
  }
}

function arePhotosRequiredForSavedProfile() {
  if (typeof window === "undefined") {
    return true;
  }

  const savedPayload = window.localStorage.getItem(REGISTER_PAYLOAD_KEY);
  return savedPayload
    ? isSugarBabyProfile(parseRegistrationPayload(savedPayload))
    : true;
}

function subscribeToSavedProfile() {
  return () => undefined;
}

function isSugarBabyProfile(payload: Record<string, unknown>) {
  const profileType = String(payload.profileType ?? "")
    .trim()
    .toLowerCase();

  return profileType.startsWith("sugar-baby");
}

function buildRegistrationSummary(
  payload: Record<string, unknown>,
): RegistrationSummary {
  const location = [payload.city, payload.state, payload.country]
    .map(toDisplayText)
    .filter((value) => value !== "Não informado")
    .join(" • ");

  return {
    username: toDisplayText(payload.username),
    email: toDisplayText(payload.email),
    profileType: getProfileTypeLabel(toDisplayText(payload.profileType)),
    location: location || "Não informado",
    marketingConsent: payload.marketingConsent === true,
  };
}

function toDisplayText(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return "Não informado";
  }

  return value.trim();
}

function getProfileTypeLabel(profileType: string) {
  const labels: Record<string, string> = {
    "sugar-daddy": "Sugar Daddy",
    "sugar-mommy": "Sugar Mommy",
    "sugar-baby-woman": "Sugar Baby (Mulher)",
    "sugar-baby-trans-woman": "Sugar Baby (Mulher trans)",
    "sugar-baby-man": "Sugar Baby (Homem)",
    "sugar-baby-trans-man": "Sugar Baby (Homem trans)",
  };

  return labels[profileType] ?? profileType;
}

function isRegistrationPolicies(
  value: RegistrationPolicies | { message?: string } | null,
): value is RegistrationPolicies {
  return Boolean(
    value &&
    "termsVersion" in value &&
    typeof value.termsVersion === "string" &&
    typeof value.privacyVersion === "string" &&
    typeof value.cookieVersion === "string" &&
    typeof value.receiptVersion === "string",
  );
}

function formatReceiptDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(value);
}

function ReceiptItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-bold uppercase tracking-wide text-black-jewel/52">
        {label}
      </dt>
      <dd className="mt-1 break-words font-semibold text-black-jewel">
        {value}
      </dd>
    </div>
  );
}

function PolicyReceiptRow({
  href,
  label,
  version,
}: {
  href: string;
  label: string;
  version: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 text-sm">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald" />
      <Link
        href={href}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 font-bold text-emerald underline decoration-emerald/30 underline-offset-3"
      >
        {label}
      </Link>
      <span className="shrink-0 rounded-full bg-gold-soft/45 px-2.5 py-1 text-xs font-extrabold text-black-jewel">
        Versão {version}
      </span>
    </div>
  );
}

function getOversizedPhotoMessage(files: File[]) {
  if (files.length === 1) {
    const file = files[0];
    return `A foto “${file.name}” tem ${formatFileSize(file.size)} e ultrapassa o limite de ${MAX_PHOTO_SIZE_LABEL}.`;
  }

  const fileNames = files.map((file) => `“${file.name}”`).join(", ");
  return `As fotos ${fileNames} ultrapassam o limite de ${MAX_PHOTO_SIZE_LABEL} por foto.`;
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })} MB`;
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
