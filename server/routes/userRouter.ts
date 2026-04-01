import express from 'express'
import { getUserCredits, getUserProjects, getProjectById, toggleProjectPublic } from '../controllers/userControlle'
import { protect } from '../middlewares/auth'

const userRouter = express.Router()

userRouter.get('/credits', protect, getUserCredits);
userRouter.get('/projects', protect, getUserProjects);
userRouter.get('/projects/:projectId', protect, getProjectById); 
userRouter.post('/publish/:projectId', protect, toggleProjectPublic);


export default userRouter