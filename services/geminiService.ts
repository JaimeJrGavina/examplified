

import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateExamQuestions = async (subject: string, count: number = 3): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} Bar Exam style essay questions (Fact Patterns) for the subject: ${subject}. 
      The text should be a detailed scenario (2-3 paragraphs) ending with a specific call to question (e.g., 'Discuss the liabilities of...').`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique id" },
              text: { type: Type.STRING, description: "The comprehensive fact pattern and question." },
            },
            required: ["id", "text"],
          },
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("Empty response from Gemini");
    }

    const questions = JSON.parse(jsonStr) as any[];

    return questions.map((q, idx) => ({
      id: `gen_${Date.now()}_${idx}`,
      text: q.text,
      type: QuestionType.ESSAY,
      options: [],
    }));

  } catch (error) {
    console.error("Failed to generate questions:", error);
    // Fallback Bar Questions
    return [
      {
        id: "fallback_1",
        text: "Alice was driving her car down Main Street when she received a text message. She looked down to read it and did not see Bob crossing the street in a designated crosswalk. Alice struck Bob, causing him severe injuries. Bob was taken to the hospital where he was treated by Dr. Smith. Dr. Smith negligently administered the wrong medication, worsening Bob's condition. \n\nDiscuss the potential liability of Alice and Dr. Smith, including any defenses they might raise.",
        type: QuestionType.ESSAY,
        options: []
      },
      {
        id: "fallback_2",
        text: "Seller entered into a written contract with Buyer to sell a rare vintage guitar for $5,000. The contract specified that delivery and payment were to occur on June 1st. On May 15th, Seller called Buyer and stated, 'I got a better offer, I'm not selling to you.' Buyer immediately purchased a similar guitar for $6,500. On June 1st, Seller showed up at Buyer's house with the original guitar, demanding the $5,000. \n\nAnalyze the rights and remedies available to Buyer.",
        type: QuestionType.ESSAY,
        options: []
      }
    ];
  }
};

export interface GradedAnswer {
    score: number; // Score out of 10
    feedback: string;
}

export const gradeEssayAnswer = async (questionText: string, userAnswer: string, modelAnswer: string): Promise<GradedAnswer> => {
    try {
        const plainTextUserAnswer = userAnswer.replace(/<[^>]*>/g, ''); // Strip HTML tags for better analysis

        const prompt = `As an expert law school professor, grade the following student's essay answer for a bar exam question.
        
        Fact Pattern:
        ---
        ${questionText}
        ---
        
        Model Answer (for reference):
        ---
        ${modelAnswer}
        ---
        
        Student's Answer:
        ---
        ${plainTextUserAnswer}
        ---
        
        Provide a score out of 10 and constructive feedback. The feedback should identify key legal issues the student correctly identified, any issues they missed, and inaccuracies in their legal analysis. Keep the feedback concise and focused on actionable advice.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro", // Use a more powerful model for nuanced grading
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "A numerical score from 0 to 10." },
                        feedback: { type: Type.STRING, description: "Detailed feedback on the student's answer." },
                    },
                    required: ["score", "feedback"],
                },
            },
        });

        const jsonStr = response.text?.trim();
        if (!jsonStr) {
            throw new Error("Empty response from Gemini for grading.");
        }

        const result = JSON.parse(jsonStr) as GradedAnswer;
        return result;

    } catch (error) {
        console.error("Failed to grade answer:", error);
        return {
            score: 0,
            feedback: "Could not generate feedback at this time. The AI service may be unavailable or the answer format was invalid."
        };
    }
};