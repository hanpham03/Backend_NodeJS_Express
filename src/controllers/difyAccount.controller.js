const DifyAccount = require('../models/difyAccount.model');

class DifyAccountController {
    // Get all Dify accounts for a user
    async getUserAccounts(req, res) {
        try {
            const accounts = await DifyAccount.findByUserId(req.user.id);
            res.json(accounts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get specific Dify account
    async getAccount(req, res) {
        try {
            const account = await DifyAccount.findById(req.params.id);
            if (!account) {
                return res.status(404).json({ message: 'Account not found' });
            }
            
            // Check if the account belongs to the requesting user
            if (account.user_id !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            res.json(account);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Create new Dify account
    async createAccount(req, res) {
        try {
            const { dify_account_id, access_token, token_expires_at } = req.body;
            
            const account = new DifyAccount({
                user_id: req.user.id,
                dify_account_id,
                access_token,
                token_created_at: new Date(),
                token_expires_at
            });

            const accountId = await account.create();
            res.status(201).json({ 
                message: 'Account created successfully',
                accountId 
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Update Dify account token
    async updateToken(req, res) {
        try {
            const { access_token, token_expires_at } = req.body;
            const accountId = req.params.id;

            // Verify account ownership
            const account = await DifyAccount.findById(accountId);
            if (!account || account.user_id !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            const result = await DifyAccount.updateToken(
                accountId, 
                access_token, 
                token_expires_at
            );

            if (result === 0) {
                return res.status(404).json({ message: 'Account not found' });
            }

            res.json({ message: 'Token updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Delete Dify account
    async deleteAccount(req, res) {
        try {
            // Verify account ownership
            const account = await DifyAccount.findById(req.params.id);
            if (!account || account.user_id !== req.user.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            const result = await DifyAccount.delete(req.params.id);
            if (result === 0) {
                return res.status(404).json({ message: 'Account not found' });
            }
            
            res.json({ message: 'Account deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Check if token is valid
    async checkToken(req, res) {
        try {
            const isValid = await DifyAccount.isTokenValid(req.params.id);
            res.json({ isValid });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new DifyAccountController();