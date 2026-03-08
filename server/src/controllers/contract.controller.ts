import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { IUser } from "../models/user.model";
import {
  AI_MODEL,
  analyzeContractWithAI,
  detectContractType,
  extractTextFromPDF,
} from "../services/ai.services";
import ContractCache from "../models/contract-cache.model";
import ContractAnalysisSchema, {
  IContractAnalysis,
} from "../models/contract.model";
import mongoose, { FilterQuery } from "mongoose";
import { isValidMongoId } from "../utils/mongoUtils";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only pdf files are allowed"));
    }
  },
}).single("contract");

export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload(req, res, (error?: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "File too large. Max size is 10MB." });
      return;
    }

    res.status(400).json({ error: "Invalid upload. Only PDF files are allowed." });
  });
};

export const detectAndConfirmContractType = async (
  req: Request,
  res: Response
) => {
  const user = req.user as IUser;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const pdfText = await extractTextFromPDF(req.file.buffer);
    const detectedType = await detectContractType(pdfText);

    res.json({ detectedType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to detect contract type" });
  }
};

export const analyzeContract = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { contractType } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (!contractType) {
    return res.status(400).json({ error: "No contract type provided" });
  }

  try {
    const pdfText = await extractTextFromPDF(req.file.buffer);
    let analysis;

    if (user.isPremium) {
      analysis = await analyzeContractWithAI(pdfText, "premium", contractType);
    } else {
      analysis = await analyzeContractWithAI(pdfText, "free", contractType);
    }

    if (!analysis.summary || !analysis.risks || !analysis.opportunities) {
      throw new Error("Failed to analyze contract");
    }

    const savedAnalysis = await ContractAnalysisSchema.create({
      userId: user._id,
      contractText: pdfText,
      contractType,
      ...(analysis as Partial<IContractAnalysis>),
      language: "en",
      aiModel: AI_MODEL,
    });

    res.json(savedAnalysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to analyze contract" });
  }
};

export const getUserContracts = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  try {
    interface QueryType {
      userId: mongoose.Types.ObjectId;
    }

    const query: QueryType = { userId: user._id as mongoose.Types.ObjectId };
    const contracts = await ContractAnalysisSchema.find(
      query as FilterQuery<IContractAnalysis>
    ).sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get contracts" });
  }
};

export const getContractByID = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IUser;

  if (!isValidMongoId(id)) {
    return res.status(400).json({ error: "Invalid contract ID" });
  }

  try {
    const cachedContract = await ContractCache.findOne({ contractId: id }).lean();
    if (cachedContract) {
      return res.json(cachedContract.data);
    }

    //if not in cache, get from db
    const contract = await ContractAnalysisSchema.findOne({
      _id: id,
      userId: user._id,
    });

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    await ContractCache.findOneAndUpdate(
      { contractId: id },
      {
        data: contract.toObject(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
      { upsert: true }
    );

    res.json(contract);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get contract" });
  }
};

export const deleteContractById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IUser;

  if (!isValidMongoId(id)) {
    res.status(400).json({ error: "Invalid contract ID" });
    return;
  }

  try {
    const deleted = await ContractAnalysisSchema.findOneAndDelete({
      _id: id,
      userId: user._id,
    });

    if (!deleted) {
      res.status(404).json({ error: "Contract not found" });
      return;
    }

    await ContractCache.deleteOne({ contractId: id });
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete contract" });
  }
};
