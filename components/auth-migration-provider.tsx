"use client";

import { useAuthMigration } from "@/hooks/use-auth-migration";

export function AuthMigrationProvider() {
  useAuthMigration();
  return null;
}
