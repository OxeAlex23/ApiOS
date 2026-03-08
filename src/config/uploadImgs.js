import multer, { memoryStorage } from 'multer';
const storage = memoryStorage();

const allowMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];

const uploadImg = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, clb) => {
        if (allowMimeTypes.includes(file.mimetype)) {
            clb(null, true);
        } else {
            new multer.MulterError(
                "LIMIT_UNEXPECTED_FILE",
                "File type not supported"
            );
        }
    }
})

export default uploadImg;