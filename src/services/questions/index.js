const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const uniqid = require("uniqid");
const { getQuestions, err } = require("../../fsUtilities");

const validateReq = [];

router.get("/", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

router.post("/", validateReq, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
  } catch (error) {}
});

module.exports = router;
