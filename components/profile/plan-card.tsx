import { Crown, Zap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserSubscription } from "@/db/schema";

type PlanCardProps = {
  subscription: UserSubscription;
};

const PLAN_INFO = {
  free: {
    name: "Free",
    icon: null,
    color: "default" as const,
    description: "5 downloads every 5 hours",
  },
  pro: {
    name: "Pro",
    icon: Crown,
    color: "default" as const,
    description: "100 downloads per day",
  },
  unlimited: {
    name: "Unlimited",
    icon: Zap,
    color: "default" as const,
    description: "Unlimited downloads",
  },
};

export function PlanCard({ subscription }: PlanCardProps) {
  const plan = PLAN_INFO[subscription.plan as keyof typeof PLAN_INFO];
  const Icon = plan.icon;

  const isExpiringSoon =
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd).getTime() - Date.now() <
      7 * 24 * 60 * 60 * 1000;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </div>
          <Badge variant={plan.color} className="flex items-center gap-1">
            {Icon && <Icon className="size-3" />}
            {plan.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.plan !== "free" && subscription.currentPeriodEnd && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Billing cycle</span>
              <span className="font-medium">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
            {subscription.cancelAtPeriodEnd && (
              <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-3 text-sm">
                <p className="text-orange-900 dark:text-orange-100 font-medium">
                  Subscription ending
                </p>
                <p className="text-orange-700 dark:text-orange-300 text-xs mt-1">
                  Your subscription will end on{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            )}
            {isExpiringSoon && !subscription.cancelAtPeriodEnd && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-sm">
                <p className="text-blue-900 dark:text-blue-100 text-xs">
                  Renews{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}

        {subscription.plan === "free" && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Upgrade for more downloads and premium features
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
