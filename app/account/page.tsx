import {
  getUserProfile,
  getUserSubscription,
  getUserUsageStats,
} from "@/data/user";
import { UserInfoCard } from "@/components/profile/user-info-card";
import { PlanCard } from "@/components/profile/plan-card";
import { UsageStatsCard } from "@/components/profile/usage-stats-card";
import { AccountSkeleton } from "@/components/account/account-skeleton";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function AccountContent() {
  const [user, subscription, stats] = await Promise.all([
    getUserProfile(),
    getUserSubscription(),
    getUserUsageStats(),
  ]);

  if (!user || !subscription) {
    redirect("/sign-in");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <UserInfoCard user={user} />
        <UsageStatsCard stats={stats} />
      </div>

      <div>
        <PlanCard subscription={subscription} />
      </div>
    </div>
  );
}

export default async function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="mt-2 space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your profile, subscription, and usage
          </p>
        </div>
        <Suspense fallback={<AccountSkeleton />}>
          <AccountContent />
        </Suspense>
      </div>
    </div>
  );
}
