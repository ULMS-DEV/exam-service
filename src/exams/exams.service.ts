import { Inject, Injectable, OnModuleInit} from '@nestjs/common';
import { ExamsDAO } from './dao/exams.dao';
import { ExamSessionStatus, QuestionType } from '@prisma/client';
import { GrpcInvalidArgumentException, GrpcNotFoundException, GrpcPermissionDeniedException } from 'nestjs-grpc-exceptions';
import { convertDates } from '../common/util/googleTimestamp.util';
import type { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class ExamsService implements OnModuleInit {
    private coursesService;
    constructor(
        private readonly examsDAO: ExamsDAO,
        @Inject('COURSE_GRPC') private readonly client: ClientGrpc,
    ) {}

    async onModuleInit(){
      if (!this.client) {
        throw new Error('COURSE_GRPC client is not injected');
      }
      this.coursesService = this.client.getService('CourseService');
    }

    async seedExams() {
        const result = await this.examsDAO.seed();
        if (result.exams) {
            result.exams = result.exams.map((exam: any) => ({
                ...exam,
                questions: exam.questions?.map((q: any) => ({
                    ...q,
                    options: q.options ? JSON.stringify(q.options) : null,
                    correctAnswer: q.correctAnswer ? JSON.stringify(q.correctAnswer) : null
                }))
            }));
        }
        return convertDates(result);
    }

    async createExam(data: {
        title: string;
        description?: string;
        courseId: string;
        duration: number;
        totalMarks: number;
        passingMarks: number;
        startTime: Date;
        endTime: Date;
        questions: any[];
    }) {
        if (data.startTime >= data.endTime) {
            throw new GrpcInvalidArgumentException('Start time must be before end time');
        }

        if (data.passingMarks > data.totalMarks) {
            throw new GrpcInvalidArgumentException('Passing marks cannot exceed total marks');
        }

        return convertDates(this.examsDAO.createExam({
            title: data.title,
            description: data.description,
            duration: data.duration,
            totalMarks: data.totalMarks,
            passingMarks: data.passingMarks,
            startTime: data.startTime,
            endTime: data.endTime,
            courseId: data.courseId,
            questions: data.questions ? {
                create: data.questions
            } : undefined
        }));
    }

    async getExam(examId: string) {
        const exam = await this.examsDAO.getExamById(examId);
        if (!exam) {
            throw new GrpcNotFoundException('Exam not found');
        }
        const parsedExams = exam.questions.map((q: any) => {
            return {
                ...q,
                options: q.options ? JSON.stringify(q.options) : null,
                correctAnswer: q.correctAnswer ? JSON.stringify(q.correctAnswer) : null
            };
        });
        exam.questions = parsedExams;
        return convertDates(exam);
    }

    async getCourseExams(courseId: string) {
        const exams = await this.examsDAO.getExamsByCourse(courseId);
        const parsedExams = exams.map((exam: any) => ({
            ...exam,
            questionCount: exam._count?.questions,
            sessionCount: exam._count?.examSessions
        }));
        return {exams: convertDates(parsedExams)};
    }

    async startExamSession(examId: string, studentId: string, metadata?: {
        ipAddress?: string;
        userAgent?: string;
    }) {
        const exam = await this.examsDAO.getExamById(examId);
        if (!exam) {
            throw new GrpcNotFoundException('Exam not found');
        }

        const now = new Date();
        if (now < exam.startTime) {
            throw new GrpcPermissionDeniedException('Exam has not started yet');
        }
        if (now > exam.endTime) {
            throw new GrpcPermissionDeniedException('Exam has ended');
        }

        const existingSession = await this.examsDAO.getExamSession(examId, studentId, 1);
        if (existingSession) {
            if (existingSession.status === ExamSessionStatus.COMPLETED) {
                throw new GrpcPermissionDeniedException('You have already completed this exam');
            }
            if (existingSession.status === ExamSessionStatus.IN_PROGRESS) {
                // Return existing in-progress session
                const { answers, ...sessionWithoutAnswers } = existingSession;
        
                if (sessionWithoutAnswers.exam?.questions) {
                    sessionWithoutAnswers.exam.questions = sessionWithoutAnswers.exam.questions.map(q => {
                        const { correctOptions, correctAnswer, explanation, ...questionWithoutAnswers } = q;
                        return {
                            ...questionWithoutAnswers,
                            explanation: null,
                            correctOptions: [],
                            correctAnswer: null,
                            options: q.options ? JSON.stringify(q.options) : null
                        };
                    });
                }
                return convertDates(sessionWithoutAnswers);
            }
        }

        const actualStartTime = new Date();
        const scheduledEndTime = new Date(actualStartTime.getTime() + exam.duration * 60000);

        const session = await this.examsDAO.createExamSession({
            exam: { connect: { id: examId } },
            studentId: studentId,
            status: ExamSessionStatus.IN_PROGRESS,
            scheduledStartTime: exam.startTime,
            scheduledEndTime: scheduledEndTime,
            actualStartTime,
            lastActivityAt: actualStartTime,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent
        });

        if (session.exam?.questions) {
            session.exam.questions = session.exam.questions.map((q: any) => ({
                ...q,
                options: q.options ? JSON.stringify(q.options) : null,
                correctAnswer: q.correctAnswer ? JSON.stringify(q.correctAnswer) : null
            }));
        }


        return convertDates(session);
    }

    async getStudentExamSession(examId: string, studentId: string) {
        const session = await this.examsDAO.getExamSession(examId, studentId, 1);
        if (!session) {
            throw new GrpcNotFoundException('Exam session not found');
        }
        
        const { answers, ...sessionWithoutAnswers } = session;
        
        if (sessionWithoutAnswers.exam?.questions) {
            sessionWithoutAnswers.exam.questions = sessionWithoutAnswers.exam.questions.map(q => {
                const { correctOptions, correctAnswer, explanation, ...questionWithoutAnswers } = q;
                return {
                    ...questionWithoutAnswers,
                    explanation: null,
                    correctOptions: [],
                    correctAnswer: null,
                    options: q.options ? JSON.stringify(q.options) : null
                };
            });
        }

        if(sessionWithoutAnswers.status === ExamSessionStatus.COMPLETED && !sessionWithoutAnswers.isGraded ) {
            sessionWithoutAnswers.totalScore = null;
            sessionWithoutAnswers.percentage = null;
            sessionWithoutAnswers.isPassed = null;
        }
        
        return convertDates(sessionWithoutAnswers);
    }

    async submitAnswers(examSessionId: string, studentId: string, answers: Array<{
        questionId: string;
        selectedOptions?: string[];
        textAnswer?: string;
        structuredAnswer?: any;
    }>) {
        const session = await this.prisma.examSession.findUnique({
            where: { id: examSessionId },
            include: {
                exam: {
                    include: {
                        questions: true
                    }
                }
            }
        });

        if (!session) {
            throw new GrpcNotFoundException('Exam session not found');
        }

        if (session.studentId !== studentId) {
            throw new GrpcPermissionDeniedException('This session does not belong to you');
        }

        if (session.status !== ExamSessionStatus.IN_PROGRESS) {
            throw new GrpcPermissionDeniedException('This exam session is not in progress');
        }

        if (session.scheduledEndTime && new Date() > session.scheduledEndTime) {
            await this.examsDAO.updateExamSessionStatus(examSessionId, ExamSessionStatus.EXPIRED);
            throw new GrpcPermissionDeniedException('Time limit exceeded');
        }

        const examQuestionIds = new Set(session.exam.questions.map(q => q.id));
        for (const answer of answers) {
            if (!examQuestionIds.has(answer.questionId)) {
                throw new GrpcInvalidArgumentException(`Question ${answer.questionId} not found in this exam`);
            }
        }

        for (const answerData of answers) {
            const question = session.exam.questions.find(q => q.id === answerData.questionId);
            
            const submittedAnswer = await this.examsDAO.submitAnswer(examSessionId, answerData.questionId, {
                selectedOptions: answerData.selectedOptions,
                textAnswer: answerData.textAnswer,
                structuredAnswer: answerData.structuredAnswer
            });

            const gradeResult = this.autoGradeAnswer(question, answerData);
            if (gradeResult !== null) {
                await this.examsDAO.gradeAnswer(submittedAnswer.id, gradeResult.isCorrect, gradeResult.marks);
            }
        }

        await this.examsDAO.updateExamSessionStatus(examSessionId, ExamSessionStatus.COMPLETED, {
            actualEndTime: new Date()
        });

        await this.examsDAO.calculateSessionScore(examSessionId);

        return convertDates({
            success: true,
            message: 'Exam submitted successfully',
            sessionId: examSessionId,
            submittedAt: new Date()
        });
    }

    private autoGradeAnswer(question: any, answerData: any): { isCorrect: boolean; marks: number } | null {
        switch (question.type) {
            case QuestionType.MULTIPLE_CHOICE:
            case QuestionType.TRUE_FALSE:
                const isCorrect = answerData.selectedOptions?.length === 1 &&
                    question.correctOptions.includes(answerData.selectedOptions[0]);
                return { isCorrect, marks: isCorrect ? question.marks : 0 };

            case QuestionType.MULTI_SELECT:
                if (!answerData.selectedOptions) return null;
                const correctSet = new Set(question.correctOptions);
                const answerSet = new Set(answerData.selectedOptions);
                
                if (correctSet.size !== answerSet.size) {
                    if (question.partialCredit) {
                        const correctAnswers = answerData.selectedOptions.filter(opt => correctSet.has(opt)).length;
                        const incorrectAnswers = answerData.selectedOptions.filter(opt => !correctSet.has(opt)).length;
                        const marks = Math.max(0, (correctAnswers - incorrectAnswers) / correctSet.size * question.marks);
                        return { isCorrect: false, marks };
                    }
                    return { isCorrect: false, marks: 0 };
                }

                const allCorrect = Array.from(correctSet).every(opt => answerSet.has(opt));
                return { isCorrect: allCorrect, marks: allCorrect ? question.marks : 0 };

            case QuestionType.FILL_IN_BLANK:
                if (!answerData.textAnswer) return null;
                const acceptedAnswers = question.correctAnswer?.acceptedAnswers || [];
                const studentAnswer = question.caseSensitive ? 
                    answerData.textAnswer.trim() : 
                    answerData.textAnswer.trim().toLowerCase();
                
                const correct = acceptedAnswers.some(accepted => {
                    const acceptedValue = question.caseSensitive ? accepted : accepted.toLowerCase();
                    return studentAnswer === acceptedValue;
                });
                
                return { isCorrect: correct, marks: correct ? question.marks : 0 };

            case QuestionType.MATCHING:
            case QuestionType.ORDERING:
                // These require structured answers - implement custom logic
                if (!answerData.structuredAnswer) return null;
                // Implement matching/ordering validation logic here
                return null; // Requires manual grading for now

            case QuestionType.SHORT_ANSWER:
            case QuestionType.ESSAY:
                // Requires manual grading
                return null;

            default:
                return null;
        }
    }

    async getStudentSessions(studentId: string) {
        const sessions = await this.examsDAO.getStudentExamSessions(studentId);
        
        const mappedSessions = sessions.map(session => {
            const mapped: any = {
                id: session.id,
                examId: session.examId,
                status: session.status,
                scheduledStartTime: session.scheduledStartTime,
                scheduledEndTime: session.scheduledEndTime,
                actualStartTime: session.actualStartTime,
                actualEndTime: session.actualEndTime,
                attemptNumber: session.attemptNumber,
                ...(session.isGraded && session.status === ExamSessionStatus.COMPLETED ? {
                    totalScore: session.totalScore,
                    percentage: session.percentage,
                    isPassed: session.isPassed
                } : {}),
                exam: session.exam,
                _count: session._count
            };

            return mapped;
        });

        return {sessions: convertDates(mappedSessions)};
    }

    private async getStudentCourses(studentId: string) {
        if (!this.coursesService) {
            throw new Error('coursesService is not initialized. onModuleInit may not have been called.');
        }
        return this.coursesService.getOffersForStudent({ studentId }).toPromise();
    }

    async getStudentExams(studentId: string) {
        const studentCourses = await this.getStudentCourses(studentId);
        const courseIds = studentCourses.offers.map(offer => offer.courseId);

        const exams = await this.examsDAO.getExamsByCourses(courseIds);
        
        const parsedExams = exams.map((exam: any) => ({
            ...exam,
            questionCount: exam._count?.questions,
            sessionCount: exam._count?.examSessions
        }));
        return {exams: convertDates(parsedExams)};
    }

    /********************************************************************************************** */
    //TODO: fix exam submissions serialization
    async getExamSubmissions(examId: string) {
        const submissions = await this.examsDAO.getExamSessions(examId);
        const parsedSubmissions = submissions.map((session: any) => {
            if (session.exam?.questions) {
                session.exam.questions = session.exam.questions.map((q: any) => ({
                    ...q,
                    options: q.options ? JSON.stringify(q.options) : null,
                    correctAnswer: q.correctAnswer ? JSON.stringify(q.correctAnswer) : null
                }));
            }
            if (session.answers) {
                session.answers = session.answers.map((a: any) => ({
                    ...a,
                    structuredAnswer: a.structuredAnswer ? JSON.stringify(a.structuredAnswer) : null
                }));
            }
            return session;
        });
        return {submissions: convertDates(parsedSubmissions)};
    }

    //TODO: test manual grading
    async gradeAnswer(answerId: string, instructorId: string, data: {
        isCorrect?: boolean;
        marksAwarded: number;
        feedback?: string;
    }) {
        const answer = await this.prisma.answer.update({
            where: { id: answerId },
            data: {
                isCorrect: data.isCorrect,
                marksAwarded: data.marksAwarded,
                feedback: data.feedback,
                gradedBy: instructorId,
                gradedAt: new Date()
            },
            include: {
                examSession: true,
                question: true
            }
        });

        await this.examsDAO.calculateSessionScore(answer.examSessionId);

        if (answer.structuredAnswer) {
            (answer as any).structuredAnswer = JSON.stringify(answer.structuredAnswer);
        }
        if ((answer as any).question?.options) {
            (answer as any).question.options = JSON.stringify((answer as any).question.options);
        }
        if ((answer as any).question?.correctAnswer) {
            (answer as any).question.correctAnswer = JSON.stringify((answer as any).question.correctAnswer);
        }

        return convertDates(answer);
    }
    /********************************************************************************************** */

    private get prisma() {
        return this.examsDAO['prisma'];
    }
}
