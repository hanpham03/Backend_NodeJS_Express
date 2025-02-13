const express = require('express');
const router = express.Router();
const difyAccountController = require('../controllers/difyAccount.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

// Validation middleware
const validateDifyAccount = [
    body('dify_account_id').notEmpty(),
    body('access_token').notEmpty(),
    body('token_expires_at').isISO8601().toDate()
];

const validateTokenUpdate = [
    body('access_token').notEmpty(),
    body('token_expires_at').isISO8601().toDate()
];

// Routes
router.get('/', authMiddleware.verifyToken, difyAccountController.getUserAccounts);
router.get('/:id', authMiddleware.verifyToken, difyAccountController.getAccount);
router.post('/', authMiddleware.verifyToken, validateDifyAccount, difyAccountController.createAccount);
router.patch('/:id/token', authMiddleware.verifyToken, validateTokenUpdate, difyAccountController.updateToken);
router.delete('/:id', authMiddleware.verifyToken, difyAccountController.deleteAccount);
router.get('/:id/check-token', authMiddleware.verifyToken, difyAccountController.checkToken);

module.exports = router;