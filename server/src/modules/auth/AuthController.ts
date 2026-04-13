import { Request, Response } from "express";
import { validationService } from "../../shared/http/validation";
import { AuthService } from "./AuthService";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public login = async (req: Request, res: Response): Promise<void> => {
    validationService.requireFields(req.body, ["email", "password"]);
    const result = await this.authService.login(req.body.email, req.body.password);
    res.json({ success: true, data: result });
  };

  public me = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.me(req.user!.id);
    res.json({ success: true, data: result });
  };

  public requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    validationService.requireFields(req.body, ["email"]);
    const result = await this.authService.requestPasswordReset(req.body.email);
    res.json({ success: true, data: result });
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    validationService.requireFields(req.body, ["token", "newPassword"]);
    const result = await this.authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ success: true, data: result });
  };
}
