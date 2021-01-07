const { readJson, writeJson } = require("fs-extra");
const { join } = require("path");
const express = require("express");
const questionsPath = join(__dirname, "./services/questions/questions.json");
const examsPath = join(__dirname, "./services/exams/exams.json");

const readDB = async (filePath) => {
  try {
    const fileJson = await readJson(filePath);
    return fileJson;
  } catch (error) {
    throw new Error(error);
  }
};

const writeDB = async (filePath, fileContent) => {
  try {
    await writeJson(filePath, fileContent);
  } catch (error) {
    throw new Error(error);
  }
};

const err = (msg, errCode = 500) => {
  const e = new Error(msg);
  e.message = msg;
  e.httpStatusCode = errCode;
  console.log(errCode, msg);
  return e;
};

module.exports = {
  getQuestions: async () => readDB(questionsPath),
  writeQuestions: async (questionsData) =>
    writeDB(questionsPath, questionsData),
  getExams: async () => readDB(examsPath),
  writeExams: async (examData) => writeDB(examsPath, examData),
  err,
};
