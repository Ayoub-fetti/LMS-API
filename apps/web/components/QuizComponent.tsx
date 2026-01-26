'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Quiz, Question, QuizSubmission } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface QuizComponentProps {
  quizId: string;
}

export default function QuizComponent({ quizId }: QuizComponentProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [showResults, setShowResults] = useState(false);

  /**
   * Fetch quiz details
   * Runs on component mount and when quizId changes
   */
  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const quizData = await api.getQuiz(quizId);
        setQuiz(quizData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  /**
   * Handle selecting an answer
   */
  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex,
    });
  };

  /**
   * Navigate to next question
   */
  const handleNextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  /**
   * Navigate to previous question
   */
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  /**
   * Submit quiz answers
   */
  const handleSubmit = async () => {
    if (!quiz) return;

    setIsSubmitting(true);
    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      }));

      const result = await api.submitQuiz(quizId, formattedAnswers);
      setSubmission(result);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle retry quiz
   */
  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setSubmission(null);
    setShowResults(false);
    setError('');
  };

  /**
   * Handle returning to module
   */
  const handleReturn = () => {
    if (quiz?.moduleId) {
      router.push(`/modules/${quiz.moduleId}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error && !quiz) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  // Results view
  if (showResults && submission) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 ${
          submission.passed ? 'border-green-500 border-2' : 'border-red-500 border-2'
        }`}>
          <div className="text-center">
            <h1 className={`text-3xl font-bold mb-2 ${
              submission.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {submission.passed ? 'Congratulations!' : 'Keep Trying!'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {submission.passed
                ? 'You have passed the quiz!'
                : 'You did not pass this time, but you can try again.'}
            </p>
            
            {/* Score Display */}
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {submission.score}%
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Passing score: {quiz.passingScore}%
            </p>
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Review Your Answers
          </h2>
          
          {quiz.questions.map((question, index) => {
            const userAnswer = submission.answers.find(
              (a) => a.questionId === question._id
            );
            const isCorrect = userAnswer?.isCorrect;

            return (
              <div key={question._id} className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0 last:mb-0 last:pb-0">
                <p className="font-medium text-gray-900 dark:text-white mb-3">
                  {index + 1}. {question.text}
                </p>
                
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    let optionClass = 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600';
                    
                    if (optIndex === question.correctAnswer) {
                      optionClass = 'bg-green-50 dark:bg-green-900/30 border-green-500 border-2';
                    } else if (optIndex === userAnswer?.selectedAnswer && !isCorrect) {
                      optionClass = 'bg-red-50 dark:bg-red-900/30 border-red-500 border-2';
                    }

                    return (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border ${optionClass}`}
                      >
                        <span className="text-gray-900 dark:text-white">{option}</span>
                        {optIndex === question.correctAnswer && (
                          <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                            (Correct Answer)
                          </span>
                        )}
                        {optIndex === userAnswer?.selectedAnswer && !isCorrect && (
                          <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                            (Your Answer)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleReturn}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Return to Module
          </button>
          
          {!submission.passed && (
            <button
              onClick={handleRetry}
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quiz Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {quiz.title}
        </h1>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span>
            Passing score: {quiz.passingScore}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
          {question.text}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(question._id, index)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                answers[question._id] === index
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  answers[question._id] === index
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {answers[question._id] === index && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-900 dark:text-white">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

