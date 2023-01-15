import { Router } from 'express';
import { UploadController } from '../../controllers';

const router = Router();

router.get('/get/:path', UploadController.get);
router.post('/upload', UploadController.uploadOne);

export default router;
