import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const { codeforces, leetcode, atcoder, hackerrank } = await req.json();

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      const clerkRes = await fetch(
        `https://api.clerk.com/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        }
      );
      const clerkData = await clerkRes.json();

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          name: `${clerkData.first_name} ${clerkData.last_name}`,
          email: clerkData.email_addresses[0].email_address,
          image: clerkData.image_url,
        },
      });
    }

    const handles = await prisma.handles.upsert({
      where: { userId: user.id },
      update: { codeforces, leetcode, atcoder, hackerrank },
      create: { userId: user.id, codeforces, leetcode, atcoder, hackerrank },
    });

    return NextResponse.json({ success: true, handles });
  } catch (error) {
    console.error("FULL ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { handles: true },
    });

    if (!user || !user.handles) {
      return NextResponse.json({ handles: null });
    }

    return NextResponse.json({ handles: user.handles });
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}