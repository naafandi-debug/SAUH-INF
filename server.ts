import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy-key-for-initialization",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// =========================================================================
// API ROUTES
// =========================================================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Question Generator Endpoint (PRD Section 41 & 42)
app.post("/api/ai/generate-questions", async (req, res) => {
  try {
    const { material, submaterial, difficulty, count = 5, grade = "9 SMP", customPrompt } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "GEMINI_API_KEY belum dikonfigurasi pada Settings > Secrets.",
      });
    }

    const ai = getGeminiClient();

    const promptText = `Anda adalah pembuat soal ahli kurikulum Informatika SMP Kelas 9 (Kurikulum Merdeka / Nasional Indonesia).
Buatlah ${count} soal pilihan ganda baru berkualitas tinggi, akurat secara akademis, dan belum pernah ada sebelumnya.

Kriteria:
- Mata Pelajaran: Informatika SMP Kelas ${grade}
- Materi Utama: ${material || "Struktur Data & Logika Informatika"}
- Submateri: ${submaterial || "LIFO, FIFO, Stack, Queue, Array, Tree, Graph, Gerbang AND, OR, NOT, XOR, Tabel Kebenaran"}
- Tingkat Kesulitan: ${difficulty || "Sedang"}
${customPrompt ? `- Catatan Khusus Guru: ${customPrompt}` : ""}

Pedoman Mutu:
1. Pertanyaan harus jelas, kontekstual, menggunakan istilah resmi Informatika SMP (LIFO, FIFO, Stack, Queue, Push, Pop, Enqueue, Dequeue, Tree, Graph, Gerbang AND/OR/NOT/XOR, Tabel Kebenaran).
2. Setiap soal wajib memiliki 4 opsi jawaban (A, B, C, D) yang masuk akal (tidak asal-asalan).
3. Tentukan kunci jawaban yang pasti benar (A, B, C, atau D).
4. Berikan Pembahasan (explanation) detail langkah demi langkah yang mengedukasi siswa.
5. Tuliskan sumber referensi.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptText,
      config: {
        systemInstruction: "Anda adalah tim penyusun soal Ujian Nasional / Asesmen Informatika SMP resmi di Indonesia. Keluarkan output berupa JSON array terstruktur.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "Teks pertanyaan soal pilihan ganda dalam bahasa Indonesia.",
              },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Huruf opsi misal 'A', 'B', 'C', 'D'" },
                    text: { type: Type.STRING, description: "Isi teks pilihan jawaban" },
                  },
                  required: ["id", "text"],
                },
                description: "Daftar 4 pilihan jawaban A, B, C, D.",
              },
              correctOptionId: {
                type: Type.STRING,
                description: "Huruf kunci jawaban benar ('A', 'B', 'C', atau 'D')",
              },
              material: {
                type: Type.STRING,
                description: "Materi utama (misal 'Struktur Data' atau 'Logika Informatika')",
              },
              submaterial: {
                type: Type.STRING,
                description: "Submateri spesifik misal 'Stack & LIFO', 'Queue & FIFO', 'Gerbang Logika Dasar'",
              },
              difficulty: {
                type: Type.STRING,
                description: "'Mudah', 'Sedang', atau 'Sulit'",
              },
              explanation: {
                type: Type.STRING,
                description: "Penjelasan lengkap pembahasan jawaban benar.",
              },
              source: {
                type: Type.STRING,
                description: "Nama sumber referensi soal",
              },
            },
            required: ["question", "options", "correctOptionId", "material", "submaterial", "difficulty", "explanation"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    // Attach generated IDs
    const formatted = parsed.map((q: any, idx: number) => ({
      ...q,
      id: `AI_Q${Date.now()}_${idx + 1}`,
      status: "draft",
      source: q.source || "AI Generator (Gemini 3.7)",
      createdAt: new Date().toISOString(),
    }));

    res.json({ success: true, questions: formatted });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: error.message || "Gagal membuat soal dengan AI." });
  }
});

// AI Search Internet Reference Questions Endpoint (PRD Section 10 & 42)
app.post("/api/ai/search-questions", async (req, res) => {
  try {
    const { query = "soal informatika kelas 9 struktur data lifo fifo dan gerbang logika" } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "GEMINI_API_KEY belum dikonfigurasi pada Settings > Secrets.",
      });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Carikan 5 contoh referensi soal Informatika Kelas 9 SMP tentang: ${query}.
Sajikan dalam format JSON terstruktur lengkap dengan opsi A, B, C, D, kunci jawaban, submateri, tingkat kesulitan, dan pembahasan verifikasi guru.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ["id", "text"],
                },
              },
              correctOptionId: { type: Type.STRING },
              material: { type: Type.STRING },
              submaterial: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              explanation: { type: Type.STRING },
              source: { type: Type.STRING },
            },
            required: ["question", "options", "correctOptionId", "material", "submaterial", "difficulty", "explanation"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    const formatted = parsed.map((q: any, idx: number) => ({
      ...q,
      id: `REF_Q${Date.now()}_${idx + 1}`,
      status: "draft",
      source: q.source || "Referensi Kurikulum & Internet",
      createdAt: new Date().toISOString(),
    }));

    res.json({ success: true, questions: formatted });
  } catch (error: any) {
    console.error("AI Search Error:", error);
    res.status(500).json({ error: error.message || "Gagal mencari referensi soal." });
  }
});

// =========================================================================
// START SERVER & VITE INTEGRATION
// =========================================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Informatika Daily Assessment Server running on http://localhost:${PORT}`);
  });
}

startServer();
