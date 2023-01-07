import { Router } from 'express';
import { UploadController } from '../../controllers';

const router = Router();

router.post('/upload', UploadController.uploadOne);

export default router;
