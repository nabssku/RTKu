import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface KKData {
  noKK: string;
  namaKepala: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  anggota: AnggotaKK[];
}

export interface AnggotaKK {
  nik: string;
  nama: string;
  jenisKelamin: string; // LAKI_LAKI or PEREMPUAN
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  agama: string; // ISLAM/KRISTEN/KATOLIK/HINDU/BUDDHA/KONGHUCU/LAINNYA
  pendidikan: string;
  pekerjaan: string;
  statusKawin: string; // BELUM_KAWIN/KAWIN/CERAI_HIDUP/CERAI_MATI
  hubungan: string; // KEPALA_KELUARGA/ISTRI/ANAK/etc
}

export async function extractKKFromImage(imageBase64: string): Promise<KKData> {
  const prompt = `Kamu adalah AI yang sangat ahli dalam membaca dan mengekstrak data dari foto Kartu Keluarga (KK) Indonesia.

Analisis gambar KK berikut dan ekstrak SEMUA data yang terlihat. Kembalikan HANYA dalam format JSON yang valid, tanpa penjelasan tambahan.

Format JSON yang diharapkan:
{
  "noKK": "nomor KK 16 digit",
  "namaKepala": "nama kepala keluarga",
  "alamat": "alamat lengkap",
  "rt": "nomor RT saja, contoh: 001",
  "rw": "nomor RW saja, contoh: 002",
  "kelurahan": "nama kelurahan/desa",
  "kecamatan": "nama kecamatan",
  "kabupaten": "nama kabupaten/kota",
  "provinsi": "nama provinsi",
  "kodePos": "kode pos",
  "anggota": [
    {
      "nik": "NIK 16 digit",
      "nama": "nama lengkap",
      "jenisKelamin": "LAKI_LAKI atau PEREMPUAN",
      "tempatLahir": "tempat lahir",
      "tanggalLahir": "YYYY-MM-DD",
      "agama": "ISLAM/KRISTEN/KATOLIK/HINDU/BUDDHA/KONGHUCU/LAINNYA",
      "pendidikan": "pendidikan terakhir",
      "pekerjaan": "pekerjaan",
      "statusKawin": "BELUM_KAWIN/KAWIN/CERAI_HIDUP/CERAI_MATI",
      "hubungan": "KEPALA_KELUARGA/ISTRI/ANAK/MENANTU/CUCU/ORANG_TUA/MERTUA/FAMILI_LAIN/LAINNYA"
    }
  ]
}

PENTING:
- Jika ada data yang tidak terbaca jelas, isi dengan string kosong ""
- Format tanggal lahir selalu YYYY-MM-DD. Jika hanya tahun contoh 1990 atau tidak valid, kosongkan atau set ke 1990-01-01.
- NIK dan No KK selalu 16 digit.
- Kembalikan langsung JSON, jangan dibungkus markdown codeblock alias langsung buka kurung kurawal.`;

  const completion = await groq.chat.completions.create({
    model: "qwen/qwen3.6-27b",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 4096,
  });

  const responseText = completion.choices[0]?.message?.content || "{}";
  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  try {
    return JSON.parse(jsonStr.trim()) as KKData;
  } catch (err) {
    console.error("Gagal mendeteksi JSON dari Groq: ", responseText);
    throw new Error(
      "Gagal mengekstrak data dari foto KK. Pastikan foto jelas dan terbaca.",
    );
  }
}
