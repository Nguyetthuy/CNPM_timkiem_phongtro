"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async register(req, res) {
        try {
            const result = await auth_service_1.AuthService.register(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
    static async login(req, res) {
        try {
            const result = await auth_service_1.AuthService.login(req.body);
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
    static async getUserById(req, res) {
        try {
            const result = await auth_service_1.AuthService.getUserById(req.params.id);
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Get user error:', error);
            res.status(404).json({ message: 'User not found', error: error.message });
        }
    }
}
exports.AuthController = AuthController;
