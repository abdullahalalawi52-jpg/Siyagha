import { Request } from "express";
import { GoogleGenAI } from "@google/genai";

export interface GoogleAiRequest extends Request {
  ai?: GoogleGenAI;
  user?: {
    uid: string;
    email?: string;
  };
}
