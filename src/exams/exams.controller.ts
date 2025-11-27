import { Controller } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { GrpcMethod } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';

@Controller()
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @GrpcMethod('ExamService', 'SeedExams')
  async seedExams(data: {}, metadata: any) {
    return this.examsService.seedExams();
  }

  @GrpcMethod('ExamService', 'CreateExam')
  async createExam(data: {
    title: string;
    description?: string;
    courseId: string;
    duration: number;
    totalMarks: number;
    passingMarks: number;
    startTime: string;
    endTime: string;
    questions: any[];
  }, metadata: any) {
    return this.examsService.createExam({
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime)
    });
  }

  @GrpcMethod('ExamService', 'GetExam')
  async getExam(data: { examId: string }, metadata: any) {
    return this.examsService.getExam(data.examId);
  }

  // Get course exams
  @GrpcMethod('ExamService', 'GetCourseExams')
  async getCourseExams(data: { courseId: string }, metadata: any) {
    return this.examsService.getCourseExams(data.courseId);
  }

  // Start exam session
  @GrpcMethod('ExamService', 'StartExamSession')
  async startExamSession(data: {
    examId: string;
    studentId: string;
    ipAddress?: string;
    userAgent?: string;
  }, metadata: Metadata) {
    const metadataObj = metadata.getMap();
    return this.examsService.startExamSession(data.examId, data.studentId, {
      ipAddress: metadataObj.ipaddress?.toString(),
      userAgent: metadataObj.useragent?.toString()
    });
  }

  // Get student's exam session
  @GrpcMethod('ExamService', 'GetStudentExamSession')
  async getStudentExamSession(data: {
    examId: string;
    studentId: string;
  }, metadata: any) {
    return this.examsService.getStudentExamSession(data.examId, data.studentId);
  }

  // Submit all answers at once (bulk submission)
  @GrpcMethod('ExamService', 'SubmitExam')
  async submitExam(data: {
    sessionId: string;
    studentId: string;
    answers: Array<{
      questionId: string;
      selectedOptions?: string[];
      textAnswer?: string;
      structuredAnswer?: string; // JSON string
    }>;
  }, metadata: any) {
    // Parse structuredAnswer from JSON string if present
    const parsedAnswers = data.answers.map(answer => ({
      ...answer,
      structuredAnswer: answer.structuredAnswer ? JSON.parse(answer.structuredAnswer) : undefined
    }));

    return this.examsService.submitAnswers(
      data.sessionId,
      data.studentId,
      parsedAnswers
    );
  }

  // Get student's all exam sessions
  @GrpcMethod('ExamService', 'GetStudentSessions')
  async getStudentSessions(data: { studentId: string }, metadata: any) {
    return this.examsService.getStudentSessions(data.studentId);
  }

  // Get exam submissions (instructor)
  @GrpcMethod('ExamService', 'GetExamSubmissions')
  async getExamSubmissions(data: { examId: string }, metadata: any) {
    return this.examsService.getExamSubmissions(data.examId);
  }

  // Manual grading
  @GrpcMethod('ExamService', 'GradeAnswer')
  async gradeAnswer(data: {
    answerId: string;
    instructorId: string;
    isCorrect?: boolean;
    marksAwarded: number;
    feedback?: string;
  }, metadata: any) {
    return this.examsService.gradeAnswer(data.answerId, data.instructorId, {
      isCorrect: data.isCorrect,
      marksAwarded: data.marksAwarded,
      feedback: data.feedback
    });
  }
}

