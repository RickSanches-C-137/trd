import { Request, Response } from "express";
import UserService from "./users.services";
import { loginResponse } from "../../utils/login-response";

export default class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    signUp = async (req: Request, res: Response) => {
        const result = await this.userService.signUp(req.body);
        res.redirect('/dashboard');
    }

    signIn = async (req: Request, res: Response) => {
        const result = await this.userService.signIn(req.body)
        res.cookie('auth', JSON.stringify(result.user), { httpOnly: true });

        res.redirect('/dashboard');
        // res.status(201).json(result);
    }
}