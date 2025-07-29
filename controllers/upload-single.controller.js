const fs = require("fs");
const path = require("path");

const uploadSingle = (req, res) => {
    try {
        const filename = req.headers["x-file-name"];
        const range = req.headers["content-range"];
        const chunkSize = req.headers["x-chunk-size"];
        const fileSize = req.headers["x-file-size"];

        if (!range || !filename) throw new Error("Missing headers");
        const match = range.match(/bytes (\d+)-(\d+)\/(\d+)/);
        if (!match) throw new Error("Invalid Content-Range format");
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        const total = parseInt(match[3]);

        const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
        const filepath = path.join(UPLOAD_DIR, filename);
        if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

        const writeStream = fs.createWriteStream(filepath, {
            flags: "a",
            start
        });

        req.on("error", error => {
            throw new Error(error.message);
        });
        writeStream.on("error", error => {
            throw new Error(error.message);
        });

        writeStream.on("finish", () => {
            const stats = fs.statSync(filepath);
            const isCompleted = stats.size === total;
            return res.status(200).json({
                complete: isCompleted,
                total_bytes: fileSize,
                total_size: stats.size,
                file_size: fileSize,
                chunk_size: chunkSize,
                start_chunk : start,
                end_chunk : end,
                success: true,
                file_url : `https://chunk-uploader.onrender.com/${filename}`,
                message: "File Uploaded Successfully"
            });
        });
            req.pipe(writeStream)
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: error.message || "Unexpected Server Error - 505"
        });
    }
};

module.exports = uploadSingle;
