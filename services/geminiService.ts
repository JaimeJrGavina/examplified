import { Question, QuestionType } from "../types";

/**
 * Exam Service - Mock Questions & Grading
 * 
 * Note: Gemini API has been removed for simplicity.
 * The app now uses curated mock questions and basic grading.
 */

// Generate exam questions (returns mock questions)
export const generateExamQuestions = async (subject: string, count: number = 3): Promise<Question[]> => {
  console.log(`Generating ${count} mock questions for subject: ${subject}`);
  return generateMockQuestions(subject, count);
};

export interface GradedAnswer {
  score: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// Grade essay answers (returns mock grading)
export const gradeEssayAnswer = async (
  _questionText: string,
  userAnswer: string,
  _modelAnswer: string
): Promise<GradedAnswer> => {
  console.log('Grading essay (using mock grading)');
  return generateMockGrade(userAnswer);
};

// Generate mock grading based on answer length and keywords
function generateMockGrade(userAnswer: string): GradedAnswer {
  const plainText = userAnswer.replace(/<[^>]*>/g, '').trim();
  const wordCount = plainText.split(/\s+/).length;

  let score = 0;
  const maxScore = 100;

  // Scoring based on answer length
  if (wordCount < 50) {
    score = 30;
  } else if (wordCount < 150) {
    score = 50;
  } else if (wordCount < 300) {
    score = 75;
  } else {
    score = 85;
  }

  // Bonus for legal keywords
  const legalKeywords = [
    "contract", "liability", "negligence", "damages", "breach", "tort",
    "defense", "consideration", "offer", "acceptance", "statute",
    "evidence", "burden of proof", "preponderance", "crime", "defendant",
    "plaintiff", "analysis", "therefore", "however", "discuss", "element"
  ];

  const keywordCount = legalKeywords.filter(kw =>
    plainText.toLowerCase().includes(kw)
  ).length;

  score += Math.min(keywordCount * 2, 15);
  score = Math.min(score, maxScore);

  return {
    score: Math.round(score),
    maxScore,
    feedback: generateFeedback(wordCount, score),
    strengths: generateStrengths(wordCount, plainText),
    improvements: generateImprovements(wordCount, score),
  };
}

function generateFeedback(wordCount: number, score: number): string {
  if (score >= 85) {
    return "Excellent response! You provided comprehensive legal analysis with clear reasoning.";
  } else if (score >= 75) {
    return "Good response. You covered the main points but could expand on some details.";
  } else if (score >= 50) {
    return "Adequate response, but needs more detail and deeper analysis.";
  } else {
    return "Your response is too brief. Please provide more comprehensive legal analysis.";
  }
}

function generateStrengths(wordCount: number, answer: string): string[] {
  const strengths: string[] = [];

  if (wordCount > 100) {
    strengths.push("Good depth and detail");
  }

  if (answer.match(/(however|therefore|because|since|thus)/gi)) {
    strengths.push("Clear logical reasoning");
  }

  if (answer.match(/[A-Z][a-z]+(\s+[A-Z][a-z]+)?/g)?.length ?? 0 > 5) {
    strengths.push("Use of legal terminology");
  }

  if (strengths.length === 0) {
    strengths.push("Shows understanding of the question");
  }

  return strengths;
}

function generateImprovements(wordCount: number, score: number): string[] {
  const improvements: string[] = [];

  if (wordCount < 150) {
    improvements.push("Expand your answer with more detailed analysis");
  }

  if (score < 75) {
    improvements.push("Include more specific legal principles");
  }

  improvements.push("Address counterarguments or alternative perspectives");
  improvements.push("Provide a clear conclusion");

  return improvements;
}

// Mock BART exam questions for different subjects
const generateMockQuestions = (subject: string, count: number): Question[] => {
  const mockQuestions: { [key: string]: string[] } = {
    "Contracts": [
      "Alice and Bob entered into a written contract whereby Alice agreed to sell Bob her commercial building for $500,000. The contract stated that 'time is of the essence.' The closing date was set for June 15, 2024. On June 14, Alice informed Bob that she could not close the sale. Bob did not respond until June 25, when he informed Alice that he was demanding specific performance. Did Bob effectively accept Alice's repudiation? Discuss the elements of contract formation and remedies.",
      "Carol hired Dave, a general contractor, to build a residential home. Their written agreement specified that the contract price was $200,000 and that Dave would complete the home by December 31, 2024. By October 2024, Dave realized that the project would cost him $250,000 due to unexpected complications. Dave seeks to be relieved of the contract. What are Dave's potential remedies? Discuss.",
      "Emma agreed to buy Frank's antique collection for $10,000. Their email exchange constituted their entire agreement. Before the sale was completed, Emma discovered a second email from Frank stating, 'All items are sold as-is, with no warranties.' Emma claims Frank promised the items were authentic. Can Emma enforce a warranty? Discuss the parol evidence rule and merchant rules."
    ],
    "Torts": [
      "Gary owned a small grocery store. He placed a wet floor sign in the produce section, but it fell over due to wind. Sarah, a customer, slipped on the wet floor and broke her arm. Gary carried liability insurance. Does Sarah have a viable negligence claim? Discuss the elements of negligence.",
      "Henry, a teenager, was riding his skateboard on a public sidewalk when he collided with Iris, an elderly woman. Iris suffered injuries. Henry's parents had previously warned him not to skateboard on sidewalks. Can Iris recover damages from Henry's parents? Discuss the theories of parental liability.",
      "Jack operated a construction site. He failed to properly secure a stack of lumber, which fell onto Karen's car when she parked nearby. Karen was not injured, but her car was damaged. Jack's insurance company refused to pay, claiming Karen was contributorily negligent for parking near a construction site. Is this a valid defense? Discuss."
    ],
    "Criminal Law": [
      "Leo was arrested for burglary after police found stolen items in his apartment. During questioning, Leo asked for a lawyer, but before his lawyer arrived, he made incriminating statements to police. The prosecution seeks to introduce these statements at trial. What constitutional issue does this raise? Discuss the rights to counsel and self-incrimination.",
      "Mike is charged with assault after pushing Nathan during a bar altercation. Mike claims he acted in self-defense because Nathan appeared to be reaching for a weapon. Evidence at trial shows Nathan was unarmed. Is Mike's self-defense claim viable? Discuss.",
      "Olivia shoplifted a $15 item from a department store. She was arrested and charged with theft. She claims poverty and states she took the item to feed her family. Can her financial hardship serve as a legal defense? Discuss the relevant law."
    ],
    "Property": [
      "Paul owns a home and grants his neighbor, Quinn, an easement to use a pathway across Paul's land to access Quinn's property. Later, Paul sells his home to Rachel. Quinn now claims Rachel must honor the easement. What type of easement is this, and can Rachel be bound by it? Discuss.",
      "Susan owns a rental property. She promises her tenant, Tom, that she will make repairs within 30 days. Tom vacates the property after 45 days without repairs. Can Tom recover damages for constructive eviction? Discuss.",
      "Ursula owns a vacation home in a gated community with restrictive covenants. The covenants require all homes to be painted white. Ursula paints her house blue. Other homeowners seek an injunction. What are Ursula's potential defenses? Discuss."
    ]
  };

  const subjectQuestions = mockQuestions[subject] || mockQuestions["Contracts"];
  const questions: Question[] = [];

  for (let i = 0; i < Math.min(count, subjectQuestions.length); i++) {
    questions.push({
      id: `mock_${Date.now()}_${i}`,
      text: subjectQuestions[i],
      type: QuestionType.ESSAY,
      options: [],
    });
  }

  return questions;
};