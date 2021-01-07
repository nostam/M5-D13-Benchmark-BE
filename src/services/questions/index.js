const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const uniqid = require("uniqid");
const { getQuestions, err, writeQuestions } = require("../../fsUtilities");

const validateReq = [
  body("duration").isInt().notEmpty(),
  body("text").isString().notEmpty(),
  body("answers").isArray().notEmpty(),
  body("answers.*.text").notEmpty().isString(),
  body("answers.*.isCorrect").notEmpty().isBoolean(),
];

router.get("/", async (req, res, next) => {
  try {
    const questions = await getQuestions();
    if (!questions) err("Error: questions DB error");
    res.send(questions);
  } catch (error) {
    next(error);
  }
});

router.post("/", validateReq, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const questions = await getQuestions();
    if (!questions) err("Error: questions DB error");
    questions.push(req.body);
    await writeQuestions(questions);
    res.status(201).send();
  } catch (error) {}
});

router.put("/:id", validateReq, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const questions = await getQuestions();
    if (!questions) err("Error: questions DB error");
    questions.map((question) =>
      question._id === req.params.id ? { ...question, ...req.body } : question
    );
    await writeQuestions(questions);
    res.status(201).send();
  } catch (error) {}
});

router.delete("/:id", async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const questions = await getQuestions();
    if (!questions) err("Error: questions DB error");
    const updatedDB = questions.filter(
      (question) => question._id !== req.params.id
    );
    await writeQuestions(updatedDB);
    res.status(201).send();
  } catch (error) {}
});

module.exports = router;
