const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname;
    const timestamp = Date.now();
    const formattedDate = new Date(timestamp).toISOString().replace(/:/g, '-');

    const isVoiceNote = file.fieldname === 'voiceNote';
    const fileNamePrefix = isVoiceNote ? 'voice-' : file.fieldname + '-';

    // Use the original filename along with the formatted date
    const newFilename = fileNamePrefix + formattedDate + '-' + originalname;

    // Save the filename in the request body
    if (isVoiceNote) {
      req.body.voiceNoteFilename = newFilename; // Save readable filename for voiceNote in the request body
    } else if (file.fieldname === 'files') {
      req.body.files = req.body.files || [];
      req.body.files.push(newFilename);
    }

    cb(null, newFilename);
  },
});

const allowedFileTypes = /pdf|doc|docx|jpeg|jpg|png|mp3|wav/;
const fileFilter = function (req, file, cb) {
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPEG, JPG, PNG, MP3, WAV files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for total file size
  fileFilter: fileFilter,
}).fields([{ name: 'voiceNote', maxCount: 1 }, { name: 'files', maxCount: 5 }]);

// Export a function that returns an object with file information
module.exports = function (req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Create an object with file information
    const fileInfo = {
      voiceNote: req.body.voiceNoteFilename,
      files: req.body.files || [],
    };

    // Attach the fileInfo object to the request for use in the controller or another file
    req.fileInfo = fileInfo;

    next();
  });
};
