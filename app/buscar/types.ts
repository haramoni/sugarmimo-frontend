export type ProfilePhoto = {
  id?: string;
  dataUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  sortOrder: number;
  isPrivate?: boolean;
};

export type PublicProfile = {
  id: string;
  username?: string | null;
  role?: string | null;
  isPremium?: boolean;
  isPremiere?: boolean;
  boostedUntil?: string | null;
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
  lastActiveAt?: string | null;
  isOnline?: boolean;
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
  interaction?: {
    liked?: boolean;
    likeId?: string | null;
    likedAt?: string | null;
    daddyLiked?: boolean;
    daddyLikedAt?: string | null;
    babyLiked?: boolean;
    babyLikedAt?: string | null;
    contactsReleased?: boolean;
    contactsReleasedAt?: string | null;
  };
  canViewPrivatePhotos?: boolean;
};

export type PublicProfilePage = {
  items: PublicProfile[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};
