// Select Dom
const msg = document.querySelector("#msg");
const label = document.querySelector("label");
const fileInput = document.querySelector("#file");
const fileInfo = document.querySelector("#file-info");
const mediaContainer = document.querySelector(".media-container");
const closeMedia = document.querySelector(".media-container #close");
const video = document.querySelector(".media-container video");
const openFile = document.querySelector(".open-file");
const uploadBtn = document.querySelector(".upload");
const progress = uploadBtn.querySelector("#progress");
const btnText = uploadBtn.querySelector("#text");
var FILE = null;
var isUploading = false;
//const api = "http://localhost:3000/api/v1/uploader/upload-single-file";
const api = "https://chunk-uploader.onrender.com/api/v1/uploader/upload-single-file"

const showMessage = (type, message) => {
    if (type) {
        msg.classList.add("success");
        msg.textContent = message;
    } else {
        msg.classList.add("error");
        msg.textContent = message;
    }
    setTimeout(() => {
        msg.removeAttribute("class");
        msg.textContent = "";
    }, 2500);
};

const getDate = time => {
    let d = new Date(time);
    let month = d.getMonth();
    let date = d.getDate();
    let year = d.getFullYear();
    return `${date}-${month}-${year}`;
};
const getFileSize = bytes => {
    const units = ["Bytes", "KB", "MB", "GB", "TB"];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${size.toFixed(2)}${units[i]}`;
};

const displayFileInfo = file => {
    fileInfo.classList.add("file-info");
    fileInfo.innerHTML = `
    <li>
        <span>File Name  : </span>
        <span id="val">${file.name}</span>
    </li>
    <li>
        <span>File Type  : </span>
        <span id="val">${file.type}</span>
    </li>
    <li>
        <span>File Size  : </span>
        <span id="val">${getFileSize(file.size)}</span>
    </li>
    <li>
        <span>Last Modified Date  : </span>
        <span id="val">${new Date(
            file.lastModifiedDate
        ).toLocaleDateString()}</span>
    </li>
    <li>
        <span>Last Modified Time  : </span>
        <span id="val">${new Date(
            file.lastModifiedDate
        ).toLocaleTimeString()}</span>
    </li>
    `;
};

fileInput.onchange = e => {
    let file = e.target.files[0];
    if (!file) {
        showMessage(false, "Null, No File Selected !");
        return;
    }
    FILE = file;
    displayFileInfo(file);
};

const uploadFile = async (file, chunk, start, end) => {
    try {
        const request = await fetch(api, {
            method: "POST",
            headers: {
                "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
                "X-File-Name": file.name,
                "X-File-Size": file.size,
                "X-Chunk-Size": chunk.size
            },
            body: chunk
        });
        const response = await request.json();
        let filename = file.name.split(".");
        let ext = filename[filename.length - 1];
        if (response.complete) {
            // Hide all the input buttons
            fileInfo.innerHTML = "";
            fileInfo.classList.remove("file-info");
            label.style.display = "none";
            uploadBtn.style.display = "none";
            // msg.classList.add("success");
//             msg.textContent = response.message;
// 
            setTimeout(() => {
                if (ext === "mp4") {
                    video.style.display = "block";
                    video.src = response.file_url;
                    mediaContainer.style.display = "block";
                } else if (
                    ext === "jpg" ||
                    ext === "png" ||
                    ext === "gif" ||
                    ext === "webp" ||
                    ext === "jpeg"
                ) {
                    mediaContainer.style.display = "block";
                    mediaContainer.querySelector("img").src = response.file_url;
                    mediaContainer.querySelector("img").style.display = "block";
                } else if (ext === "mp3" || ext === "ogg" || ext === "wav") {
                    mediaContainer.style.display = "block";
                    mediaContainer.querySelector("audio").src =
                        response.file_url;
                    mediaContainer.querySelector("audio").style.display =
                        "block";
                }
            }, 2500);
        }
    } catch (error) {
        console.log(error.message);
    }
};

uploadBtn.onclick = async e => {
    e.preventDefault();
    if (!FILE) {
        showMessage(false, "Null, No File Selected !");
        return;
    }

    const chunkSize = 1024 * 100; // 100KB
    const totalChunks = Math.ceil(FILE.size / chunkSize);
    var uploadedChunk = 0;
    btnText.textContent = "Uploading...";

    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, FILE.size);
        const chunk = FILE.slice(start, end);
        const progressSize = Math.round(((i + 1) / totalChunks) * 100);
        uploadedChunk += chunk.size;
        if (!isUploading) {
            await uploadFile(FILE, chunk, start, end);
            progress.textContent = progressSize + "%";
        } else {
            break;
            return;
        }
    }
    btnText.textContent = "Upload Completed";
};

closeMedia.onclick = () => {
    mediaContainer.style.display = "none";
    mediaContainer.querySelector("video").style.display = "none";
    mediaContainer.querySelector("audio").style.display = "none";
    mediaContainer.querySelector("img").style.display = "none";
    label.style.display = "flex";
    uploadBtn.style.display = "flex";
    progress.textContent = "";
    btnText.textContent = "Upload File";
    fileInput.files = null;
    FILE = null;
};
