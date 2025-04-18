import express from "express";
import cors from "cors";
import multer from "multer";
import cloudinary from "cloudinary";
import { config } from "dotenv";
import productRoutes from "./routes/productRoutes";
import sequelize from "./config/database";
config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req: any, res: any) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { folder: "products" },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    }) as { secure_url: string };

    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
});
app.use('/products', productRoutes);

sequelize.sync({ force: true })
  .then(() => {
    console.log('Database synced');
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});