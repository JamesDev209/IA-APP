
import express from 'express';
import { createProject, createVideo, getAllPublishedProjects, deleteProject } from '../controllers/projectController';
import { protect } from '../middlewares/auth';
import upload from '../configs/multer';

const projectRouter = express.Router();

projectRouter.post('/create',upload.array('image', 2), protect, createProject);
projectRouter.post('/video', protect, createVideo);
projectRouter.get('/published', getAllPublishedProjects);
projectRouter.delete('/:projectId', protect, deleteProject);

export default projectRouter;
