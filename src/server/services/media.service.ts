import { mediaRepository } from '../repositories/media.repository.js';
import { MediaAsset } from '../types/index.js';

export class MediaService {
  public getAllMedia(): MediaAsset[] {
    return mediaRepository.getAll();
  }

  public getMediaByKey(key: string): MediaAsset | null {
    return mediaRepository.getByKey(key);
  }

  public saveMedia(media: MediaAsset): MediaAsset {
    mediaRepository.create(media);
    return media;
  }

  public processUploadedFile(
    file: { filename: string; originalname: string },
    meta: { media_key?: string; alt_text?: string; caption?: string }
  ): MediaAsset {
    const filename = file.filename;
    const url = `/media/${filename}`;

    // Generate or sanitize media key
    let mediaKey = meta.media_key?.trim();
    if (!mediaKey) {
      const base = meta.alt_text || file.originalname.replace(/\.[^/.]+$/, '');
      const sanitized = base.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      mediaKey = `fig_${sanitized || 'asset'}_${Date.now().toString().slice(-4)}`;
    }

    const asset: MediaAsset = {
      media_key: mediaKey,
      url,
      alt_text: meta.alt_text || file.originalname,
      caption: meta.caption || meta.alt_text || file.originalname
    };

    mediaRepository.create(asset);
    return asset;
  }
}

export const mediaService = new MediaService();
