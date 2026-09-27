import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { uploadMiddleware } from '../middleware/upload.js';

export const mediaRouter = Router();

// Allow either 'file' or 'image' field in multipart form
const handleUpload = (req: any, res: any, next: any) => {
  uploadMiddleware.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }])(
    req,
    res,
    (err: any) => {
      if (err) return next(err);
      if (req.files) {
        if (req.files.file && req.files.file[0]) {
          req.file = req.files.file[0];
        } else if (req.files.image && req.files.image[0]) {
          req.file = req.files.image[0];
        }
      }
      next();
    }
  );
};

mediaRouter.post('/upload', handleUpload, (req, res, next) =>
  mediaController.uploadMedia(req, res, next)
);
mediaRouter.get('/', (req, res, next) => mediaController.getAllMedia(req, res, next));
mediaRouter.post('/', (req, res, next) => mediaController.createMedia(req, res, next));
