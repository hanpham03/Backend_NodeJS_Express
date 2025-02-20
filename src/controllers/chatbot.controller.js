const Chatbots = require('../models/chatbot.model');
const axios = require('axios');
const chat_default_id = "4372d2cc-06e9-4df6-9bde-ba6d64f4f458";
const jwt = require('jsonwebtoken');

class ChatbotController {
    // khai báo biến
    // Tạo chatbot mới
    async createChatbot(req, res) {
        try {
            const { user_id, name, description, dify_chatbot_id, status, configuration } = req.body;
            const chatbotId = await Chatbots.createChatbot(
                user_id, name, description, dify_chatbot_id, status, configuration
            );
            res.status(201).json({ message: 'Chatbot created successfully', chatbotId });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Lấy thông tin chatbot theo ID
    async getChatbot(req, res) {
        try {
            const chatbot = await Chatbots.getChatbotById(req.params.id);
            if (!chatbot) {
                return res.status(404).json({ message: 'Chatbot not found' });
            }
            res.json(chatbot);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Lấy danh sách chatbot của một người dùng
    async getChatbotsByUser(req, res) {
        try {
            const chatbots = await Chatbots.getChatbotsByUser(req.params.user_id);
            res.json(chatbots);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Cập nhật thông tin chatbot
    async updateChatbot(req, res) {
        try {
            const updateData = req.body; // Dữ liệu cập nhật
            const affectedRows = await Chatbots.updateChatbot(req.params.id, updateData);
            if (!affectedRows) {
                return res.status(404).json({ message: 'Chatbot not found' });
            }
            res.json({ message: 'Chatbot updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Xóa chatbot theo ID
    async deleteChatbot(req, res) {
        try {
            const affectedRows = await Chatbots.deleteChatbot(req.params.id);
            if (!affectedRows) {
                return res.status(404).json({ message: 'Chatbot not found' });
            }
            res.json({ message: 'Chatbot deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Gọi API Dify để chat
     * Body gửi lên cần có: { query: "Câu hỏi" }
    */
    async chatWithDify(req, res) {
        try {
            // Lấy token từ header authorization
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: "Missing Dify Token" });
            }
            
            const dify_token = authHeader.split(' ')[1];
            console.log('dify_token', dify_token);
            
            const { query } = req.body;
            if (!query) {
                return res.status(400).json({ message: 'Missing "query" in request body' });
            }
    
            // Giải mã token để lấy user_id
            try {
                // Giải mã không xác thực (không cần secret key)
                const decoded = jwt.decode(dify_token);
                console.log('Decoded token:', decoded);
                
                // Trích xuất user_id từ token đã giải mã
                const userId = decoded.user_id || decoded.sub;
                console.log(userId)
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized: User ID not found in token' });
                }
                
                console.log('Extracted userId:', userId);
                
                // Tiếp tục với userId đã giải mã...
                
                // Gọi API Dify              
                const response = await fetch(
                    `http://localhost/console/api/apps/${chat_default_id}/chat-messages`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${dify_token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "inputs": "",
                            "model_config": {},
                            "query": query,
                            "response_mode": "blocking"
                        })
                    }
                );
                
                // Kiểm tra trạng thái phản hồi
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: `HTTP error! status: ${response.status}`
                    }));
                    throw { response: { status: response.status, data: errorData } };
                }
                
                const data = await response.json();
                return res.json(data);
                
            } catch (jwtError) {
                console.error('JWT Decode Error:', jwtError);
                return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
            }
        } catch (error) {
            console.error('Error calling Dify:', error?.response?.data || error.message);
            const statusCode = error?.response?.status || 500;
            const errorData = error?.response?.data || { message: error.message };
            return res.status(statusCode).json(errorData);
        }
    }
    

}

module.exports = new ChatbotController();
