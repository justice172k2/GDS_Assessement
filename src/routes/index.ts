import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { teacherController } from '../config/dependencies';

const router = Router();

router.post('/register', asyncHandler(teacherController.register));
router.get('/commonstudents', asyncHandler(teacherController.commonStudents));
router.post('/suspend', asyncHandler(teacherController.suspend));
router.post('/retrievefornotifications', asyncHandler(teacherController.retrieveForNotifications));

export default router;
