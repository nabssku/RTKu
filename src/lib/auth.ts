import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./db";
import { verifyOTP } from "./otp";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "otp-login",
      name: "WhatsApp OTP",
      credentials: {
        phone: { label: "Nomor WhatsApp", type: "text" },
        code: { label: "Kode OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null;

        const result = await verifyOTP(credentials.phone, credentials.code);
        if (!result.success) return null;

        const formattedPhone = credentials.phone.replace(/\D/g, "");
        const phone = formattedPhone.startsWith("0")
          ? "62" + formattedPhone.substring(1)
          : formattedPhone.startsWith("62")
          ? formattedPhone
          : "62" + formattedPhone;

        let user = await prisma.user.findUnique({
          where: { phone },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone,
              name: "Warga Baru",
              phoneVerified: true,
            },
          });
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: { phoneVerified: true },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          phone: user.phone,
          role: user.role,
          rtId: user.rtId,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.rtId = (user as any).rtId;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).rtId = token.rtId;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};

export async function getOrCreateRtId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { rtId: true }
  });

  if (user?.rtId) {
    return user.rtId;
  }

  const defaultRT = await prisma.rT.create({
    data: {
      name: "RT Baru",
      nomorRT: "001",
      nomorRW: "004",
      kelurahan: "Sukamaju",
      kecamatan: "Bekasi Timur",
      kabupaten: "Kota Bekasi",
      provinsi: "Jawa Barat",
      trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: false
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: { rtId: defaultRT.id, role: "KETUA_RT" }
  });

  return defaultRT.id;
}
