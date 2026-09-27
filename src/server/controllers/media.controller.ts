import { Request, Response, NextFunction } from 'express';
import { mediaService } from '../services/media.service.js';

export class MediaController {
  public async uploadMedia(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const { media_key, alt_text, caption } = req.body;
      const asset = mediaService.processUploadedFile(
        {
          filename: req.file.filename,
          originalname: req.file.originalname
        },
        { media_key, alt_text, caption }
      );

      res.status(201).json({
        success: true,
        message: 'Media uploaded successfully',
        data: asset
      });
    } catch (err: any) {
      Next(err);
    }
  }

  public async getAllMedia(_req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const assets = mediaService.getAllMedia();
      res.json({ success: true, data: assets });
    } catch (err: any) {
      Next(err);
    }
  }

  public async createMedia(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const { media_key, url, alt_text, caption } = req.body;
      if (!media_key || !url) {
        res.status(400).json({ success: false, message: 'media_key and url are required' });
        return;
      }

      const asset = mediaService.saveMedia({
        media_key: media_key.trim(),
        url: url.trim(),
        alt_text: alt_text || null,
        caption: caption || null
      });

      res.status(201).json({ success: true, data: asset });
    } catch (err: any) {
      Next(err);
    }
  }
}

export const mediaController = new MediaController();
