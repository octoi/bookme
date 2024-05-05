import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateReqBody } from '@/lib/validateBody';
import { getUserFromReq } from '@/lib/jwt';

const prismaClient = new PrismaClient();

export const slotRouter = Router();

const slotRouterBody = ['start_time', 'end_time'];
slotRouter.post('/create', (req, res) => {
  getUserFromReq(req)
    .then((user: any) => {
      validateReqBody(req.body, slotRouterBody)
        .then(() => {
          prismaClient.slot
            .create({
              data: {
                user_id: user?.id,
                start_time: req.body.start_time,
                end_time: req.body.end_time,
              },
            })
            .then((data) => {
              res.status(200).json(data);
            })
            .catch((err) => {
              res.status(400).json({ message: 'Failed to create slot.' });
            });
        })
        .catch((err) => res.status(400).json({ message: err }));
    })
    .catch((err) => res.status(400).json({ message: err }));
});
