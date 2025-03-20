import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { Product } from '../models/Product';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const file = req.file;
    if (!name || !file) {
      return res.status(400).json({ message: "Name and image are required" });
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

    const product = await Product.create({
      id: uuidv4(),
      name,
      imageUrl: result.secure_url,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
}; 

export const tryOnClothes = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const selfie = req.file;

    if (!productId || !selfie) {
      return res.status(400).json({ message: "Product ID and selfie are required" });
    }

    // Lấy thông tin sản phẩm từ database
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Upload ảnh selfie lên Cloudinary
    const selfieResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { folder: "selfies" },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(selfie.buffer);
    }) as { secure_url: string };

    // Gọi API try-on
    const tryOnResult = await axios.post('https://api.developer.pixelcut.ai/v1/try-on', {
      person_image_url: selfieResult.secure_url,
      garment_image_url: product.imageUrl
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-KEY': process.env.PIXELCUT_API_KEY
      }
    });

    // Trả về kết quả
    res.json(tryOnResult.data);

  } catch (error) {
    res.status(500).json({ message: "Failed to process try-on", error });
  }
};
