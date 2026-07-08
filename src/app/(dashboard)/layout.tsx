import React from "react";
import { Shell } from "@/components/layout/Shell";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { role: true }
  });

  return <Shell userRole={dbUser?.role || "WARGA"}>{children}</Shell>;
}
