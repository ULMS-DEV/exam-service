import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, QuestionType, ExamSessionStatus } from "@prisma/client";

@Injectable()
export class ExamsDAO {
    constructor(private readonly prisma: PrismaService) {}

    async seed() {
        const courseId = "384a3fe5-8d6c-4f51-a278-8271d982e01c";
        
        // Create Midterm Exam
        const midtermExam = await this.prisma.exam.create({
            data: {
                title: "CS101 Midterm Exam - Algorithms & Data Structures",
                description: "Comprehensive midterm covering Foundations of Algorithms and Introduction to Data Structures",
                courseId: courseId,
                duration: 90, // 90 minutes
                totalMarks: 100,
                passingMarks: 60,
                startTime: new Date("2025-02-15T09:00:00Z"),
                endTime: new Date("2025-02-15T23:59:00Z"),
                questions: {
                    create: [
                        // Multiple Choice Questions
                        {
                            type: QuestionType.MULTIPLE_CHOICE,
                            text: "What is the time complexity of Binary Search in the worst case?",
                            marks: 5,
                            options: [
                                { id: "a", text: "O(n)" },
                                { id: "b", text: "O(log n)" },
                                { id: "c", text: "O(n²)" },
                                { id: "d", text: "O(1)" }
                            ],
                            correctOptions: ["b"],
                            explanation: "Binary Search divides the search space in half with each iteration, resulting in logarithmic time complexity O(log n).",
                            caseSensitive: false,
                            partialCredit: false
                        },
                        {
                            type: QuestionType.MULTIPLE_CHOICE,
                            text: "Which data structure follows the LIFO (Last In First Out) principle?",
                            marks: 5,
                            options: [
                                { id: "a", text: "Queue" },
                                { id: "b", text: "Stack" },
                                { id: "c", text: "Array" },
                                { id: "d", text: "Linked List" }
                            ],
                            correctOptions: ["b"],
                            explanation: "A Stack follows LIFO principle where the last element added is the first one to be removed.",
                            caseSensitive: false,
                            partialCredit: false
                        },
                        {
                            type: QuestionType.MULTIPLE_CHOICE,
                            text: "What is the main advantage of a Linked List over an Array?",
                            marks: 5,
                            options: [
                                { id: "a", text: "Faster access to elements" },
                                { id: "b", text: "Better memory utilization" },
                                { id: "c", text: "Dynamic size and efficient insertion/deletion" },
                                { id: "d", text: "Cache-friendly" }
                            ],
                            correctOptions: ["c"],
                            explanation: "Linked Lists allow dynamic sizing and efficient O(1) insertion/deletion at known positions without shifting elements.",
                            caseSensitive: false,
                            partialCredit: false
                        },
                        
                        // Multi-Select Questions
                        {
                            type: QuestionType.MULTI_SELECT,
                            text: "Which of the following are key characteristics of an algorithm? (Select all that apply)",
                            marks: 10,
                            options: [
                                { id: "a", text: "Correctness" },
                                { id: "b", text: "Randomness" },
                                { id: "c", text: "Definiteness" },
                                { id: "d", text: "Finiteness" },
                                { id: "e", text: "Ambiguity" }
                            ],
                            correctOptions: ["a", "c", "d"],
                            explanation: "Algorithms must be correct, definite (unambiguous), and finite (must terminate). Randomness and ambiguity are not required characteristics.",
                            caseSensitive: false,
                            partialCredit: true
                        },
                        {
                            type: QuestionType.MULTI_SELECT,
                            text: "Which sorting algorithms have an average time complexity of O(n log n)? (Select all that apply)",
                            marks: 10,
                            options: [
                                { id: "a", text: "Bubble Sort" },
                                { id: "b", text: "Merge Sort" },
                                { id: "c", text: "Quick Sort" },
                                { id: "d", text: "Selection Sort" },
                                { id: "e", text: "Heap Sort" }
                            ],
                            correctOptions: ["b", "c", "e"],
                            explanation: "Merge Sort, Quick Sort (average case), and Heap Sort all have O(n log n) time complexity. Bubble Sort and Selection Sort are O(n²).",
                            caseSensitive: false,
                            partialCredit: true
                        },
                        
                        // True/False Questions
                        {
                            type: QuestionType.TRUE_FALSE,
                            text: "Hash tables provide O(1) average time complexity for search operations.",
                            marks: 5,
                            options: [
                                { id: "true", text: "True" },
                                { id: "false", text: "False" }
                            ],
                            correctOptions: ["true"],
                            explanation: "Hash tables provide constant time O(1) average case lookup due to direct addressing via hash function.",
                            caseSensitive: false,
                            partialCredit: false
                        },
                        {
                            type: QuestionType.TRUE_FALSE,
                            text: "Arrays have better insertion performance than Linked Lists at arbitrary positions.",
                            marks: 5,
                            options: [
                                { id: "true", text: "True" },
                                { id: "false", text: "False" }
                            ],
                            correctOptions: ["false"],
                            explanation: "Arrays require O(n) time for insertion at arbitrary positions due to shifting elements, while Linked Lists can insert in O(1) if we have a reference to the position.",
                            caseSensitive: false,
                            partialCredit: false
                        },
                        
                        // Fill in the Blank
                        {
                            type: QuestionType.FILL_IN_BLANK,
                            text: "The notation used to describe the upper bound of an algorithm's time complexity is called _____ notation.",
                            marks: 5,
                            correctAnswer: { acceptedAnswers: ["Big O", "Big-O", "O"] },
                            explanation: "Big O notation is used to describe the worst-case or upper bound time complexity of algorithms.",
                            caseSensitive: false,
                            partialCredit: false
                        },
                        {
                            type: QuestionType.FILL_IN_BLANK,
                            text: "A Queue follows the _____ principle.",
                            marks: 5,
                            correctAnswer: { acceptedAnswers: ["FIFO", "First In First Out", "First-In-First-Out"] },
                            explanation: "Queue follows First In First Out (FIFO) principle where the first element added is the first to be removed.",
                            caseSensitive: false,
                            partialCredit: false
                        },
                        
                        // Matching Question
                        {
                            type: QuestionType.MATCHING,
                            text: "Match each data structure with its primary use case:",
                            marks: 10,
                            options: {
                                left: [
                                    { id: "1", text: "Stack" },
                                    { id: "2", text: "Queue" },
                                    { id: "3", text: "Hash Table" },
                                    { id: "4", text: "Binary Tree" }
                                ],
                                right: [
                                    { id: "a", text: "Fast key-value lookups" },
                                    { id: "b", text: "Function call management" },
                                    { id: "c", text: "Task scheduling" },
                                    { id: "d", text: "Hierarchical data representation" }
                                ]
                            },
                            correctAnswer: {
                                matches: [
                                    { left: "1", right: "b" },
                                    { left: "2", right: "c" },
                                    { left: "3", right: "a" },
                                    { left: "4", right: "d" }
                                ]
                            },
                            explanation: "Stack: function calls (LIFO), Queue: task scheduling (FIFO), Hash Table: fast lookups, Binary Tree: hierarchical data.",
                            caseSensitive: false,
                            partialCredit: true
                        },
                        
                        // Ordering Question
                        {
                            type: QuestionType.ORDERING,
                            text: "Arrange the following time complexities from most efficient to least efficient:",
                            marks: 10,
                            options: {
                                items: [
                                    { id: "1", text: "O(n²)" },
                                    { id: "2", text: "O(1)" },
                                    { id: "3", text: "O(n)" },
                                    { id: "4", text: "O(log n)" },
                                    { id: "5", text: "O(n log n)" }
                                ]
                            },
                            correctAnswer: {
                                order: ["2", "4", "3", "5", "1"]
                            },
                            explanation: "From most to least efficient: O(1) < O(log n) < O(n) < O(n log n) < O(n²)",
                            caseSensitive: false,
                            partialCredit: true
                        },
                        
                        // Short Answer
                        {
                            type: QuestionType.SHORT_ANSWER,
                            text: "Explain the difference between Bubble Sort and Merge Sort in terms of efficiency. (50-100 words)",
                            marks: 10,
                            explanation: "Bubble Sort has O(n²) time complexity in average and worst cases, making it inefficient for large datasets. Merge Sort has O(n log n) time complexity in all cases, making it much more efficient. Merge Sort uses divide-and-conquer strategy, while Bubble Sort repeatedly swaps adjacent elements.",
                            caseSensitive: false,
                            partialCredit: true
                        },
                        
                        // Essay Question
                        {
                            type: QuestionType.ESSAY,
                            text: "Discuss the trade-offs between different data structures (Arrays, Linked Lists, and Hash Tables) when choosing one for a real-world application. Consider factors such as access time, insertion/deletion efficiency, memory usage, and cache performance. Provide examples of scenarios where each would be the optimal choice. (200-300 words)",
                            marks: 15,
                            explanation: "A comprehensive answer should discuss: Arrays offer O(1) access but O(n) insertion/deletion; good for static data with frequent random access. Linked Lists provide O(1) insertion/deletion but O(n) access; ideal for frequent modifications. Hash Tables offer O(1) average lookup but higher memory overhead; perfect for key-value storage. Cache locality favors arrays. Examples should demonstrate understanding of trade-offs.",
                            caseSensitive: false,
                            partialCredit: true
                        }
                    ]
                }
            },
            include: {
                questions: true
            }
        });

        // Create Final Exam
        const finalExam = await this.prisma.exam.create({
            data: {
                title: "CS101 Final Exam - Comprehensive Assessment",
                description: "Final exam covering all course topics including algorithms, data structures, and problem-solving",
                courseId: courseId,
                duration: 120, // 120 minutes
                totalMarks: 150,
                passingMarks: 90,
                startTime: new Date("2025-03-20T09:00:00Z"),
                endTime: new Date("2025-03-20T23:59:00Z"),
                questions: {
                    create: [
                        {
                            type: QuestionType.MULTIPLE_CHOICE,
                            text: "Which of the following best describes algorithmic efficiency?",
                            marks: 5,
                            options: [
                                { id: "a", text: "The number of lines of code" },
                                { id: "b", text: "How well it uses time and memory resources" },
                                { id: "c", text: "The programming language used" },
                                { id: "d", text: "The developer's skill level" }
                            ],
                            correctOptions: ["b"],
                            explanation: "Efficiency refers to how well an algorithm uses computational resources, primarily time and memory.",
                            caseSensitive: false,
                            partialCredit: false
                        },
                        {
                            type: QuestionType.MULTI_SELECT,
                            text: "Which operations are typically O(1) in a well-implemented Hash Table? (Select all that apply)",
                            marks: 10,
                            options: [
                                { id: "a", text: "Insert" },
                                { id: "b", text: "Search" },
                                { id: "c", text: "Delete" },
                                { id: "d", text: "Sort" }
                            ],
                            correctOptions: ["a", "b", "c"],
                            explanation: "Hash tables provide O(1) average time for insert, search, and delete operations. Sorting is not a typical hash table operation.",
                            caseSensitive: false,
                            partialCredit: true
                        },
                        {
                            type: QuestionType.ESSAY,
                            text: "Design and explain an algorithm to solve a real-world problem of your choice. Include: problem description, algorithm steps, time/space complexity analysis, and potential optimizations. (300-400 words)",
                            marks: 25,
                            explanation: "Should include clear problem definition, step-by-step algorithm, complexity analysis using Big O notation, and discussion of optimization strategies.",
                            caseSensitive: false,
                            partialCredit: true
                        }
                    ]
                }
            }
        });

        return {
            message: "Exams seeded successfully",
            exams: [
                { id: midtermExam.id, title: midtermExam.title, questionCount: midtermExam.questions.length },
                { id: finalExam.id, title: finalExam.title }
            ]
        };
    }

    async createExam(data: Prisma.ExamCreateInput) {
        return this.prisma.exam.create({
            data,
            include: {
                questions: true
            }
        });
    }

    async getExamById(id: string) {
        return this.prisma.exam.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    }

    async getExamsByCourse(courseId: string) {
        return this.prisma.exam.findMany({
            where: { courseId },
            include: {
                _count: {
                    select: {
                        questions: true,
                        examSessions: true
                    }
                }
            },
            orderBy: { startTime: 'asc' }
        });
    }

    async createExamSession(data: Prisma.ExamSessionCreateInput) {
        return this.prisma.examSession.create({
            data,
            include: {
                exam: {
                    include: {
                        questions: true
                    }
                }
            }
        });
    }

    async getExamSession(examId: string, studentId: string, attemptNumber: number = 1) {
        return this.prisma.examSession.findUnique({
            where: {
                examId_studentId_attemptNumber: {
                    examId,
                    studentId,
                    attemptNumber
                }
            },
            include: {
                exam: {
                    include: {
                        questions: true
                    }
                },
                answers: {
                    include: {
                        question: true
                    }
                }
            }
        });
    }

    async updateExamSessionStatus(sessionId: string, status: ExamSessionStatus, additionalData?: Prisma.ExamSessionUpdateInput) {
        return this.prisma.examSession.update({
            where: { id: sessionId },
            data: {
                status,
                ...additionalData
            }
        });
    }

    async submitAnswer(examSessionId: string, questionId: string, answerData: {
        selectedOptions?: string[];
        textAnswer?: string;
        structuredAnswer?: any;
    }) {
        return this.prisma.answer.upsert({
            where: {
                examSessionId_questionId: {
                    examSessionId,
                    questionId
                }
            },
            create: {
                examSession: { connect: { id: examSessionId } },
                question: { connect: { id: questionId } },
                ...answerData
            },
            update: {
                selectedOptions: answerData.selectedOptions,
                textAnswer: answerData.textAnswer,
                structuredAnswer: answerData.structuredAnswer,
                updatedAt: new Date()
            },
            include: {
                question: true
            }
        });
    }

    async gradeAnswer(answerId: string, isCorrect: boolean, marksAwarded: number) {
        return this.prisma.answer.update({
            where: { id: answerId },
            data: {
                isCorrect,
                marksAwarded,
                gradedAt: new Date()
            }
        });
    }

    async calculateSessionScore(sessionId: string) {
        const session = await this.prisma.examSession.findUnique({
            where: { id: sessionId },
            include: {
                exam: true,
                answers: {
                    include: {
                        question: true
                    }
                }
            }
        });

        if (!session) return null;

        const totalScore = session.answers.reduce((sum, answer) => sum + answer.marksAwarded, 0);
        const percentage = (totalScore / session.exam.totalMarks) * 100;
        const isPassed = totalScore >= session.exam.passingMarks;
        const isGraded = session.answers.every(answer => answer.isCorrect !== null);

        return this.prisma.examSession.update({
            where: { id: sessionId },
            data: {
                totalScore,
                percentage,
                isPassed,
                isGraded
            }
        });
    }

    async getStudentExamSessions(studentId: string) {
        return this.prisma.examSession.findMany({
            where: { studentId },
            include: {
                exam: true,
                _count: {
                    select: {
                        answers: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getExamSessions(examId: string) {
        return this.prisma.examSession.findMany({
            where: { examId },
            include: {
                answers: {
                    include: {
                        question: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}