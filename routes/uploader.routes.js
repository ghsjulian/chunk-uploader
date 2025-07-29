const express = require("express")
const router = express.Router()
const uploadSingle = require("../controllers/upload-single.controller")

router.post("/upload-single-file",uploadSingle)

module.exports = router