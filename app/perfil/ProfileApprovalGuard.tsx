"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

type ApprovalUser = {
  role?: string | null;
  approvalStatus?: string | null;
};

export const PENDING_APPROVAL_ROUTE = "/register/pending-approval";

export function ProfileApprovalGuard({
  user,
  children = null,
}: {
  user: ApprovalUser | null;
  children?: ReactNode;
}) {
  const router = useRouter();
  const shouldRedirect = shouldShowPendingApproval(user);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(PENDING_APPROVAL_ROUTE);
    }
  }, [router, shouldRedirect]);

  if (!user || shouldRedirect) {
    return null;
  }

  return <>{children}</>;
}

export function shouldShowPendingApproval(user: ApprovalUser | null) {
  const role = user?.role?.trim().toUpperCase();
  const approvalStatus = user?.approvalStatus?.trim().toUpperCase();

  return role === "SUGAR_BABY" && approvalStatus !== "APPROVED";
}
