import { GoogleGenAI, Modality } from '@google/genai';
import { Attachment } from '../types';

if (!process.env.API_KEY) {
    // In a real app, you'd want to handle this more gracefully.
    // Maybe show a UI element asking the user to configure their key.
    // For this example, we'll throw an error if the key is missing.
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateImage = async (prompt: string): Promise<{ text?: string; imageUrl?: string }> => {
    // More robustly clean the prompt to extract the image description.
    const cleanPrompt = prompt.trim().replace(/^(?:\/generate|generate|create|make|draw)\s*(?:an?|the)?\s*(?:image|picture|photo|drawing)?\s*(?:of|for)?\s*/i, '').trim();

    if (!cleanPrompt) {
        return { text: "Please provide a prompt for image generation." };
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: cleanPrompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return {
                    text: `Generated image for: "${cleanPrompt}"`,
                    imageUrl: `data:image/png;base64,${base64ImageBytes}`
                };
            }
        }
        // Check if the model returned text instead, which can happen for safety reasons or unsupported prompts.
        const responseText = response.text;
        if (responseText) {
            return { text: responseText };
        }
    } catch (e) {
        console.error("Image generation failed", e);
        return { text: "Sorry, I was unable to generate an image. The model may have refused the request." };
    }


    return { text: "Sorry, I couldn't generate an image for that prompt. Please try a different description." };
};

const generateTextOrVision = async (prompt: string, attachment: Attachment | null): Promise<{ text?: string; imageUrl?: string }> => {
    const model = 'gemini-2.5-pro';
    
    const parts: any[] = [{ text: prompt }];

    if (attachment) {
        parts.unshift({
            inlineData: {
                mimeType: attachment.mimeType,
                data: attachment.base64,
            },
        });
    }

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: parts },
    });

    return { text: response.text };
};

export const generateContent = async (prompt: string, attachment: Attachment | null): Promise<{ text?: string; imageUrl?: string }> => {
    const trimmedPrompt = prompt.trim();

    // More robust check for image generation requests.
    // It should not trigger if an attachment is present (vision request).
    // It checks for a command verb (generate, create, etc.) at the start of the prompt,
    // and an object noun (image, picture, etc.) somewhere in the prompt.
    const commandVerbRegex = /^(?:\/generate|generate|create|make|draw)\b/i;
    const objectNounRegex = /\b(image|picture|photo|drawing)\b/i;
    const isImageGenRequest = !attachment && commandVerbRegex.test(trimmedPrompt) && objectNounRegex.test(trimmedPrompt);

    if (isImageGenRequest) {
        return generateImage(prompt);
    } else {
        return generateTextOrVision(prompt, attachment);
    }
};
