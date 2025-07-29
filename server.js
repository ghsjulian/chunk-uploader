// Requiring All The Package...
const express = require("express");
const cors = require("cors")
const path = require("path");
const app = express();
const publicPath = path.join(__dirname, "public/");
const uploadPath = path.join(__dirname, "uploads/");
const PORT = 3000;

app.use(cors({
    origin: ["http://localhost:3000","*"],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: ["Content-Type", "Authorization"],
        // credentials: true,
        maxAge: 86400
}))
app.use(express.json({ limit: "800MB" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));
app.use(express.static(uploadPath));

app.get("/", (req, res) => {
    res.sendFile(publicPath + "index.html");
});

const router = require("./routes/uploader.routes")
app.use("/api/v1/uploader",router)

app.listen(PORT, () => {
    console.log(`\n[+] Server Running --> ${PORT}\n`);
});
