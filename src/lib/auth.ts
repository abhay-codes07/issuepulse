import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
    },
    create: {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
    },
  });

  return user;
}

export async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
