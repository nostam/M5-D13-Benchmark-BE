const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const uniqid = require("uniqid");
const _ = require("lodash");
const {
  getQuestions,
  getExams,
  writeExams,
  err,
} = require("../../fsUtilities");

const validateAns = [
  body("question").notEmpty().isInt(),
  body("answer").exists(),
];

router.get("/:id", async (req, res, next) => {
  try {
    const exams = await getExams();
    const exam = exams.find((exam) => exam._id === req.params.id);
    if (!exam && exam.isCompleted)
      return next(err("Error: exam record not found", 404));
    res.status(200).send(exam);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/answer", validateAns, async (req, res, next) => {
  try {
    const receivedTime = new Date();
    const buffer = 200000;

    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());

    const exams = await getExams();
    const exam = exams.find((exam) => exam._id === req.params.id);
    if (!exam) return next(err("Error: exam record not found", 404));

    const timeDiff = (receivedTime - exam.examDate + buffer) / 1000;
    if (exam.isCompleted || timeDiff > exam.totalDuration)
      return next(err("Error: exam period has ended", 400));

    let score = 0;
    const ans = req.body;
    if (!isNaN(exam.questions[ans.question].isSelected))
      return next(err("Error: Answer is submitted already", 400));

    exam.questions[ans.question].isSelected = ans.answer;
    exam.questions[ans.question].answers[ans.answer].isCorrect ? score++ : "";

    const notComplete = exam.questions
      .map((question) => question.isSelected)
      .includes(undefined);
    console.log("exam completed", !notComplete);

    const updatedExams = exams.map((entry) =>
      entry._id === req.params.id
        ? { ...entry, ...exam, totalScore: score, isCompleted: !notComplete }
        : entry
    );
    await writeExams(updatedExams);
    res.status(201).send("ok");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/start", async (req, res, next) => {
  try {
    const questionsDB = await getQuestions();
    if (!questionsDB) return next(err("Error: Questions database"));

    const randomQuestions = [];
    for (let i = 0; i < 5; i++) {
      const luckyNbr = _.random(questionsDB.length);
      //   const luckyNbr = Math.floor(Math.random() * questionsDB.length);
      randomQuestions.push(questionsDB[luckyNbr]);
      questionsDB.splice(luckyNbr, 1);
    }
    if (randomQuestions.length === 0)
      return next(err("Error: selected questions"));

    const examData = {
      _id: uniqid(),
      candidateName: req.body.name,
      examDate: new Date(),
      isCompleted: false,
      totalDuration: randomQuestions
        .map((question) => question.duration)
        .reduce((acc, cv) => acc + cv),
      questions: randomQuestions,
    };
    const examsData = await getExams();
    examsData.push(examData);
    await writeExams(examsData);
    examData.questions.map((question) =>
      question.answers.map((ans) => delete ans.isCorrect)
    );
    return res.send(examData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
