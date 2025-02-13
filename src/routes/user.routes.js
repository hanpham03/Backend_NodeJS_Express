const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

// Validation middleware
const validateUser = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('full_name').trim().notEmpty()
];

// Routes
// BỎ xác thực (nếu bạn muốn tạm test)
// router.get('/:id', userController.getUser);

// GIỮ xác thực (nếu bạn muốn bảo vệ route)
router.get('/:id', authMiddleware.verifyToken, userController.getUser);
router.get('/', userController.getAllUsers);
router.post('/', validateUser, userController.createUser);
router.put('/:id', authMiddleware.verifyToken, userController.updateUser);
router.delete('/:id', authMiddleware.verifyToken, userController.deleteUser);

module.exports = router;
