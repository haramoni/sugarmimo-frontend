export type ProfilePhoto = {
  id?: string;
  dataUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  sortOrder: number;
};

export type PublicProfile = {
  id: string;
  username?: string | null;
  role?: string | null;
  gender?: string | null;
  lookingFor?: string | null;
  birthDate?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  instagram?: string | null;
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
    preferences?: {
      customInterests?: unknown;
      [key: string]: unknown;
    } | null;
    introductionPhrase?: string | null;
    aboutMe?: string | null;
    lookingFor?: string | null;
  } | null;
};
