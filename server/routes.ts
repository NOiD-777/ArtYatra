import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { classifyIndianArt } from "./services/gemini";
import multer from "multer";
import { insertClassificationSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for memory storage
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

  const httpServer = createServer(app);
  return httpServer;
}
