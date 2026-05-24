import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini Client to avoid crashing if API key is missing on start
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        geminiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (err) {
        console.error("Failed to initialize Gemini Client:", err);
      }
    }
  }
  return geminiClient;
}

// REST APIs
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Draft Answer Generation API with Gemini
app.post("/api/gemini/generate-draft", async (req, res) => {
  const { query, category, tags } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Yêu cầu cung cấp câu hỏi (query)." });
  }

  const client = getGeminiClient();
  if (!client) {
    // Elegant fallback simulator offering detailed local templates when Gemini API is not yet loaded
    console.log("Gemini API Client is offline. Simulating local intelligent response draft...");
    
    // Rule-based simulation for awesome local functionality:
    let localDraft = "";
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("jordan") || lowerQuery.includes("bè") || lowerQuery.includes("chân bè")) {
      localDraft = "Chào bạn! Với dòng giày Jordan (đặc biệt là Air Jordan 1), form giày thường có xu hướng hơi ôm (hẹp ngang) đặc trưng của dòng bóng rổ cổ điển. Nếu bạn sở hữu bàn chân bè, chúng tôi khuyến khích bạn nên tăng thêm 0.5 size (nửa size) so với size chuẩn của mình để có trải nghiệm thoải mái nhất ở hai bên má bàn chân. Bạn cũng có thể cân nhắc nới lỏng dây giày ở phần thân để giảm áp lực căng ép.";
    } else if (lowerQuery.includes("mã giảm") || lowerQuery.includes("sale") || lowerQuery.includes("birthday20")) {
      localDraft = "Chào quý hội viên! Mã giảm giá BIRTHDAY20 của chương trình Nike Elite Birthday Promotion áp dụng cho tất cả các sản phẩm nguyên giá trên cửa hàng, ngoại trừ các bộ sưu tập giới hạn (Limited Edition) hoặc các sản phẩm đã nằm trong danh mục ưu đãi giảm giá (Sale) khác. Để áp dụng ưu đãi hợp lệ, bạn có thể kiểm tra danh sách sản phẩm nguyên giá tại Bộ sư tập Mới của shop nhé!";
    } else if (lowerQuery.includes("tech fleece") || lowerQuery.includes("xù lông") || lowerQuery.includes("chất liệu")) {
      localDraft = "Chào bạn! Chất liệu vải Tech Fleece được cấu tạo từ ba lớp vật liệu cải tiến (66% cotton / 34% polyester) dệt cao cấp, tạo cảm giác mềm mịn siêu nhẹ mà vẫn giữ ấm tối ưu. Ở phiên bản Nike Elite năm nay, kết cấu bề mặt cotton được xử lý hoàn thiện gia cường kép chống xơ vải, cam kết không còn xù bông hay rụng vải dăm sau nhiều lần giặt máy như các dòng fleece phổ thông khác.";
    } else {
      localDraft = `Cảm ơn bạn đã phản hồi! Về câu hỏi liên quan đến [${category || 'Sản phẩm'}], Nike Elite cam kết cung cấp những trải nghiệm tốt nhất. Sản phẩm này sử dụng thiết kế cấu hình tối ưu, hỗ trợ đàn hồi cao và bám đường tối đa. Bạn có thể tham khảo chính sách đổi trả miễn phí trong 30 ngày từ cửa hàng của chúng tôi để an tâm lựa chọn dải sản phẩm phù hợp nhé!`;
    }

    return res.json({
      success: true,
      isSimulated: true,
      text: localDraft,
      message: "Generated using elegant Local Knowledge Base (API Key configured in Settings > Secrets will activate real Gemini generation!)"
    });
  }

  try {
    const systemInstruction = `
      Bạn là Chuyên viên Hỗ trợ Khách hàng Cao cấp của Nike Elite Việt Nam.
      Hãy soạn thảo câu trả lời thông minh, chuyên nghiệp, lịch thiệp và mang tính thuyết phục cao cho câu hỏi unresolved của khách hàng.
      
      Thông tin ngữ cảnh:
      - Câu hỏi: "${query}"
      - Phân loại ý định: "${category || "Chưa phân loại"}"
      - Thẻ kiến thức có sẵn: ${tags && tags.length > 0 ? tags.join(", ") : "Nike, Đẳng cấp"}
      
      Quy tắc trả lời:
      - Trả lời bằng tiếng Việt trang trọng, hữu ích, xưng hô lịch thiệp ("Chào bạn / Cảm ơn quý khách", "Nike Elite").
      - Ngắn gọn nhưng đầy đủ thông tin kỹ thuật đặc trưng của giày/áo Nike (như công nghệ đệm Air Zoom, chất liệu dệt Flyknit dẻo dai, chống xù lông của Tech Fleece, lời khuyên chọn size cho bàn chân bè...).
      - Không sử dụng các từ ngữ quá sến sẩm, tập trung vào công nghệ đỉnh cao và dịch vụ chu đáo của Nike Elite.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Hãy tự động soạn thảo câu trả lời hay nhất cho câu hỏi: "${query}"`,
      config: {
        systemInstruction,
        temperature: 0.75,
      }
    });

    const reply = response.text || "Xin lỗi, không thể tạo phản hồi lúc này.";
    return res.json({
      success: true,
      isSimulated: false,
      text: reply
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: "Không thể kết nối với trí tuệ nhân tạo Gemini. Đang dùng phản hồi dự phòng.",
      details: error.message
    });
  }
});

// Start function for server
async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT MODE with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION MODE serving build dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nike Elite Server resides happily on port ${PORT}`);
  });
}

startServer();
