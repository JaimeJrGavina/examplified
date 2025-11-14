
import { Exam, QuestionType } from './types';

export const MOCK_EXAMS: Exam[] = [
    {
        id: 'ex_bar_001',
        title: 'Bar Exam: Torts',
        subject: 'Torts',
        durationMinutes: 60,
        description: 'Essay examination covering negligence, liability, and intentional torts.',
        questions: [
            {
                id: 'tort_q1',
                type: QuestionType.ESSAY,
                text: "Alice was driving her car down Main Street when she received a text message. She looked down to read it and did not see Bob crossing the street in a designated crosswalk. Alice struck Bob, causing him severe injuries. Bob was taken to the hospital where he was treated by Dr. Smith. Dr. Smith negligently administered the wrong medication, worsening Bob's condition. \n\nDiscuss the potential liability of Alice and Dr. Smith, including any defenses they might raise.",
                modelAnswer: "1. Alice's Liability to Bob: To establish negligence, Bob must prove duty, breach, causation, and damages. A driver has a duty to operate their vehicle with reasonable care. Alice breached this duty by looking at her phone (distracted driving). This breach was the actual and proximate cause of Bob's injuries. While Dr. Smith's negligence intervened, medical malpractice is generally considered a foreseeable intervening cause, so Alice remains liable for the initial injuries and the aggravation.\n\n2. Dr. Smith's Liability: Dr. Smith owes a duty of care consistent with the standard of a competent physician. Administering the wrong medication is a breach of that standard. Dr. Smith is liable for the aggravation of Bob's injuries.\n\nConclusion: Alice is liable for all injuries (joint and several liability rules may apply depending on jurisdiction), and Dr. Smith is liable for the worsened condition."
            },
            {
                id: 'tort_q2',
                type: QuestionType.ESSAY,
                text: "Neighbor A built a shed that encroached 2 feet onto Neighbor B's property. Neighbor B did not notice for 15 years. When Neighbor B finally surveyed the land and discovered the encroachment, he sued for trespass. Neighbor A claimed adverse possession.\n\nWho should prevail?",
                modelAnswer: "Neighbor A should prevail if the elements of adverse possession are met. \n\nAnalysis:\n1. Open and Notorious: The shed was visible.\n2. Continuous: It was there for 15 years.\n3. Exclusive: A used it alone.\n4. Actual: The shed physically occupied the land.\n5. Hostile/Adverse: It was without B's permission.\n\nAssuming the statutory period is 15 years or less, A has acquired title to the strip of land."
            }
        ]
    },
    {
        id: 'ex_bar_002',
        title: 'Bar Exam: Contracts',
        subject: 'Contracts',
        durationMinutes: 60,
        description: 'Analysis of formation, performance, breach, and remedies.',
    },
    {
        id: 'ex_bar_003',
        title: 'Multistate Performance Test (MPT)',
        subject: 'Legal Analysis',
        durationMinutes: 90,
        description: 'Simulation of a realistic legal task using a "File" and a "Library".',
    }
];
