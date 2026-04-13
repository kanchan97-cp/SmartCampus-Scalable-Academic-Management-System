import { Request, Response } from "express";
import { UserServicePort } from "./UserService";
import { validationService } from "../../shared/http/validation";

export class UserController {
  constructor(private readonly userService: UserServicePort) {}

  public listUsers = async (req: Request, res: Response): Promise<void> => {
    const pagination = validationService.parsePagination(req.query as Record<string, unknown>);
    const users = await this.userService.listUsers({
      role: typeof req.query.role === "string" ? req.query.role : undefined,
      isActive: typeof req.query.isActive === "string" ? req.query.isActive : undefined,
      ...pagination,
    });
    res.json({ success: true, data: users });
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
    validationService.requireFields(req.body, ["name", "email", "password", "role"]);
    const user = await this.userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  };

  public getUser = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.getUser(req.params.userId);
    res.json({ success: true, data: user });
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.updateUser(req.params.userId, req.body);
    res.json({ success: true, data: user });
  };
}
