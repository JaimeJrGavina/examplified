import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;

// Create AI instance only if API key exists
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateExamQuestions = async (subject: string, count: number = 3): Promise<Question[]> => {
  if (!ai) {
    console.warn('Gemini API key not configured. Using mock questions instead.');
    return generateMockQuestions(subject, count);
  }

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

// Mock BART questions when Gemini API is unavailable
const generateMockQuestions = (subject: string, count: number): Question[] => {
    const mockQuestionsMap: Record<string, Question[]> = {
        "Reading Comprehension": [
            {
                id: "mock-1",
                text: "Read the passage carefully and answer the following question:\n\nScience has demonstrated that the human brain remains remarkably plastic throughout life. Recent studies show that neuroplasticity—the brain's ability to reorganize itself by forming new neural connections—persists well into old age. This challenges the previously held belief that neural development ceased after childhood.",
                type: "short_answer",
                subject: "Reading Comprehension",
                correctAnswer: "The brain can reorganize itself and form new neural connections throughout life.",
                points: 5
            },
            {
                id: "mock-2",
                text: "What does the term 'neuroplasticity' mean in the context of the passage?",
                type: "short_answer",
                subject: "Reading Comprehension",
                correctAnswer: "Neuroplasticity is the brain's ability to reorganize itself by forming new neural connections.",
                points: 5
            },
            {
                id: "mock-3",
                text: "According to the passage, what previous belief about neural development is being challenged?",
                type: "short_answer",
                subject: "Reading Comprehension",
                correctAnswer: "The belief that neural development ceased after childhood.",
                points: 5
            }
        ],
        "Writing Skills": [
            {
                id: "mock-4",
                text: "Write a paragraph explaining why education is important in modern society.",
                type: "short_answer",
                subject: "Writing Skills",
                correctAnswer: "Education provides essential knowledge and critical thinking skills needed to navigate an increasingly complex world.",
                points: 5
            },
            {
                id: "mock-5",
                text: "Compose a thesis statement for an essay about climate change.",
                type: "short_answer",
                subject: "Writing Skills",
                correctAnswer: "Climate change represents one of the most significant challenges of our time, requiring immediate global action across multiple sectors.",
                points: 5
            },
            {
                id: "mock-6",
                text: "Explain the importance of clear communication in professional settings.",
                type: "short_answer",
                subject: "Writing Skills",
                correctAnswer: "Clear communication ensures that information is accurately conveyed, preventing misunderstandings and enabling effective collaboration.",
                points: 5
            }
        ],
        "Mathematics": [
            {
                id: "mock-7",
                text: "Solve: If a store offers a 20% discount on an item originally priced at $50, what is the final price?",
                type: "short_answer",
                subject: "Mathematics",
                correctAnswer: "$40 or 40 dollars",
                points: 5
            },
            {
                id: "mock-8",
                text: "Calculate: What is 15% of 200?",
                type: "short_answer",
                subject: "Mathematics",
                correctAnswer: "30",
                points: 5
            },
            {
                id: "mock-9",
                text: "If a rectangle has a length of 12 cm and a width of 8 cm, what is its area?",
                type: "short_answer",
                subject: "Mathematics",
                correctAnswer: "96 square centimeters or 96 cm²",
                points: 5
            }
        ]
    };

    // Return questions for the specified subject or default questions
    const questions = mockQuestionsMap[subject] || mockQuestionsMap["Reading Comprehension"] || [];
    return questions.slice(0, count);
};