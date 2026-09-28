import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';

export const userRouter = Router();

userRouter.get('/', userController.getUsers.bind(userController));
userRouter.get('/:id', userController.getUserById.bind(userController));
userRouter.post('/', userController.createUser.bind(userController));
userRouter.put('/:id', userController.updateUser.bind(userController));
userRouter.delete('/:id', userController.deleteUser.bind(userController));
