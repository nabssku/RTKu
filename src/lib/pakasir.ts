import prisma from "./db";

interface PakasirConfig {
  slug: string;
  apikey: string;
}

interface CreatePaymentParams {
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  description: string;
  redirectUrl?: string;
  callbackUrl?: string;
}

interface PakasirPaymentResponse {
  success: boolean;
  data?: {
    transactionId: string;
    paymentUrl: string;
    amount: number;
    status: string;
  };
  message?: string;
}

interface PakasirStatusResponse {
  success: boolean;
  data?: {
    transactionId: string;
    status: "pending" | "paid" | "expired" | "failed";
    amount: number;
    paidAt?: string;
  };
  message?: string;
}

export class Pakasir {
  private slug: string;
  private apikey: string;
  private baseUrl = "https://app.pakasir.com";

  constructor(config: { slug: string; apikey: string }) {
    this.slug = config.slug;
    this.apikey = config.apikey;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    return res.json() as Promise<T>;
  }

  async createPaymentLink(params: CreatePaymentParams): Promise<PakasirPaymentResponse> {
    const orderId = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const checkoutUrl = `${this.baseUrl}/pay/${this.slug}/${params.amount}?order_id=${orderId}&redirect=${encodeURIComponent(params.redirectUrl || "")}`;

    return {
      success: true,
      data: {
        transactionId: orderId,
        paymentUrl: checkoutUrl,
        amount: params.amount,
        status: "pending"
      }
    };
  }

  async getPaymentStatus(transactionId: string): Promise<PakasirStatusResponse> {
    try {
      const url = `${this.baseUrl}/api/transactiondetail?project=${this.slug}&amount=15000&order_id=${transactionId}&api_key=${this.apikey}`;
      const res = await fetch(url);
      const rawRes = await res.json() as any;

      if (rawRes && rawRes.transaction) {
        const trx = rawRes.transaction;
        return {
          success: true,
          data: {
            transactionId: trx.order_id || transactionId,
            status: trx.status === "completed" ? "paid" : "pending",
            amount: trx.amount || 0,
            paidAt: trx.completed_at
          }
        };
      }
      return {
        success: false,
        message: "Failed to fetch status"
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Network error"
      };
    }
  }
}

export async function getPakasir(rtId?: string): Promise<Pakasir> {
  const slug = process.env.PAKASIR_SLUG || "dummy-slug";
  const apikey = process.env.PAKASIR_API_KEY || "";

  if (rtId) {
    const rt = await prisma.rT.findUnique({
      where: { id: rtId },
      select: { pakasirSlug: true, pakasirApiKey: true }
    });
    if (rt?.pakasirSlug && rt?.pakasirApiKey) {
      return new Pakasir({ slug: rt.pakasirSlug, apikey: rt.pakasirApiKey });
    }
  }

  return new Pakasir({ slug, apikey });
}