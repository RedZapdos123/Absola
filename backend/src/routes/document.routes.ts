import { Router } from 'express';
import multer from 'multer';
import { storage } from '../config/storage';
import { config } from '../config/env';
import { documentController } from '../controllers/document.controller';

const router = Router();

const upload = multer({
  dest: storage.uploads,
  limits: {
    fileSize: config.limits.maxFileSize,
    files: config.limits.maxFilesPerUpload,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT allowed.'));
    }
  },
});

router.post('/upload', upload.single('file'), documentController.upload.bind(documentController));
router.get('/', documentController.getAllDocuments.bind(documentController));
router.get('/:id', documentController.getDocument.bind(documentController));
router.get('/:id/summary', documentController.getSummary.bind(documentController));
router.post('/:id/query', documentController.query.bind(documentController));
router.get('/:id/context', documentController.getContext.bind(documentController));
router.delete('/:id', documentController.deleteDocument.bind(documentController));

export default router;
