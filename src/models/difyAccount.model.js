const db = require('../config/database');

class DifyAccount {
    constructor(account) {
        this.user_id = account.user_id;
        this.dify_account_id = account.dify_account_id;
        this.access_token = account.access_token;
        this.token_created_at = account.token_created_at;
        this.token_expires_at = account.token_expires_at;
    }

    static async findByUserId(userId) {
        const [rows] = await db.execute(
            'SELECT * FROM DifyAccounts WHERE user_id = ?', 
            [userId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM DifyAccounts WHERE id = ?', 
            [id]
        );
        return rows[0];
    }

    async create() {
        const sql = `
            INSERT INTO DifyAccounts (
                user_id, dify_account_id, access_token, 
                token_created_at, token_expires_at
            ) VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            this.user_id,
            this.dify_account_id,
            this.access_token,
            this.token_created_at,
            this.token_expires_at
        ]);
        return result.insertId;
    }

    static async update(id, updateData) {
        const sql = 'UPDATE DifyAccounts SET ? WHERE id = ?';
        const [result] = await db.execute(sql, [updateData, id]);
        return result.affectedRows;
    }

    static async updateToken(id, accessToken, expiresAt) {
        const sql = `
            UPDATE DifyAccounts 
            SET access_token = ?, 
                token_created_at = NOW(),
                token_expires_at = ?
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [accessToken, expiresAt, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const sql = 'DELETE FROM DifyAccounts WHERE id = ?';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows;
    }

    static async isTokenValid(id) {
        const [rows] = await db.execute(`
            SELECT token_expires_at 
            FROM DifyAccounts 
            WHERE id = ? AND token_expires_at > NOW()`,
            [id]
        );
        return rows.length > 0;
    }
}

module.exports = DifyAccount;