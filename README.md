# Exams Backend

- POST /exams/start
  Generate 5 random questions from questions.json
  {\_id: id,
  duration: 60,
  text: "Questions Here",
  answers: {text: "Answer Text", isCorrect: boolean}
  }
- POST /exams/{id}/answer
  Submit answers
  Body: {question: 0, answer: 0}
- GET /exams/{id}
  Returns the information about the exam, including the current score.
