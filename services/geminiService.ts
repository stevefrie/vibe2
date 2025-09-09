
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { fileToBase64 } from "../utils/imageUtils";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface EditImageResult {
    editedImageBase64: string | null;
    text: string | null;
}

export const editImage = async (imageFile: File, prompt: string): Promise<EditImageResult> => {
    try {
        const base64Data = await fileToBase64(imageFile);

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: imageFile.type,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let editedImageBase64: string | null = null;
        let text: string | null = null;

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    editedImageBase64 = part.inlineData.data;
                } else if (part.text) {
                    text = part.text;
                }
            }
        }
        
        if (!editedImageBase64 && !text) {
             throw new Error("Model response did not contain an image or text. Please try again with a different prompt.");
        }

        return { editedImageBase64, text };

    } catch (error) {
        console.error("Error editing image with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to process image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI model.");
    }
};
