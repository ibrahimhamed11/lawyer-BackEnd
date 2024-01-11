const { Consultation } = require('../models/Consultation');
const upload = require('../config/multerConfig');
const fs = require('fs');
const path = require('path');
const baseUrl='localhost/lawyerApi/files/';
const jwt = require('jsonwebtoken');





//--------------------------- Helper Functions ---------------------------------------
// Function to extract user ID from the Bearer token
const getUserIdFromToken = (token) => {
  if (!token) {
    return null;
  }

  const tokenParts = token.split(' ');

  if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  const decodedToken = decodeToken(tokenParts[1]);

  if (!decodedToken) {
    return null;
  }

  return decodedToken.userId;
};
// Function to decode the JWT token
const decodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, 'lawyer');
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
};
//------------------------------------------------------------------------------




const getErrorMessage = (lang, key) => {
  const errorMessages = {
    en: {
      internalServerError: 'Internal Server Error.',
      consultationNotFound: 'Consultation not found.',
    },
    ar: {
      internalServerError: 'خطأ داخلي في الخادم.',
      consultationNotFound: 'الاستشارة غير موجودة.',
    },
  };

  return errorMessages[lang][key] || errorMessages.en[key];
};
const createConsultation = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      const fileInfo = req.fileInfo;

      if (err) {
        const errorMessage = req.headers.lang === 'ar' ? 'خطأ في تحميل الملف: ' : 'File upload error: ';
        return res.status(400).json({ success: false, error: errorMessage + err.message });
      }

      let voiceNoteName = null;
      let filesName = null;

      try {
        voiceNoteName = fileInfo.voiceNote;
        filesName = fileInfo.files;
      } catch (error) {
        const errorMessage = req.headers.lang === 'ar' ? 'خطأ في التعامل مع تسجيل الصوت: ' : 'Error handling voice note: ';
        return res.status(400).json({ success: false, error: errorMessage + error.message });
      }

      // Get user ID from the Bearer token in the Authorization header
      const token = req.headers.authorization;
      const userId = getUserIdFromToken(token);

      // Create consultation
      const consultation = await Consultation.create({
        userId: userId,
        priority: req.body.priority,
        title: req.body.title,
        subject: req.body.subject,
        status: req.body.status,
        voiceNote: voiceNoteName,
        consultationSpecialization: req.body.consultationSpecialization,
        Files: filesName.join(', '),
        basePrice: req.body.basePrice,
        negotiationPrice: req.body.negotiationPrice,
      });

      // Add links for voice note and files
      const consultationWithLinks = { ...consultation.toJSON() };

      if (consultationWithLinks.voiceNote) {
        consultationWithLinks.voiceNoteLink = `${baseUrl}voiceNote/${consultationWithLinks.voiceNote}`;
      }

      if (consultationWithLinks.Files) {
        const filesArray = consultationWithLinks.Files.split(', ');
        consultationWithLinks.FilesLinks = filesArray.map(fileName => `${baseUrl}files/${fileName}`);
      }

      const successMessage = req.headers.lang === 'ar' ? 'تم إنشاء الاستشارة بنجاح' : 'Consultation created successfully';
      res.status(201).json({ message: successMessage, consultation: consultationWithLinks });
    });
  } catch (error) {
    console.error(error);
    const errorMessage = req.headers.lang === 'ar' ? 'خطأ في الخادم الداخلي: ' : 'Internal server error: ';
    res.status(500).json({ error: errorMessage + error.message });
  }
};


const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      priority,
      title,
      subject,
      status,
      voiceNote,
      consultationSpecialization,
      maxFiles,
      basePrice,
      negotiationPrice,
    } = req.body;

    const consultation = await Consultation.findByPk(id);

    if (!consultation) {
      const lang = req.headers['lang'] || 'en';
      return res.status(404).json({ error: getErrorMessage(lang, 'consultationNotFound') });
    }

    // Get lawyer ID from the request
    const lawyerId = req.user.id;

    consultation.priority = priority;
    consultation.title = title;
    consultation.subject = subject;
    consultation.status = status;
    consultation.voiceNote = voiceNote;
    consultation.consultationSpecialization = consultationSpecialization;
    consultation.maxFiles = maxFiles;
    consultation.basePrice = basePrice;
    consultation.negotiationPrice = negotiationPrice;
    consultation.lawyerId = lawyerId; // Add lawyer ID from the request

    await consultation.save();

    res.json(consultation);
  } catch (error) {
    console.error(error);
    const lang = req.headers['lang'] || 'en';
    res.status(500).json({ error: getErrorMessage(lang, 'internalServerError') });
  }
};


const getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.findAll();
    
    const consultationsWithLinks = consultations.map(consultation => {
      const consultationCopy = { ...consultation.toJSON() };
      
      if (consultationCopy.voiceNote) {
        consultationCopy.voiceNoteLink = `${baseUrl+consultationCopy.voiceNote}`;
      }
      
      if (consultationCopy.Files) {
        const filesArray = consultationCopy.Files.split(', ');
        consultationCopy.FilesLinks = filesArray.map(fileName => `${baseUrl+fileName}`);
      }
      
      return consultationCopy;
    });
    
    res.json(consultationsWithLinks);
  } catch (error) {
    console.error(error);
    const lang = req.headers['lang'] || 'en';
    res.status(500).json({ error: getErrorMessage(lang, 'internalServerError') });
  }
};





const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findByPk(id);

    if (!consultation) {
      const lang = req.headers['lang'] || 'en';
      return res.status(404).json({ error: getErrorMessage(lang, 'consultationNotFound') });
    }

    res.json(consultation);
  } catch (error) {
    console.error(error);
    const lang = req.headers['lang'] || 'en';
    res.status(500).json({ error: getErrorMessage(lang, 'internalServerError') });
  }
};


const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findByPk(id);

    if (!consultation) {
      const lang = req.headers['lang'] || 'en';
      return res.status(404).json({ error: getErrorMessage(lang, 'consultationNotFound') });
    }

    await consultation.destroy();

    const lang = req.headers['lang'] || 'en';
    res.json({
      message: lang === 'ar' ? 'تم حذف الاستشارة بنجاح.' : 'Consultation deleted successfully.',
    });
  } catch (error) {
    console.error(error);
    const lang = req.headers['lang'] || 'en';
    res.status(500).json({ error: getErrorMessage(lang, 'internalServerError') });
  }
};


const getFileByName = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '../uploads', fileName);

    if (fs.existsSync(filePath)) {
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } else {
      const lang = req.headers['lang'] || 'en';
      res.status(404).json({ error: getErrorMessage(lang, 'consultationNotFound') });
    }
  } catch (error) {
    console.error(error);
    const lang = req.headers['lang'] || 'en';
    res.status(500).json({ error: getErrorMessage(lang, 'internalServerError') });
  }
};




module.exports = {
  getAllConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
  createConsultation,
  getFileByName,
};
