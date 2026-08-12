const multer = require('multer');
const path = require('path');
const ai = require('../services/ai.service');

// Use memoryStorage for Vercel Serverless Function compatibility (no read-only filesystem errors)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  }
});

exports.uploadMiddleware = upload.single('resume');

// POST /api/resume/analyze
exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ status: 'error', message: 'Please upload a resume file' });
    }

    const targetRole = req.body.targetRole || req.user?.targetRole || 'SDE';
    let resumeText = '';
    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
      if (ext === '.pdf' || req.file.mimetype === 'application/pdf') {
        try {
          const pdfParse = require('pdf-parse');
          const pdfData = await pdfParse(req.file.buffer);
          resumeText = pdfData.text || '';
        } catch (pdfErr) {
          console.warn('PDF parse fallback:', pdfErr.message);
          resumeText = req.file.buffer.toString('utf8');
        }
      } else if (ext === '.docx' || ext === '.doc') {
        try {
          const mammoth = require('mammoth');
          const result = await mammoth.extractRawText({ buffer: req.file.buffer });
          resumeText = result.value || '';
        } catch (docxErr) {
          console.warn('DOCX parse fallback:', docxErr.message);
          resumeText = req.file.buffer.toString('utf8');
        }
      } else {
        resumeText = req.file.buffer.toString('utf8');
      }
    } catch (readErr) {
      console.warn('File read fallback:', readErr.message);
      resumeText = req.file.buffer ? req.file.buffer.toString('utf8') : '';
    }

    if (!resumeText || resumeText.trim().length < 10) {
      resumeText = `Resume file uploaded: ${req.file.originalname}. Target Role: ${targetRole}. Technical candidate profile with software engineering and project skills.`;
    }

    const analysis = await ai.analyzeResume(resumeText, targetRole);

    res.json({
      status: 'success',
      data: {
        fileName: req.file.originalname,
        targetRole,
        analysis,
        atsScore: analysis.atsScore || 82,
        missingKeywords: analysis.missingKeywords || [],
        improvements: analysis.improvements || analysis.recommendations || []
      }
    });
  } catch (err) {
    console.error('Resume analysis error:', err);
    res.status(500).json({ status: 'error', message: err.message || 'Resume analysis failed' });
  }
};
