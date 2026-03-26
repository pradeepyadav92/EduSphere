const express = require("express");
const router = express.Router();
const {
  addBook,
  getBooks,
  issueBook,
  returnBook,
  getStudentIssues,
} = require("../controllers/library/library.controller");

router.post("/book/add", addBook);
router.get("/book/all", getBooks);
router.post("/issue", issueBook);
router.post("/return", returnBook);
router.get("/student/:studentId", getStudentIssues);

module.exports = router;
