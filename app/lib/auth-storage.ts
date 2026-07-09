"use client";

import type { AuthUser } from "./auth";

export const AUTH_USER_STORAGE_KEY = "sugarmimo:user";

type StorableUser = AuthUser & {
  [key: string]: unknown;
};

function stripHeavyProfileFields(user: StorableUser) {
  const storableUser = { ...user };
  delete storableUser.photos;

  return storableUser;
}

function toMinimalUser(user: StorableUser) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    approvalStatus: user.approvalStatus,
  };
}

export function saveAuthUser(user: StorableUser) {
  try {
    window.localStorage.setItem(
      AUTH_USER_STORAGE_KEY,
      JSON.stringify(stripHeavyProfileFields(user)),
    );
  } catch {
    try {
      window.localStorage.setItem(
        AUTH_USER_STORAGE_KEY,
        JSON.stringify(toMinimalUser(user)),
      );
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
    }
  }
}

export function removeAuthUser() {
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}
