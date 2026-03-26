const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const {
  getBranchController,
  addBranchController,
  updateBranchController,
  deleteBranchController,
  getPublicBranchesController,
} = require("../controllers/branch.controller");

router.get("/public", getPublicBranchesController);
router.get("/", auth, getBranchController);
router.post("/", auth, addBranchController);
router.patch("/:id", auth, updateBranchController);
router.delete("/:id", auth, deleteBranchController);

module.exports = router;
