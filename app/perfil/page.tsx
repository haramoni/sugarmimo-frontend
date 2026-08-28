"use client";

import {
  Camera,
  Check,
  ChevronDown,
  Crown,
  Copy,
  ImagePlus,
  Loader2,
  Lock,
  Pencil,
  AtSign,
  Phone,
  Plus,
  Save,
  Send,
  Tag,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_SIZE_LABEL,
  normalizeMobilePhoto,
  PHOTO_INPUT_ACCEPT,
} from "@/app/lib/photo-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AUTH_USER_STORAGE_KEY,
  removeAuthUser,
  saveAuthUser,
} from "../lib/auth-storage";
import { Navbar } from "../components/ui/Navbar";
import { PhotoZoom } from "../components/ui/PhotoZoom";
import premiereStyles from "../buscar/components/ProfileCard.module.css";
import { PremiereOfferDialog } from "./PremiereOfferDialog";
import { BoostControl, type BoostStatus } from "./BoostControl";
import {
  getRelationshipIntentLabel,
  relationshipIntentOptions,
} from "../lib/relationship-intent";
import {
  ProfileApprovalGuard,
  shouldShowPendingApproval,
} from "./ProfileApprovalGuard";
import {
  bodyTypes,
  childrenOptions,
  drinkOptions,
  educationOptions,
  ethnicities,
  eyeColors,
  hairColors,
  occupationOptions,
  optionsForProfile,
  relationshipOptions,
  describeForProfile,
  smokeOptions,
} from "./perfiloptions";

const MAX_PUBLIC_PHOTOS = 6;
const MAX_PRIVATE_PHOTOS = 6;
const MAX_INTERESTS = 3;

const heights = Array.from({ length: 111 }, (_, index) => 120 + index);

type ContactChannel = "whatsapp" | "telegram" | "instagram";

type ContactViewerSuggestion = {
  id: string;
  username: string;
  city?: string | null;
  state?: string | null;
};

const contactChannelOptions: {
  channel: ContactChannel;
  label: string;
  icon: LucideIcon;
}[] = [
  { channel: "whatsapp", label: "WhatsApp", icon: Phone },
  { channel: "telegram", label: "Telegram", icon: Send },
  { channel: "instagram", label: "Instagram", icon: AtSign },
];

type ProfilePhoto = {
  id?: string;
  dataUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  sortOrder: number;
  isPrivate?: boolean;
  moderationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  moderationReason?: string | null;
  moderatedAt?: string | null;
  replacesPhotoId?: string | null;
};

function editablePhotosForOwner(profilePhotos: ProfilePhoto[]) {
  const replacedPhotoIds = new Set(
    profilePhotos
      .filter(
        (photo) =>
          photo.moderationStatus === "PENDING" && photo.replacesPhotoId,
      )
      .map((photo) => photo.replacesPhotoId as string),
  );

  return profilePhotos.filter(
    (photo) =>
      photo.moderationStatus !== "REJECTED" &&
      !(photo.id && replacedPhotoIds.has(photo.id)),
  );
}

type PreferenceValues = {
  smoke?: string;
  drink?: string;
  relationship?: string;
  children?: string;
  education?: string;
  occupation?: string;
  customInterests?: string[];
  visibleContactChannels?: ContactChannel[];
  contactViewerUsernames?: string[];
  privatePhotoViewerUsernames?: string[];
  slugs?: Record<string, string>;
};

type ProfileUser = {
  id?: string;
  username?: string;
  email?: string;
  role?: string | null;
  gender?: string | null;
  lookingFor?: string | null;
  relationshipIntent?: string | null;
  birthDate?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  instagram?: string | null;
  approvalStatus?: string;
  isPremiere?: boolean;
  boostCredits?: number;
  boostedUntil?: string | null;
  createdAt?: string | null;
  photos?: ProfilePhoto[];
  appearance?: {
    bodyType?: string | null;
    ethnicity?: string | null;
    hairColor?: string | null;
    eyeColor?: string | null;
    heightCm?: number | null;
  } | null;
  preferences?: {
    preferences?: PreferenceValues | null;
    introductionPhrase?: string | null;
    aboutMe?: string | null;
    lookingFor?: string | null;
  } | null;
};

type ProfileForm = {
  username: string;
  birthDate: string;
  country: string;
  state: string;
  city: string;
  whatsapp: string;
  telegram: string;
  instagram: string;
  lookingFor: string;
  relationshipIntent: string;
  introductionPhrase: string;
  aboutMe: string;
  lookingForText: string;
  bodyType: string;
  ethnicity: string;
  hairColor: string;
  eyeColor: string;
  heightCm: string;
  smoke: string;
  drink: string;
  relationship: string;
  children: string;
  education: string;
  occupation: string;
  customInterests: string[];
  visibleContactChannels: ContactChannel[];
  contactViewerUsernames: string[];
  privatePhotoViewerUsernames: string[];
};

type TextProfileField = Exclude<
  keyof ProfileForm,
  | "customInterests"
  | "visibleContactChannels"
  | "contactViewerUsernames"
  | "privatePhotoViewerUsernames"
>;

function subscribeToAuth(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("sugarmimo-auth", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("sugarmimo-auth", callback);
  };
}

function getUserSnapshot() {
  const savedUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!savedUser) {
    return "";
  }

  return savedUser;
}

export default function PerfilPage() {
  return <ProfilePageContent />;
}

export function ProfilePageContent({
  reapplication = false,
}: {
  reapplication?: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const privateFileInputRef = useRef<HTMLInputElement>(null);
  const savedUser = useSyncExternalStore(
    subscribeToAuth,
    getUserSnapshot,
    () => "",
  );
  const [remoteProfile, setRemoteProfile] = useState<ProfileUser | null>(null);
  const [isEditing, setIsEditing] = useState(reapplication);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [invitationCopied, setInvitationCopied] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<ProfilePhoto[]>(() => {
    if (reapplication) return [];
    const profile = getStoredProfile();
    return [...(profile?.photos ?? [])].sort(sortPhotos);
  });
  const [form, setForm] = useState<ProfileForm>(() => {
    if (reapplication) return emptyForm;
    const profile = getStoredProfile();
    return profile ? formFromUser(profile) : emptyForm;
  });
  const [isInterestInputOpen, setIsInterestInputOpen] = useState(false);
  const [interestDraft, setInterestDraft] = useState("");
  const [contactViewerDraft, setContactViewerDraft] = useState("");
  const [contactViewerSuggestions, setContactViewerSuggestions] = useState<
    ContactViewerSuggestion[]
  >([]);
  const [isSearchingContactViewers, setIsSearchingContactViewers] =
    useState(false);
  const [contactViewerError, setContactViewerError] = useState("");
  const [privateViewerDraft, setPrivateViewerDraft] = useState("");
  const [privateViewerSuggestions, setPrivateViewerSuggestions] = useState<
    ContactViewerSuggestion[]
  >([]);
  const [isSearchingPrivateViewers, setIsSearchingPrivateViewers] =
    useState(false);
  const [privateViewerError, setPrivateViewerError] = useState("");

  const storedUser = useMemo(() => {
    if (reapplication) {
      return null;
    }

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser) as ProfileUser;
    } catch {
      removeAuthUser();
      return null;
    }
  }, [reapplication, savedUser]);

  const user = remoteProfile ?? storedUser;
  const isApprovalPending =
    !reapplication && shouldShowPendingApproval(user);

  function hydrateProfile(profile: ProfileUser) {
    setForm(formFromUser(profile));
    setPhotos([...(profile.photos ?? [])].sort(sortPhotos));
  }

  useEffect(() => {
    fetch(
      reapplication
        ? "/api/auth/reapplication-profile"
        : "/api/auth/me",
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Sessão expirada.");
        }

        return (await response.json()) as ProfileUser;
      })
      .then((profile) => {
        if (!reapplication) {
          saveAuthUser(profile);
        }
        setRemoteProfile(profile);
        if (!reapplication && shouldShowPendingApproval(profile)) {
          router.replace("/register/pending-approval");
          return;
        }

        hydrateProfile(profile);

        if (
          window.sessionStorage.getItem("sugarmimo-chat-online-toast") === "1"
        ) {
          window.sessionStorage.removeItem("sugarmimo-chat-online-toast");

          void Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "O chat já está ON! 💬",
            text: "Aproveite para explorar por lá!",
            confirmButtonText: "Entendi",
            showConfirmButton: true,
          }).then(() =>
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "info",
              title: "Área do Blog em desenvolvimento!",
              text: "Fique atenta para novas dicas e novidades.",
              confirmButtonText: "Legal!",
              showConfirmButton: true,
            }),
          );
        }
      })
      .catch(() => {
        removeAuthUser();
        window.dispatchEvent(new Event("sugarmimo-auth"));
        router.replace("/login");
      });
  }, [reapplication, router]);

  useEffect(() => {
    const normalizedDraft = normalizeUsername(contactViewerDraft);
    const canSearch =
      isEditing &&
      !reapplication &&
      user?.role?.trim().toUpperCase() === "SUGAR_BABY" &&
      normalizedDraft.length > 0;

    if (!canSearch) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsSearchingContactViewers(true);
      setContactViewerError("");

      fetch(
        `/api/contact-viewers?search=${encodeURIComponent(normalizedDraft)}`,
        { signal: controller.signal },
      )
        .then(async (response) => {
          const result = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(
              result?.message ?? "Não foi possível buscar Sugar Daddies.",
            );
          }

          return Array.isArray(result)
            ? (result as ContactViewerSuggestion[])
            : [];
        })
        .then((suggestions) => {
          if (!controller.signal.aborted) {
            setContactViewerSuggestions(suggestions);
          }
        })
        .catch((searchError) => {
          if (!controller.signal.aborted) {
            setContactViewerSuggestions([]);
            setContactViewerError(
              searchError instanceof Error
                ? searchError.message
                : "Não foi possível buscar Sugar Daddies.",
            );
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsSearchingContactViewers(false);
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [contactViewerDraft, isEditing, reapplication, user?.role]);

  useEffect(() => {
    const normalizedDraft = normalizeUsername(privateViewerDraft);
    if (reapplication || !isEditing || !normalizedDraft) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsSearchingPrivateViewers(true);
      setPrivateViewerError("");
      fetch(
        `/api/private-photo-viewers?search=${encodeURIComponent(normalizedDraft)}`,
        { signal: controller.signal },
      )
        .then(async (response) => {
          const result = await response.json().catch(() => null);
          if (!response.ok) {
            throw new Error(
              result?.message ?? "Não foi possível buscar perfis.",
            );
          }
          return Array.isArray(result)
            ? (result as ContactViewerSuggestion[])
            : [];
        })
        .then((suggestions) => {
          if (!controller.signal.aborted) {
            setPrivateViewerSuggestions(suggestions);
          }
        })
        .catch((searchError) => {
          if (!controller.signal.aborted) {
            setPrivateViewerSuggestions([]);
            setPrivateViewerError(
              searchError instanceof Error
                ? searchError.message
                : "Não foi possível buscar perfis.",
            );
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsSearchingPrivateViewers(false);
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isEditing, privateViewerDraft, reapplication]);

  if (!user && reapplication) {
    return (
      <main className="grid min-h-screen place-items-center bg-[url('/wallpaper-marble.webp')] px-5 text-center text-black-jewel">
        <p className="rounded-xl border border-gold/30 bg-white/90 px-6 py-5 font-bold shadow-lg">
          Carregando seu cadastro para correção...
        </p>
      </main>
    );
  }

  if (!user || isApprovalPending) {
    return <ProfileApprovalGuard user={user} />;
  }

  const editablePhotos = editablePhotosForOwner(photos);
  const publicPhotos = editablePhotos.filter((photo) => !photo.isPrivate);
  const privatePhotos = editablePhotos.filter((photo) => photo.isPrivate);
  const profilePhoto = publicPhotos[0];
  const isPremiereDaddy =
    user.role?.trim().toUpperCase() === "SUGAR_DADDY" &&
    Boolean(user.isPremiere);
  const isSugarBaby = user.role?.trim().toUpperCase() === "SUGAR_BABY";
  const age = getAge(form.birthDate || user.birthDate);
  const location = [form.city, form.state].filter(Boolean).join(", ");
  function updateField(field: TextProfileField, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setFeedback("");
    setError("");
  }

  async function copyInvitationLink() {
    const username = (user?.username ?? form.username).trim();

    if (!username) {
      setError("Não foi possível gerar o link de convite.");
      return;
    }

    const invitationUrl = `${window.location.origin}/register?ref=${encodeURIComponent(username)}`;

    try {
      await navigator.clipboard.writeText(invitationUrl);
      setInvitationCopied(true);
      window.setTimeout(() => setInvitationCopied(false), 2500);
    } catch {
      setError("Não foi possível copiar o link de convite.");
    }
  }

  function handleBoostActivated(status: BoostStatus) {
    const updatedProfile = { ...user, ...status };
    setRemoteProfile(updatedProfile);
    saveAuthUser(updatedProfile);
    window.dispatchEvent(new Event("sugarmimo-auth"));
  }

  function updateContactVisibility(channel: ContactChannel, checked: boolean) {
    setForm((current) => {
      return {
        ...current,
        visibleContactChannels: checked
          ? Array.from(new Set([...current.visibleContactChannels, channel]))
          : current.visibleContactChannels.filter((item) => item !== channel),
      };
    });
    setIsEditing(true);
    setFeedback("");
    setError("");
  }

  function updateContactValue(channel: ContactChannel, value: string) {
    setForm((current) => ({
      ...current,
      [channel]: value,
      visibleContactChannels: value.trim()
        ? current.visibleContactChannels
        : current.visibleContactChannels.filter((item) => item !== channel),
    }));
    setFeedback("");
    setError("");
  }

  function updateContactViewerDraft(value: string) {
    setContactViewerDraft(value);

    if (!normalizeUsername(value)) {
      setContactViewerSuggestions([]);
      setIsSearchingContactViewers(false);
      setContactViewerError("");
    } else {
      setIsSearchingContactViewers(true);
      setContactViewerError("");
    }
  }

  function addContactViewer(username = contactViewerDraft) {
    const normalizedUsername = normalizeUsername(username);
    const isActiveDaddy = contactViewerSuggestions.some(
      (suggestion) =>
        normalizeUsername(suggestion.username) === normalizedUsername,
    );

    if (!normalizedUsername || !isActiveDaddy) {
      setContactViewerError(
        "Selecione um Sugar Daddy ativo na lista de sugestões.",
      );
      return;
    }

    setForm((current) => {
      if (current.contactViewerUsernames.includes(normalizedUsername)) {
        return current;
      }

      return {
        ...current,
        contactViewerUsernames: [
          ...current.contactViewerUsernames,
          normalizedUsername,
        ],
      };
    });
    setContactViewerDraft("");
    setContactViewerSuggestions([]);
    setContactViewerError("");
    setIsEditing(true);
    setFeedback("");
    setError("");
  }

  function removeContactViewer(usernameToRemove: string) {
    setForm((current) => ({
      ...current,
      contactViewerUsernames: current.contactViewerUsernames.filter(
        (username) => username !== usernameToRemove,
      ),
    }));
    setIsEditing(true);
    setFeedback("");
    setError("");
  }

  function updatePrivateViewerDraft(value: string) {
    setPrivateViewerDraft(value);
    if (!normalizeUsername(value)) {
      setPrivateViewerSuggestions([]);
      setIsSearchingPrivateViewers(false);
      setPrivateViewerError("");
    } else {
      setIsSearchingPrivateViewers(true);
      setPrivateViewerError("");
    }
  }

  function addPrivateViewer(username = privateViewerDraft) {
    const normalizedUsername = normalizeUsername(username);
    const isActiveProfile = privateViewerSuggestions.some(
      (suggestion) =>
        normalizeUsername(suggestion.username) === normalizedUsername,
    );

    if (!normalizedUsername || !isActiveProfile) {
      setPrivateViewerError("Selecione um perfil ativo na lista de sugestoes.");
      return;
    }

    setForm((current) => ({
      ...current,
      privatePhotoViewerUsernames: current.privatePhotoViewerUsernames.includes(
        normalizedUsername,
      )
        ? current.privatePhotoViewerUsernames
        : [...current.privatePhotoViewerUsernames, normalizedUsername],
    }));
    setPrivateViewerDraft("");
    setPrivateViewerSuggestions([]);
    setPrivateViewerError("");
    setIsEditing(true);
  }

  function removePrivateViewer(usernameToRemove: string) {
    setForm((current) => ({
      ...current,
      privatePhotoViewerUsernames: current.privatePhotoViewerUsernames.filter(
        (username) => username !== usernameToRemove,
      ),
    }));
    setIsEditing(true);
  }

  function addCustomInterest() {
    const normalizedInterest = normalizeInterest(interestDraft);

    if (!normalizedInterest) {
      return;
    }

    if (form.customInterests.length >= MAX_INTERESTS) {
      setError(`Você pode adicionar no máximo ${MAX_INTERESTS} interesses.`);
      return;
    }

    if (
      form.customInterests.some(
        (interest) =>
          interest.toLocaleLowerCase("pt-BR") ===
          normalizedInterest.toLocaleLowerCase("pt-BR"),
      )
    ) {
      setInterestDraft("");
      return;
    }

    setForm((current) => ({
      ...current,
      customInterests: [...current.customInterests, normalizedInterest],
    }));
    setInterestDraft("");
    setIsEditing(true);
    setFeedback("");
    setError("");
  }

  function removeCustomInterest(interestToRemove: string) {
    setForm((current) => ({
      ...current,
      customInterests: current.customInterests.filter(
        (interest) => interest !== interestToRemove,
      ),
    }));
    setIsEditing(true);
    setFeedback("");
    setError("");
  }

  async function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>,
    isPrivate = false,
  ) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!selectedFiles.length) {
      return;
    }

    const categoryPhotos = isPrivate ? privatePhotos : publicPhotos;
    const categoryLimit = isPrivate ? MAX_PRIVATE_PHOTOS : MAX_PUBLIC_PHOTOS;
    const remainingSlots = categoryLimit - categoryPhotos.length;
    if (remainingSlots <= 0) {
      setError(
        `Você pode enviar no máximo ${categoryLimit} fotos ${
          isPrivate ? "privadas" : "públicas"
        }.`,
      );
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    const oversizedSources = filesToAdd.find(
      (file) => file.size > MAX_PHOTO_BYTES,
    );

    if (oversizedSources) {
      setError(
        `A foto “${oversizedSources.name}” ultrapassa o limite de ${MAX_PHOTO_SIZE_LABEL}.`,
      );
      return;
    }

    setIsProcessingPhotos(true);
    setError("");

    try {
      const normalizedFiles = await Promise.all(
        filesToAdd.map(normalizeMobilePhoto),
      );

      if (normalizedFiles.some((file) => !ALLOWED_PHOTO_TYPES.has(file.type))) {
        setError("Envie apenas fotos JPEG, PNG, WebP, AVIF, HEIC ou HEIF.");
        return;
      }

      const oversizedPhoto = normalizedFiles.find(
        (file) => file.size > MAX_PHOTO_BYTES,
      );

      if (oversizedPhoto) {
        setError(
          `A foto “${oversizedPhoto.name}” ultrapassa o limite de ${MAX_PHOTO_SIZE_LABEL}.`,
        );
        return;
      }

      const newPhotos = await Promise.all(
        normalizedFiles.map(async (file, index) => ({
          dataUrl: await fileToDataUrl(file),
          fileName: file.name,
          mimeType: file.type,
          sortOrder: categoryPhotos.length + index + 1,
          isPrivate,
        })),
      );

      setPhotos((currentPhotos) => [...currentPhotos, ...newPhotos]);
      setIsEditing(true);

      if (selectedFiles.length > remainingSlots) {
        setError(
          `Apenas ${remainingSlots} ${remainingSlots === 1 ? "foto foi adicionada" : "fotos foram adicionadas"}. O limite é de ${categoryLimit} fotos ${isPrivate ? "privadas" : "públicas"}.`,
        );
      }
    } catch {
      setError(
        "Não foi possível converter uma foto HEIC/HEIF. Tente escolher outra imagem ou exportá-la como JPEG.",
      );
    } finally {
      setIsProcessingPhotos(false);
    }
  }

  function removePhoto(photoToRemove: ProfilePhoto) {
    setPhotos((currentPhotos) =>
      currentPhotos
        .filter((photo) => photo !== photoToRemove)
        .map((photo, index) => ({ ...photo, sortOrder: index + 1 })),
    );
    setIsEditing(true);
    setFeedback("");
  }

  function cancelEditing() {
    if (!user) {
      return;
    }

    setForm(formFromUser(user));
    setPhotos([...(user.photos ?? [])].sort(sortPhotos));
    setIsEditing(false);
    setError("");
    setFeedback("");
  }

  async function saveProfile() {
    setIsSaving(true);
    setError("");
    setFeedback("");

    try {
      const payload = {
        ...form,
        birthDate: form.birthDate || undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        customInterests: form.customInterests,
        visibleContactChannels: form.visibleContactChannels,
        contactViewerUsernames: form.contactViewerUsernames,
        privatePhotoViewerUsernames: form.privatePhotoViewerUsernames,
        profilePhotos: editablePhotos.map((photo, index) => ({
          id: photo.id,
          dataUrl: photo.dataUrl,
          fileName: photo.fileName,
          mimeType: photo.mimeType,
          sortOrder: index + 1,
          isPrivate: Boolean(photo.isPrivate),
        })),
      };

      let response = await patchProfile(payload);
      let result = await response.json().catch(() => null);

      if (
        !response.ok &&
        (isUnknownPropertyError(result, "visibleContactChannels") ||
          isUnknownPropertyError(result, "contactViewerUsernames"))
      ) {
        const legacyPayload: Record<string, unknown> = { ...payload };
        delete legacyPayload.visibleContactChannels;
        delete legacyPayload.contactViewerUsernames;
        response = await patchProfile(legacyPayload);
        result = await response.json().catch(() => null);
      }

      if (!response.ok) {
        throw new Error(result?.message ?? "Não foi possível salvar o perfil.");
      }

      if (reapplication) {
        await Swal.fire({
          icon: "success",
          title: "Cadastro reenviado para análise",
          html: result?.reapplicationPin
            ? `Seu PIN de retorno é <strong>${result.reapplicationPin}</strong>. A equipe verá o mesmo código no painel.`
            : "Suas correções entraram novamente na fila de análise.",
          confirmButtonText: "Acompanhar análise",
          confirmButtonColor: "var(--emerald)",
        });
        window.location.replace("/register/pending-approval");
        return;
      }

      saveAuthUser(result);
      window.dispatchEvent(new Event("sugarmimo-auth"));
      setRemoteProfile(result);
      hydrateProfile(result);
      setIsEditing(false);
      setFeedback(
        Array.isArray(result?.photos) &&
          result.photos.some(
            (photo: ProfilePhoto) => photo.moderationStatus === "PENDING",
          )
          ? "Perfil salvo. As fotos novas ficarão em análise antes de aparecerem para outras pessoas."
          : "Perfil atualizado com sucesso.",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o perfil.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function patchProfile(payload: Record<string, unknown>) {
    return fetch(
      reapplication
        ? "/api/auth/reapplication-profile"
        : "/api/auth/profile",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
  }

  return (
    <ProfileApprovalGuard
      user={
        reapplication ? { ...user, approvalStatus: "APPROVED" } : user
      }
    >
      <main className="min-h-screen bg-[radial-gradient(circle_at_18%_12%,color-mix(in_srgb,var(--emerald)_13%,transparent),transparent_28%),radial-gradient(circle_at_88%_18%,color-mix(in_srgb,var(--gold-soft)_22%,transparent),transparent_30%),url('/wallpaper-marble.webp')] bg-cover bg-center text-black-jewel md:bg-fixed">
        {reapplication ? (
          <header className="border-b border-gold/25 bg-espresso px-5 py-4 text-white">
            <div className="mx-auto max-w-7xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold-soft">
                Nova tentativa
              </p>
              <h1 className="mt-1 text-xl font-bold">
                Corrija seu cadastro e entre novamente na fila
              </h1>
              <p className="mt-1 text-sm text-white/70">
                Revise as informações e fotos. Ao reenviar, a equipe receberá um PIN que identifica seu retorno.
              </p>
            </div>
          </header>
        ) : (
          <Navbar />
        )}

        <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
          <input
            ref={fileInputRef}
            type="file"
            accept={PHOTO_INPUT_ACCEPT}
            multiple
            disabled={isProcessingPhotos}
            className="sr-only"
            onChange={handlePhotoChange}
          />
          <input
            ref={privateFileInputRef}
            type="file"
            accept={PHOTO_INPUT_ACCEPT}
            multiple
            disabled={isProcessingPhotos}
            className="sr-only"
            onChange={(event) => void handlePhotoChange(event, true)}
          />

          {error || feedback ? (
            <div
              className={[
                "mb-4 rounded-md border px-4 py-3 text-sm font-bold",
                error
                  ? "border-ruby/35 bg-[color-mix(in_srgb,var(--ruby)_10%,white)] text-ruby"
                  : "border-emerald/35 bg-[color-mix(in_srgb,var(--emerald)_10%,white)] text-emerald",
              ].join(" ")}
            >
              {error || feedback}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-emerald/30 bg-[color-mix(in_srgb,var(--surface)_88%,white)] shadow-[0_28px_70px_rgba(0,55,44,0.16)] ring-1 ring-white/70 backdrop-blur-sm">
            <div className="grid min-w-0 xl:grid-cols-[minmax(250px,310px)_minmax(0,1fr)_minmax(240px,290px)]">
              <aside className="min-w-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--emerald)_8%,white),color-mix(in_srgb,var(--surface)_94%,white)_42%,color-mix(in_srgb,var(--gold-soft)_12%,white))] p-4 sm:p-6 xl:p-7">
                <div className="relative mx-auto w-full max-w-72">
                  {isPremiereDaddy ? (
                    <div className={premiereStyles.premiereCard}>
                      <div className={premiereStyles.premiereInner}>
                        <div
                          className={premiereStyles.premiereHeader}
                          aria-label="Perfil Premiere"
                        >
                          <Crown
                            aria-hidden="true"
                            className={premiereStyles.premiereCrown}
                          />
                          <span>Premiere</span>
                        </div>
                        <div
                          className={`relative ${premiereStyles.premierePhoto}`}
                        >
                          {profilePhoto ? (
                            <>
                              <PhotoZoom
                                src={profilePhoto.dataUrl}
                                alt={`Foto de ${form.username || "perfil"}`}
                                imageClassName={`h-full w-full object-cover ${premiereStyles.premiereImage}`}
                              />
                              <PhotoModerationBadge photo={profilePhoto} />
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white/80 px-4 text-center text-sm font-bold text-black-jewel"
                            >
                              <Camera className="h-10 w-10 text-[#b78945]" />
                              Adicionar foto
                            </button>
                          )}
                          <span
                            className={premiereStyles.premiereVignette}
                            aria-hidden="true"
                          />
                        </div>
                        <div className={premiereStyles.premiereProfileFooter}>
                          <div
                            className={`${premiereStyles.premiereCrest} ${premiereStyles.premiereProfileCrest}`}
                            aria-hidden="true"
                          >
                            <span>⚜</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-4/5 overflow-hidden rounded-lg border-[3px] border-emerald/70 bg-[color-mix(in_srgb,var(--emerald)_10%,white)] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.86),0_18px_38px_rgba(0,55,44,0.18)] sm:aspect-[1/0.98]">
                      <div className="relative h-full overflow-hidden rounded-md">
                        {profilePhoto ? (
                          <>
                            <PhotoZoom
                              src={profilePhoto.dataUrl}
                              alt={`Foto de ${form.username || "perfil"}`}
                              imageClassName="h-full w-full object-cover"
                            />
                            <PhotoModerationBadge photo={profilePhoto} />
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-full w-full flex-col items-center justify-center gap-3 bg-white/74 px-4 text-center text-sm font-bold text-black-jewel"
                          >
                            <Camera className="h-10 w-10 text-emerald" />
                            Adicionar foto
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-4 text-center sm:mt-8">
                  <div className="min-w-0">
                    <h1 className="wrap-anywhere text-2xl font-extrabold tracking-tight text-black-jewel sm:text-3xl">
                      {form.username || user.username}
                    </h1>
                    <p className="mt-1 text-sm font-semibold leading-5 text-black-jewel/72 wrap-anywhere">
                      {form.introductionPhrase}
                    </p>
                    <span className="mt-3 inline-flex rounded-full border border-ruby/25 bg-[color-mix(in_srgb,var(--ruby)_8%,white)] px-3 py-1 text-xs font-extrabold text-ruby">
                      Busca:{" "}
                      {getRelationshipIntentLabel(form.relationshipIntent)}
                    </span>
                  </div>
                  <div className="mx-auto h-px max-w-56 bg-[linear-gradient(90deg,transparent,var(--emerald),transparent)] opacity-45" />
                  <dl className="mx-auto grid max-w-64 grid-cols-[minmax(70px,0.8fr)_minmax(0,1fr)] gap-x-4 gap-y-2 text-left text-sm sm:text-base">
                    <dt className="font-semibold text-black-jewel/82">Idade</dt>
                    <dd className="min-w-0 font-medium wrap-anywhere">
                      {age || "Não informado"}
                    </dd>
                    <dt className="font-semibold text-black-jewel/82">
                      De onde é?
                    </dt>
                    <dd className="min-w-0 font-medium wrap-anywhere">
                      {location || "Não informado"}
                    </dd>
                  </dl>
                </div>
              </aside>

              <section className="min-w-0 border-y border-emerald/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(255,255,255,0.16))] p-4 sm:p-6 xl:border-x xl:border-y-0 xl:p-7">
                <div className="min-w-0 space-y-5">
                  <div className="space-y-3">
                    <h2 className="font-serif text-xl font-semibold text-black-jewel sm:text-2xl">
                      Sobre Mim
                    </h2>
                    {isEditing ? (
                      <div className="grid gap-4">
                        <TextField
                          label="Frase de apresentação"
                          value={form.introductionPhrase}
                          onChange={(value) =>
                            updateField("introductionPhrase", value)
                          }
                        />
                        <TextAreaField
                          label="Sobre mim"
                          value={form.aboutMe}
                          onChange={(value) => updateField("aboutMe", value)}
                        />
                        <TextAreaField
                          label="O que estou buscando"
                          value={form.lookingForText}
                          onChange={(value) =>
                            updateField("lookingForText", value)
                          }
                        />
                      </div>
                    ) : (
                      <div className="space-y-4 text-sm font-medium leading-6 text-black-jewel/82">
                        <p className="wrap-anywhere">
                          {form.aboutMe ||
                            "Edite seu perfil para adicionar uma descrição sobre você!"}
                        </p>
                        {form.lookingForText ? (
                          <p className="wrap-anywhere">{form.lookingForText}</p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-[linear-gradient(90deg,var(--emerald),color-mix(in_srgb,var(--gold)_48%,white),transparent)] opacity-35" />

                  <ContactSection
                    form={form}
                    isEditing={isEditing}
                    onToggle={updateContactVisibility}
                    onContactChange={updateContactValue}
                    viewerDraft={contactViewerDraft}
                    onViewerDraftChange={updateContactViewerDraft}
                    onAddViewer={addContactViewer}
                    onRemoveViewer={removeContactViewer}
                    suggestions={contactViewerSuggestions}
                    isSearchingViewers={isSearchingContactViewers}
                    viewerError={contactViewerError}
                    canSelectViewers={
                      !reapplication &&
                      user.role?.trim().toUpperCase() === "SUGAR_BABY"
                    }
                  />

                  <div className="h-px bg-[linear-gradient(90deg,var(--emerald),color-mix(in_srgb,var(--gold)_48%,white),transparent)] opacity-35" />

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-serif text-xl font-semibold text-black-jewel sm:text-2xl">
                        Interesses
                      </h2>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Adicionar interesse"
                        onClick={() => {
                          setIsInterestInputOpen((current) => !current);
                          setIsEditing(true);
                        }}
                        disabled={form.customInterests.length >= MAX_INTERESTS}
                        className="h-8 w-8 rounded-full border border-emerald/45 bg-white/82 text-emerald shadow-none hover:bg-[color-mix(in_srgb,var(--emerald)_10%,white)] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {form.customInterests.length > 0 ? (
                      <div className="flex min-w-0 flex-wrap gap-2">
                        {form.customInterests.map((interest) => (
                          <span
                            key={interest}
                            className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full border border-emerald/35 bg-[color-mix(in_srgb,var(--emerald)_7%,white)] px-3 py-1 text-sm font-bold text-black-jewel shadow-[0_8px_18px_rgba(0,55,44,0.07)]"
                          >
                            <Tag className="h-3.5 w-3.5 shrink-0 text-emerald" />
                            <span className="min-w-0 wrap-anywhere">
                              {interest}
                            </span>
                            {isEditing ? (
                              <button
                                type="button"
                                aria-label={`Remover interesse ${interest}`}
                                onClick={() => removeCustomInterest(interest)}
                                className="text-black-jewel/55 transition hover:text-ruby"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {isInterestInputOpen && isEditing ? (
                      <div className="flex max-w-sm flex-col gap-2 min-[420px]:flex-row">
                        <Input
                          value={interestDraft}
                          maxLength={28}
                          onChange={(event) =>
                            setInterestDraft(
                              normalizeInterest(event.target.value),
                            )
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addCustomInterest();
                            }
                          }}
                          placeholder="Uma palavra"
                          className="h-10 min-w-0 rounded-sm border-emerald/25 bg-white text-sm font-semibold focus-visible:border-emerald"
                        />
                        <Button
                          type="button"
                          onClick={addCustomInterest}
                          disabled={
                            !interestDraft.trim() ||
                            form.customInterests.length >= MAX_INTERESTS
                          }
                          className="h-10 shrink-0 rounded-sm border border-emerald bg-emerald px-3 font-extrabold text-white hover:bg-emerald/85 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                    {isEditing && (
                      <DetailsForm
                        form={form}
                        profileType={user?.gender}
                        updateField={updateField}
                      />
                    )}
                  </div>

                  <div className="h-px bg-[linear-gradient(90deg,var(--emerald),color-mix(in_srgb,var(--gold)_48%,white),transparent)] opacity-35" />

                  <div className="space-y-3">
                    <h2 className="font-serif text-xl font-semibold text-black-jewel sm:text-2xl">
                      Gallery
                    </h2>
                    <p className="rounded-sm border border-gold/25 bg-gold/8 px-3 py-2 text-xs font-semibold leading-5 text-black-jewel/68">
                      Fotos novas, públicas ou privadas, ficam visíveis somente para você e para a equipe de moderação até serem aprovadas.
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {publicPhotos.slice(1, 6).map((photo, index) => (
                        <GalleryTile
                          key={`${photo.id ?? photo.fileName ?? "photo"}-${index}`}
                          photo={photo}
                          index={index + 1}
                          isEditing={isEditing}
                          onRemove={() => removePhoto(photo)}
                        />
                      ))}
                      {publicPhotos.length < MAX_PUBLIC_PHOTOS ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex aspect-[1.18/1] min-h-24 items-center justify-center rounded-sm border-2 border-dashed border-emerald/45 bg-[color-mix(in_srgb,var(--emerald)_5%,white)] text-emerald transition hover:bg-[color-mix(in_srgb,var(--emerald)_11%,white)]"
                        >
                          <ImagePlus className="h-7 w-7" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <PrivatePhotosSection
                    photos={privatePhotos}
                    isEditing={isEditing}
                    onAddPhotos={() => privateFileInputRef.current?.click()}
                    onRemovePhoto={removePhoto}
                    viewerUsernames={form.privatePhotoViewerUsernames}
                    viewerDraft={privateViewerDraft}
                    onViewerDraftChange={updatePrivateViewerDraft}
                    onAddViewer={addPrivateViewer}
                    onRemoveViewer={removePrivateViewer}
                    suggestions={privateViewerSuggestions}
                    isSearching={isSearchingPrivateViewers}
                    error={privateViewerError}
                    canManageViewers={!reapplication}
                  />
                </div>
              </section>

              <aside className="min-w-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.14),transparent_28%),linear-gradient(145deg,#05251f,#083e34_50%,#111512)] p-4 text-white sm:p-6">
                <div className="flex h-full flex-col justify-between gap-7">
                  <div className="space-y-4">
                    {/* <Button className="h-auto min-h-12 w-full rounded-full border border-white/20 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--emerald)_78%,white),var(--emerald))] px-4 py-2 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(0,108,88,0.34)] hover:bg-emerald/85 sm:text-base">
                      <Crown className="h-4 w-4" />
                      SEJA PREMIUM
                    </Button> */}
                    {user.role?.trim().toUpperCase() === "SUGAR_DADDY" ? (
                      <PremiereOfferDialog />
                    ) : null}
                    {isSugarBaby && !reapplication ? (
                      <div className="rounded-xl border border-gold/35 bg-white/10 p-4">
                        <p className="text-sm font-extrabold text-gold-soft">
                          Seu link de convite
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/75">
                          Compartilhe com quem você quer convidar para o
                          SugarMimo.
                        </p>
                        <Button
                          type="button"
                          onClick={() => void copyInvitationLink()}
                          className="mt-3 h-auto min-h-11 w-full rounded-full border border-gold/55 bg-gold/15 px-4 py-2 text-sm font-extrabold text-white hover:bg-gold hover:text-espresso"
                        >
                          {invitationCopied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {invitationCopied ? "Link copiado!" : "Copiar link"}
                        </Button>
                      </div>
                    ) : null}
                    {!reapplication ? (
                      <>
                        <BoostControl
                          credits={user.boostCredits ?? 0}
                          boostedUntil={user.boostedUntil ?? null}
                          onActivated={handleBoostActivated}
                        />
                        <Button
                          type="button"
                          onClick={
                            isEditing
                              ? cancelEditing
                              : () => setIsEditing(true)
                          }
                          className="h-auto min-h-12 w-full rounded-full border border-white/55 bg-white/5 px-4 py-2 text-sm font-extrabold text-white hover:bg-white hover:text-emerald sm:text-base"
                        >
                          {isEditing ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Pencil className="h-4 w-4" />
                          )}
                          {isEditing ? "Cancelar Edição" : "Editar Perfil"}
                        </Button>
                      </>
                    ) : null}
                    {isEditing && (
                      <Button
                        type="button"
                        onClick={saveProfile}
                        disabled={!isEditing || isProcessingPhotos || isSaving}
                        className="h-auto min-h-12 w-full rounded-full border border-emerald/60 bg-[color-mix(in_srgb,var(--emerald)_28%,transparent)] px-4 py-2 text-sm font-extrabold text-white hover:bg-white hover:text-emerald disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
                      >
                        {isProcessingPhotos || isSaving ? (
                          <Loader2 className="h-4 w-4" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {isProcessingPhotos
                          ? "Preparando fotos..."
                          : isSaving
                            ? "Salvando..."
                            : reapplication
                              ? "Corrigir e reenviar"
                              : "Salvar"}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4 border-t border-white/20 pt-6">
                    <h2 className="font-serif text-xl font-semibold text-white sm:text-2xl">
                      Gallery
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {publicPhotos.slice(0, 4).map((photo, index) => (
                        <GalleryTile
                          key={`${photo.id ?? photo.fileName ?? "side"}-${index}`}
                          photo={photo}
                          index={index}
                          isEditing={isEditing}
                          onRemove={() => removePhoto(photo)}
                          dark
                        />
                      ))}
                      {publicPhotos.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="col-span-2 flex aspect-2/1 flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-white/35 bg-white/5 text-sm font-bold text-white/82"
                        >
                          <ImagePlus className="h-7 w-7" />
                          Adicionar fotos
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </ProfileApprovalGuard>
  );
}

function PrivatePhotosSection({
  photos,
  isEditing,
  onAddPhotos,
  onRemovePhoto,
  viewerUsernames,
  viewerDraft,
  onViewerDraftChange,
  onAddViewer,
  onRemoveViewer,
  suggestions,
  isSearching,
  error,
  canManageViewers,
}: {
  photos: ProfilePhoto[];
  isEditing: boolean;
  onAddPhotos: () => void;
  onRemovePhoto: (photo: ProfilePhoto) => void;
  viewerUsernames: string[];
  viewerDraft: string;
  onViewerDraftChange: (value: string) => void;
  onAddViewer: (username?: string) => void;
  onRemoveViewer: (username: string) => void;
  suggestions: ContactViewerSuggestion[];
  isSearching: boolean;
  error: string;
  canManageViewers: boolean;
}) {
  const availableSuggestions = suggestions.filter(
    (suggestion) =>
      !viewerUsernames.includes(normalizeUsername(suggestion.username)),
  );

  return (
    <section className="space-y-3 rounded-md border border-gold/30 bg-[color-mix(in_srgb,var(--gold-soft)_12%,white)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-black-jewel sm:text-2xl">
            <Lock className="h-5 w-5 text-gold" />
            Fotos privadas
          </h2>
          <p className="mt-1 text-xs font-semibold text-black-jewel/62">
            Somente os perfis autorizados abaixo poderão visualizar estas fotos.
          </p>
        </div>
        {isEditing && photos.length < MAX_PRIVATE_PHOTOS ? (
          <Button
            type="button"
            onClick={onAddPhotos}
            className="h-10 rounded-full bg-gold px-4 font-extrabold text-white hover:bg-gold/85"
          >
            <ImagePlus className="h-4 w-4" />
            Adicionar
          </Button>
        ) : null}
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <GalleryTile
              key={`${photo.id ?? photo.fileName ?? "private"}-${index}`}
              photo={photo}
              index={index}
              isEditing={isEditing}
              onRemove={() => onRemovePhoto(photo)}
            />
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={onAddPhotos}
          disabled={!isEditing}
          className="flex min-h-24 w-full items-center justify-center gap-2 rounded-sm border-2 border-dashed border-gold/40 bg-white/55 text-sm font-bold text-gold disabled:cursor-default"
        >
          <Lock className="h-5 w-5" />
          Nenhuma foto privada
        </button>
      )}

      {isEditing && canManageViewers ? (
        <div className="space-y-2 border-t border-gold/20 pt-3">
          <Label className="font-bold text-black-jewel">
            Quem pode ver suas fotos privadas
          </Label>
          <div className="flex gap-2">
            <Input
              value={viewerDraft}
              onChange={(event) => onViewerDraftChange(event.target.value)}
              placeholder="Digite o username"
              className="h-10 border-gold/30 bg-white"
            />
            <Button
              type="button"
              size="icon"
              disabled={availableSuggestions.length === 0}
              onClick={() =>
                availableSuggestions[0] &&
                onAddViewer(availableSuggestions[0].username)
              }
              className="h-10 w-10 bg-gold text-white hover:bg-gold/85"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
          {viewerDraft.trim() && availableSuggestions.length > 0 ? (
            <div className="grid max-h-40 gap-1 overflow-y-auto rounded-sm border border-gold/25 bg-white p-1">
              {availableSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => onAddViewer(suggestion.username)}
                  className="flex justify-between rounded-sm px-3 py-2 text-left text-sm hover:bg-gold-soft/20"
                >
                  <span className="font-bold">@{suggestion.username}</span>
                  <span className="text-black-jewel/52">
                    {[suggestion.city, suggestion.state]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
          {error ? (
            <p className="text-xs font-bold text-ruby">{error}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {viewerUsernames.map((username) => (
              <span
                key={username}
                className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white px-3 py-1 text-sm font-bold"
              >
                @{username}
                <button
                  type="button"
                  aria-label={`Remover ${username}`}
                  onClick={() => onRemoveViewer(username)}
                  className="text-black-jewel/55 hover:text-ruby"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : !canManageViewers && viewerUsernames.length > 0 ? (
        <p className="border-t border-gold/20 pt-3 text-xs font-semibold text-black-jewel/60">
          As permissões atuais das fotos privadas serão preservadas nesta correção.
        </p>
      ) : null}
    </section>
  );
}

function DetailsForm({
  form,
  profileType,
  updateField,
}: {
  form: ProfileForm;
  profileType?: string | null;
  updateField: (field: TextProfileField, value: string) => void;
}) {
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      <TextField
        label="Nome de usuário"
        value={form.username}
        onChange={(value) => updateField("username", value)}
      />
      <TextField
        label="Data de nascimento"
        type="date"
        value={form.birthDate}
        onChange={(value) => updateField("birthDate", value)}
      />
      <TextField
        label="Cidade"
        value={form.city}
        onChange={(value) => updateField("city", value)}
      />
      <TextField
        label="Estado"
        value={form.state}
        onChange={(value) => updateField("state", value)}
      />
      <ProfileSelect
        label="Buscando"
        value={form.lookingFor}
        onValueChange={(value) => updateField("lookingFor", value)}
        options={[
          { label: "Mulheres", value: "women" },
          { label: "Homens", value: "men" },
          { label: "Homens e mulheres", value: "both" },
        ]}
      />
      <ProfileSelect
        label="Tipo de relacionamento"
        value={form.relationshipIntent}
        onValueChange={(value) => updateField("relationshipIntent", value)}
        options={relationshipIntentOptions.map((option) => ({
          label: option.label,
          value: option.value,
        }))}
      />
      <ProfileSelect
        label="Tipo de corpo"
        value={form.bodyType}
        onValueChange={(value) => updateField("bodyType", value)}
        options={optionsForProfile(bodyTypes, profileType).map(
          optionToSelectItem,
        )}
      />
      <ProfileSelect
        label="Tom de pele"
        value={form.ethnicity}
        onValueChange={(value) => updateField("ethnicity", value)}
        options={optionsForProfile(ethnicities, profileType).map(
          optionToSelectItem,
        )}
      />
      <ProfileSelect
        label="Cabelo"
        value={form.hairColor}
        onValueChange={(value) => updateField("hairColor", value)}
        options={hairColors.map(optionToSelectItem)}
      />
      <ProfileSelect
        label="Cor dos olhos"
        value={form.eyeColor}
        onValueChange={(value) => updateField("eyeColor", value)}
        options={eyeColors.map(optionToSelectItem)}
      />
      <ProfileSelect
        label="Altura"
        value={form.heightCm}
        onValueChange={(value) => updateField("heightCm", value)}
        options={heights.map((height) => ({
          label: `${height} cm`,
          value: String(height),
        }))}
      />
      <ProfileSelect
        label="Você fuma?"
        value={form.smoke}
        onValueChange={(value) => updateField("smoke", value)}
        options={smokeOptions.map(optionToSelectItem)}
      />
      <ProfileSelect
        label="Você bebe?"
        value={form.drink}
        onValueChange={(value) => updateField("drink", value)}
        options={drinkOptions.map(optionToSelectItem)}
      />
      <ProfileSelect
        label="Estado civil"
        value={form.relationship}
        onValueChange={(value) => updateField("relationship", value)}
        options={optionsForProfile(relationshipOptions, profileType).map(
          optionToSelectItem,
        )}
      />
      <ProfileSelect
        label="Tem filhos?"
        value={form.children}
        onValueChange={(value) => updateField("children", value)}
        options={childrenOptions.map(optionToSelectItem)}
      />
      <ProfileSelect
        label="Escolaridade"
        value={form.education}
        onValueChange={(value) => updateField("education", value)}
        options={educationOptions.map(optionToSelectItem)}
      />
      <ProfileSelect
        label="Profissão"
        value={form.occupation}
        onValueChange={(value) => updateField("occupation", value)}
        options={optionsForProfile(occupationOptions, profileType).map(
          optionToSelectItem,
        )}
      />
    </div>
  );
}

function ContactSection({
  form,
  isEditing,
  onToggle,
  onContactChange,
  viewerDraft,
  onViewerDraftChange,
  onAddViewer,
  onRemoveViewer,
  suggestions,
  isSearchingViewers,
  viewerError,
  canSelectViewers,
}: {
  form: ProfileForm;
  isEditing: boolean;
  onToggle: (channel: ContactChannel, checked: boolean) => void;
  onContactChange: (channel: ContactChannel, value: string) => void;
  viewerDraft: string;
  onViewerDraftChange: (value: string) => void;
  onAddViewer: (username?: string) => void;
  onRemoveViewer: (username: string) => void;
  suggestions: ContactViewerSuggestion[];
  isSearchingViewers: boolean;
  viewerError: string;
  canSelectViewers: boolean;
}) {
  const visibleContactChannels = form.visibleContactChannels ?? [];
  const contactViewerUsernames = form.contactViewerUsernames ?? [];
  const visibleContacts = contactChannelOptions
    .map((option) => ({
      ...option,
      value: form[option.channel].trim(),
    }))
    .filter(
      (contact) =>
        contact.value && visibleContactChannels.includes(contact.channel),
    );
  const availableSuggestions = suggestions.filter(
    (suggestion) =>
      !contactViewerUsernames.includes(normalizeUsername(suggestion.username)),
  );
  const exactSuggestion = availableSuggestions.find(
    (suggestion) =>
      normalizeUsername(suggestion.username) === normalizeUsername(viewerDraft),
  );

  return (
    <div className="space-y-3">
      <h2 className="font-serif text-xl font-semibold text-black-jewel sm:text-2xl">
        Contatos
      </h2>

      {isEditing ? (
        <div className="space-y-3">
          <div className="max-w-md">
            <Label className="font-bold text-black-jewel">
              O que deseja liberar
            </Label>
            <p className="mt-1 text-xs font-medium text-black-jewel/62">
              Escolha separadamente quais contatos podem aparecer aos Sugar
              Daddies autorizados. Estes dados não alteram o celular privado
              da conta; se preferir, deixe todos ocultos.
            </p>
            <details className="group relative mt-2">
              <summary className="flex h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-sm border border-emerald/30 bg-white px-3 text-sm font-semibold text-black-jewel shadow-[0_8px_18px_rgba(0,55,44,0.06)] [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 truncate">
                  {visibleContactChannels.length > 0
                    ? contactChannelOptions
                        .filter(({ channel }) =>
                          visibleContactChannels.includes(channel),
                        )
                        .map(({ label }) => label)
                        .join(", ")
                    : "Nenhum contato selecionado"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-emerald transition group-open:rotate-180" />
              </summary>
              <div className="absolute z-40 mt-1 grid w-full gap-1 rounded-sm border border-emerald/25 bg-white p-2 shadow-xl">
                {contactChannelOptions.map(({ channel, label, icon: Icon }) => {
                  const hasValue = Boolean(form[channel].trim());
                  const selected = visibleContactChannels.includes(channel);

                  return (
                    <button
                      key={channel}
                      type="button"
                      disabled={!hasValue}
                      aria-pressed={selected}
                      onClick={() => onToggle(channel, !selected)}
                      className={[
                        "flex min-h-10 w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm font-semibold transition",
                        hasValue
                          ? "cursor-pointer hover:bg-[color-mix(in_srgb,var(--emerald)_8%,white)]"
                          : "cursor-not-allowed opacity-50",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                          selected
                            ? "border-emerald bg-emerald text-white"
                            : "border-emerald/45 bg-white",
                        ].join(" ")}
                      >
                        {selected ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <Icon className="h-4 w-4 shrink-0 text-emerald" />
                      <span className="flex-1">{label}</span>
                      {!hasValue ? (
                        <span className="text-xs font-medium text-black-jewel/52">
                          Preencha primeiro
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </details>
          </div>

          <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {contactChannelOptions.map(({ channel, label, icon: Icon }) => {
              const hasValue = Boolean(form[channel].trim());
              const selected = visibleContactChannels.includes(channel);

              return (
                <div
                  key={channel}
                  className={[
                    "grid min-h-28 min-w-0 gap-3 rounded-sm border bg-white/78 p-3 text-sm font-semibold text-black-jewel shadow-[0_10px_20px_rgba(0,55,44,0.07)]",
                    hasValue ? "border-emerald/38" : "border-silver opacity-70",
                  ].join(" ")}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid min-w-0 gap-1">
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className="h-4 w-4 text-emerald" />
                        <span className="min-w-0 truncate">{label}</span>
                      </span>
                      <span className="text-xs font-medium leading-4 text-black-jewel/62">
                        {hasValue
                          ? selected
                            ? "Selecionado para liberação"
                            : "Não selecionado para liberação"
                          : "Preencha este contato"}
                      </span>
                    </span>
                  </div>
                  <Input
                    value={form[channel]}
                    inputMode={channel === "whatsapp" ? "tel" : "text"}
                    maxLength={channel === "whatsapp" ? 30 : 80}
                    onChange={(event) =>
                      onContactChange(channel, event.target.value)
                    }
                    placeholder={getContactPlaceholder(channel)}
                    aria-label={label}
                    className="h-10 min-w-0 rounded-sm border-emerald/25 bg-white focus-visible:border-emerald"
                  />
                </div>
              );
            })}
          </div>

          {canSelectViewers ? (
            <div className="rounded-sm border border-emerald/30 bg-white/78 p-3 shadow-[0_10px_20px_rgba(0,55,44,0.07)]">
              <Label className="font-bold text-black-jewel">
                Quem pode ver seus contatos
              </Label>
              <p className="mt-1 text-xs font-medium text-black-jewel/62">
                Busque e selecione Sugar Daddies ativos na plataforma.
              </p>
              <div className="relative mt-2">
                <div className="flex min-w-0 gap-2">
                  <Input
                    value={viewerDraft}
                    onChange={(event) =>
                      onViewerDraftChange(event.target.value.slice(0, 50))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        const suggestion =
                          exactSuggestion ?? availableSuggestions[0];
                        if (suggestion) {
                          onAddViewer(suggestion.username);
                        }
                      }
                    }}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={availableSuggestions.length > 0}
                    placeholder="Digite o username do Sugar Daddy"
                    className="h-10 min-w-0 rounded-sm border-emerald/25 bg-white focus-visible:border-emerald"
                  />
                  <Button
                    type="button"
                    size="icon"
                    aria-label="Adicionar username"
                    disabled={!exactSuggestion}
                    onClick={() =>
                      exactSuggestion && onAddViewer(exactSuggestion.username)
                    }
                    className="h-10 w-10 shrink-0 rounded-sm bg-emerald text-white hover:bg-emerald/85"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {viewerDraft.trim() &&
                (isSearchingViewers || availableSuggestions.length > 0) ? (
                  <div
                    role="listbox"
                    className="absolute z-30 mt-1 max-h-56 w-[calc(100%-3rem)] overflow-y-auto rounded-sm border border-emerald/25 bg-white p-1 shadow-xl"
                  >
                    {isSearchingViewers ? (
                      <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-black-jewel/62">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald" />
                        Buscando perfis ativos...
                      </div>
                    ) : (
                      availableSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          role="option"
                          aria-selected={
                            normalizeUsername(suggestion.username) ===
                            normalizeUsername(viewerDraft)
                          }
                          onClick={() => onAddViewer(suggestion.username)}
                          className="flex w-full min-w-0 items-center justify-between gap-3 rounded-sm px-3 py-2 text-left hover:bg-[color-mix(in_srgb,var(--emerald)_8%,white)]"
                        >
                          <span className="min-w-0 truncate text-sm font-bold text-black-jewel">
                            @{suggestion.username}
                          </span>
                          <span className="shrink-0 text-xs font-medium text-black-jewel/52">
                            {[suggestion.city, suggestion.state]
                              .filter(Boolean)
                              .join(", ") || "Ativo"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </div>

              {viewerError ? (
                <p className="mt-2 text-xs font-bold text-ruby">
                  {viewerError}
                </p>
              ) : viewerDraft.trim() &&
                !isSearchingViewers &&
                availableSuggestions.length === 0 ? (
                <p className="mt-2 text-xs font-medium text-black-jewel/62">
                  Nenhum Sugar Daddy ativo encontrado com esse username.
                </p>
              ) : null}

              {contactViewerUsernames.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {contactViewerUsernames.map((username) => (
                    <span
                      key={username}
                      className="inline-flex min-h-8 min-w-0 items-center gap-2 rounded-full border border-emerald/35 bg-[color-mix(in_srgb,var(--emerald)_8%,white)] px-3 py-1 text-sm font-bold text-black-jewel"
                    >
                      <AtSign className="h-3.5 w-3.5 shrink-0 text-emerald" />
                      <span className="min-w-0 truncate">{username}</span>
                      <button
                        type="button"
                        aria-label={`Remover ${username}`}
                        onClick={() => onRemoveViewer(username)}
                        className="rounded-full text-black-jewel/60 hover:text-ruby"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs font-medium leading-4 text-black-jewel/62">
                  Nenhum usuário selecionado. Seus contatos não aparecerão para
                  outros perfis.
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : visibleContacts.length > 0 ? (
        <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visibleContacts.map(({ channel, label, icon: Icon, value }) => (
            <a
              key={channel}
              href={getContactHref(channel, value)}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-16 min-w-0 items-center gap-3 rounded-sm border border-emerald/35 bg-white/80 px-3 py-2 text-sm font-bold text-black-jewel shadow-[0_10px_20px_rgba(0,55,44,0.08)] transition hover:border-emerald hover:bg-[color-mix(in_srgb,var(--emerald)_8%,white)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald text-white shadow-[0_8px_16px_rgba(0,108,88,0.24)]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs uppercase text-black-jewel/58">
                  {label}
                </span>
                <span className="block truncate">
                  {formatContactValue(channel, value)}
                </span>
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm font-medium leading-6 text-black-jewel/72">
          Nenhum contato selecionado para aparecer no perfil.
        </p>
      )}
    </div>
  );
}

function GalleryTile({
  photo,
  index,
  isEditing,
  onRemove,
  dark = false,
}: {
  photo: ProfilePhoto;
  index: number;
  isEditing: boolean;
  onRemove: () => void;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        "relative aspect-[1.18/1] overflow-hidden rounded-sm border-2 p-0.5 shadow-[0_12px_24px_rgba(0,55,44,0.14)]",
        dark ? "border-white/26 bg-emerald/30" : "border-emerald/45 bg-white",
      ].join(" ")}
    >
      <div className="h-full overflow-hidden rounded-[0.18rem]">
        <PhotoZoom
          src={photo.dataUrl}
          alt={`${photo.isPrivate ? "Foto privada" : "Foto pública"} ${index + 1}`}
          imageClassName="h-full w-full object-cover"
        />
      </div>
      <PhotoModerationBadge photo={photo} />
      {isEditing ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Remover foto ${index + 1}`}
          onClick={onRemove}
          className="absolute right-1 top-1 h-7 w-7 rounded-sm bg-[color-mix(in_srgb,var(--emerald)_78%,transparent)] text-white hover:bg-ruby hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}

function PhotoModerationBadge({ photo }: { photo: ProfilePhoto }) {
  if (photo.moderationStatus !== "PENDING") return null;

  return (
    <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-900 shadow-md">
      <Loader2 className="h-3 w-3" /> Em análise
    </span>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label className="font-bold text-black-jewel">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full min-w-0 rounded-sm border-emerald/25 bg-white focus-visible:border-emerald"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label className="font-bold text-black-jewel">{label}</Label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="min-h-28 w-full min-w-0 resize-y rounded-sm border border-emerald/25 bg-white px-3 py-2 text-sm font-medium text-black-jewel outline-none transition focus:border-emerald focus:ring-2 focus:ring-emerald/12"
      />
    </div>
  );
}

function ProfileSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label className="font-bold text-black-jewel">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-11 w-full min-w-0 rounded-sm border border-emerald/25 bg-white px-3 shadow-none focus:border-emerald focus:ring-0">
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function optionToSelectItem(option: string) {
  return {
    label: option,
    value: option,
  };
}

function getStoredProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return savedUser ? (JSON.parse(savedUser) as ProfileUser) : null;
  } catch {
    return null;
  }
}

function isUnknownPropertyError(result: unknown, property: string) {
  if (!result || typeof result !== "object" || !("message" in result)) {
    return false;
  }

  const { message } = result as { message?: unknown };
  const expectedMessage = `property ${property} should not exist`;

  return Array.isArray(message)
    ? message.includes(expectedMessage)
    : message === expectedMessage;
}

function formFromUser(user: ProfileUser): ProfileForm {
  const preferences = user.preferences?.preferences;

  return {
    username: user.username ?? "",
    birthDate: toDateInputValue(user.birthDate),
    country: user.country ?? "",
    state: user.state ?? "",
    city: user.city ?? "",
    whatsapp: user.whatsapp ?? "",
    telegram: user.telegram ?? "",
    instagram: user.instagram ?? "",
    lookingFor: user.lookingFor ?? "",
    relationshipIntent: user.relationshipIntent ?? "SUGAR",
    introductionPhrase: user.preferences?.introductionPhrase ?? "",
    aboutMe: user.preferences?.aboutMe ?? "",
    lookingForText: user.preferences?.lookingFor ?? "",
    bodyType: describeForProfile(user.appearance?.bodyType ?? "", user.gender),
    ethnicity: describeForProfile(
      user.appearance?.ethnicity ?? "",
      user.gender,
    ),
    hairColor: user.appearance?.hairColor ?? "",
    eyeColor: user.appearance?.eyeColor ?? "",
    heightCm: user.appearance?.heightCm ? String(user.appearance.heightCm) : "",
    smoke: preferences?.smoke ?? "",
    drink: preferences?.drink ?? "",
    relationship: describeForProfile(
      preferences?.relationship ?? "",
      user.gender,
    ),
    children: preferences?.children ?? "",
    education: preferences?.education ?? "",
    occupation: describeForProfile(preferences?.occupation ?? "", user.gender),
    customInterests: normalizeInterests(preferences?.customInterests),
    visibleContactChannels: normalizeVisibleContactChannels(
      preferences?.visibleContactChannels,
      user,
    ),
    contactViewerUsernames: normalizeUsernames(
      preferences?.contactViewerUsernames,
    ),
    privatePhotoViewerUsernames: normalizeUsernames(
      preferences?.privatePhotoViewerUsernames,
    ),
  };
}

const emptyForm: ProfileForm = {
  username: "",
  birthDate: "",
  country: "",
  state: "",
  city: "",
  whatsapp: "",
  telegram: "",
  instagram: "",
  lookingFor: "",
  relationshipIntent: "SUGAR",
  introductionPhrase: "",
  aboutMe: "",
  lookingForText: "",
  bodyType: "",
  ethnicity: "",
  hairColor: "",
  eyeColor: "",
  heightCm: "",
  smoke: "",
  drink: "",
  relationship: "",
  children: "",
  education: "",
  occupation: "",
  customInterests: [],
  visibleContactChannels: [],
  contactViewerUsernames: [],
  privatePhotoViewerUsernames: [],
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a foto."));
    reader.readAsDataURL(file);
  });
}

function sortPhotos(first: ProfilePhoto, second: ProfilePhoto) {
  return first.sortOrder - second.sortOrder;
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function getAge(birthDate?: string | null) {
  if (!birthDate) {
    return null;
  }

  const date = new Date(birthDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

function normalizeInterest(value: string) {
  return value.replace(/\s+/g, "").slice(0, 28);
}

function normalizeInterests(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((interest): interest is string => typeof interest === "string")
        .map(normalizeInterest)
        .filter(Boolean),
    ),
  ).slice(0, MAX_INTERESTS);
}

function normalizeUsername(value: string) {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

function normalizeUsernames(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((username): username is string => typeof username === "string")
        .map(normalizeUsername)
        .filter(Boolean),
    ),
  ).slice(0, 50);
}

function normalizeVisibleContactChannels(value: unknown, user: ProfileUser) {
  if (Array.isArray(value)) {
    return value.filter(isContactChannel).slice(0, 1);
  }

  return contactChannelOptions
    .filter(({ channel }) => Boolean(user[channel]))
    .map(({ channel }) => channel)
    .slice(0, 1);
}

function isContactChannel(value: unknown): value is ContactChannel {
  return value === "whatsapp" || value === "telegram" || value === "instagram";
}

function formatContactValue(channel: ContactChannel, value: string) {
  if (channel === "instagram" || channel === "telegram") {
    return value.startsWith("@") ? value : `@${value}`;
  }

  return value;
}

function getContactPlaceholder(channel: ContactChannel) {
  if (channel === "whatsapp") {
    return "+55 (11) 99999-9999";
  }

  return "@usuário";
}

function getContactHref(channel: ContactChannel, value: string) {
  if (channel === "whatsapp") {
    const digits = value.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : `https://wa.me/`;
  }

  const username = value.replace(/^@+/, "");

  if (channel === "telegram") {
    return `https://t.me/${username}`;
  }

  return `https://instagram.com/${username}`;
}
