import { Request, Response } from 'express';

export async function createFoo(req: Request, res: Response): void {
	res.status(200);
	res.json(req.body);
}
