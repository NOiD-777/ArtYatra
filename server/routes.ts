/// <reference lib="dom" />

import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { classifyIndianArt } from "./services/gemini";
import multer from "multer";
import { insertClassificationSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for memory storage (image classification)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Separate multer for Swecha one-shot upload (explicit single "file" field)
const swechaUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for safety
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all art styles with their location data
  app.get("/api/artstyles", async (req, res) => {
    try {
      const artStyles = await storage.getAllArtStyles();
      res.json(artStyles);
    } catch (error) {
      console.error("Error fetching art styles:", error);
      res.status(500).json({ 
        error: "Failed to fetch art styles",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get specific art style by ID
  app.get("/api/artstyles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const artStyle = await storage.getArtStyleById(id);
      
      if (!artStyle) {
        return res.status(404).json({ error: "Art style not found" });
      }
      
      res.json(artStyle);
    } catch (error) {
      console.error("Error fetching art style:", error);
      res.status(500).json({ 
        error: "Failed to fetch art style",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Classify uploaded artwork image
  app.post("/api/classify", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Convert image to base64
      const imageBase64 = req.file.buffer.toString('base64');
      
      // Classify with Gemini API
      const classificationResult = await classifyIndianArt(imageBase64);
      
      // Find matching art style in database
      const artStyle = await storage.getArtStyleByName(classificationResult.artStyleName);
      
      if (!artStyle) {
        return res.status(404).json({ 
          error: "Art style not found in database",
          classificationResult 
        });
      }

      // Store classification result
      const classification = await storage.createClassification({
        artStyleId: artStyle.id,
        imageData: imageBase64,
        confidence: classificationResult.confidence.toString(),
      });

      res.json({
        classification: {
          id: classification.id,
          confidence: classificationResult.confidence,
          reasoning: classificationResult.reasoning,
        },
        artStyle,
      });

    } catch (error) {
      console.error("Error classifying image:", error);
      res.status(500).json({ 
        error: "Failed to classify image",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get classification history for an art style
  app.get("/api/classifications/:artStyleId", async (req, res) => {
    try {
      const { artStyleId } = req.params;
      const classifications = await storage.getClassificationsByArtStyle(artStyleId);
      res.json(classifications);
    } catch (error) {
      console.error("Error fetching classifications:", error);
      res.status(500).json({ 
        error: "Failed to fetch classifications",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // --- EXISTING: Finalize-only proxy to Swecha (kept as-is / optional) ---
  app.post("/api/swecha/upload", async (req, res) => {
    try {
      const auth = req.header("authorization") ?? "";
      const {
        total_chunks = 1,
        filename,
        latitude,
        longitude,
        use_uid_filename = false,
        release_rights = "creator",
        user_id,
        media_type = "image",
        title,
        upload_uuid,             // e.g. crypto.randomUUID()
        description = "",
        category_id,
      } = req.body ?? {};

      if (!title || latitude == null || longitude == null) {
        return res.status(400).json({ error: "title, latitude and longitude are required" });
      }

      const form = new URLSearchParams();
      form.set("total_chunks", String(total_chunks));
      if (filename) form.set("filename", String(filename));
      form.set("latitude", String(latitude));
      form.set("longitude", String(longitude));
      form.set("use_uid_filename", String(use_uid_filename));
      form.set("release_rights", String(release_rights));
      if (user_id) form.set("user_id", String(user_id));
      form.set("media_type", String(media_type));
      form.set("title", String(title));
      if (upload_uuid) form.set("upload_uuid", String(upload_uuid));
      form.set("description", String(description));
      if (category_id) form.set("category_id", String(category_id));

      const upstream = await fetch("https://api.corpus.swecha.org/api/v1/records/upload", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          ...(auth ? { Authorization: auth } : {}),
        },
        body: form.toString(),
      });

      const text = await upstream.text();
      res.status(upstream.status).type(upstream.headers.get("content-type") ?? "application/json").send(text);
    } catch (err) {
      console.error("Swecha upload proxy error:", err);
      res.status(500).json({ error: "Failed to upload to Swecha" });
    }
  });

  // --- NEW: One-shot Swecha upload (chunk 0 + finalize total_chunks=1) ---
  // Expects multipart/form-data with fields:
  // - title, description, latitude, longitude, user_id, category_id, release_rights, use_uid_filename, media_type
  // - total_chunks="1", upload_uuid, filename, and file=<binary image>
  app.post("/api/swecha/upload/simple", swechaUpload.single("file"), async (req, res) => {
    try {
      const auth = req.header("authorization") ?? "";

      const {
        title,
        description = "",
        latitude,
        longitude,
        user_id,
        category_id = "4366cab1-031e-4b37-816b-311ee34461a9",
        release_rights = "creator",
        use_uid_filename = "false",
        media_type = "image",
        filename,
        upload_uuid,
      } = req.body ?? {};

      if (!title) return res.status(400).json({ error: "title is required" });
      if (latitude == null || longitude == null) return res.status(400).json({ error: "latitude & longitude required" });
      if (!user_id) return res.status(400).json({ error: "user_id is required" });
      if (!req.file) return res.status(400).json({ error: "file is required" });
      if (!upload_uuid) return res.status(400).json({ error: "upload_uuid is required" });

      const uuid = String(upload_uuid);
      const fileName = filename || req.file.originalname || "upload.jpg";

      // ---- Step 1: upload chunk 0 ----
      const chunkForm = new FormData();
chunkForm.set("upload_uuid", uuid);
chunkForm.set("chunk_index", "0");         // keep if accepted by API
chunkForm.set("filename", fileName);       // REQUIRED by error
chunkForm.set("total_chunks", "1");        // REQUIRED by error (single-chunk flow)

const blob = new Blob([req.file.buffer], { type: req.file.mimetype || "application/octet-stream" });
// IMPORTANT: field name must be "chunk" (not "file")
chunkForm.set("chunk", blob, fileName);    // REQUIRED by error

const chunkResp = await fetch("https://api.corpus.swecha.org/api/v1/records/upload/chunk", {
  method: "POST",
  headers: {
    accept: "application/json",
    ...(auth ? { Authorization: auth } : {}),
  },
  body: chunkForm,
});

      const chunkText = await chunkResp.text();
      if (!chunkResp.ok) {
        return res.status(chunkResp.status).type(chunkResp.headers.get("content-type") ?? "application/json").send(chunkText);
      }

      // ---- Step 2: finalize (total_chunks=1) ----
      const finalForm = new URLSearchParams();
      finalForm.set("total_chunks", "1");
      finalForm.set("filename", fileName);
      finalForm.set("latitude", String(latitude));
      finalForm.set("longitude", String(longitude));
      finalForm.set("use_uid_filename", String(use_uid_filename));
      finalForm.set("release_rights", String(release_rights));
      finalForm.set("user_id", String(user_id));
      finalForm.set("media_type", String(media_type));
      finalForm.set("title", String(title));
      finalForm.set("upload_uuid", uuid);
      finalForm.set("description", String(description));
      finalForm.set("category_id", String(category_id));

      const finalizeResp = await fetch("https://api.corpus.swecha.org/api/v1/records/upload", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          ...(auth ? { Authorization: auth } : {}),
        },
        body: finalForm.toString(),
      });

      const finalizeText = await finalizeResp.text();
      res.status(finalizeResp.status).type(finalizeResp.headers.get("content-type") ?? "application/json").send(finalizeText);
    } catch (err) {
      console.error("Swecha simple upload error:", err);
      res.status(500).json({ error: "Failed to upload file to Swecha" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}