import express from 'express';
import Password from '../../controllers/password';
import Validation from '../../middlewares/validations/password';

const router = express.Router();

router.post('/users/reset_password', Validation.validateEmail, Password.resetPassword);
router.put('/users/password/:token', Validation.validatePassword, Password.updatePassword);

export default router;