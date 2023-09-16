const fs = require("fs");
const path = require("path");

const deleteFile = (filePath) => {
    // Construct the absolute path to the file
    const absoluteFilePath = path.join(__dirname, "..", "public", "uploaded-images", filePath);

    // Delete the file
    fs.unlink(absoluteFilePath, (err) => {
        if (err) {
            console.error("Error deleting file:", err);
            throw err; // You may want to handle this error more gracefully
        } else {
            console.log("File deleted successfully:", absoluteFilePath);
        }
    });
};


exports.deleteFile = deleteFile;