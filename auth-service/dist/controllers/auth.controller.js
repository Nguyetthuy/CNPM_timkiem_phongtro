"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async register(req, res) {
        const result = await auth_service_1.AuthService.register(req.body);
        res.status(201).json(result);
    }
    static async login(req, res) {
        const result = await auth_service_1.AuthService.login(req.body);
        res.status(200).json(result);
    }
}
exports.AuthController = AuthController;
