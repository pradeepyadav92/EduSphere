const Book = require("../../models/book.model");
const Issue = require("../../models/issue.model");

// Book Management
const addBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, message: "Book added", data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Issue Management
const issueBook = async (req, res) => {
  try {
    const { bookId, studentId, dueDate } = req.body;
    
    // Check book availability
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: "Book not available" });
    }

    const issue = await Issue.create({
      book: bookId,
      student: studentId,
      dueDate: new Date(dueDate),
    });

    // Update available copies
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({ success: true, message: "Book issued", data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const { issueId } = req.body;
    const issue = await Issue.findById(issueId);
    if (!issue || issue.status === "Returned") {
      return res.status(400).json({ success: false, message: "Invalid issue record" });
    }

    issue.status = "Returned";
    issue.returnDate = new Date();
    await issue.save();

    // Update book copies
    const book = await Book.findById(issue.book);
    book.availableCopies += 1;
    await book.save();

    res.status(200).json({ success: true, message: "Book returned" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentIssues = async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await Issue.find({ student: studentId }).populate("book").sort({ issueDate: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addBook,
  getBooks,
  issueBook,
  returnBook,
  getStudentIssues,
};
