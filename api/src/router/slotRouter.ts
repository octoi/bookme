import dateFns from 'date-fns';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateReqBody } from '@/lib/validateBody';
import { getUserFromReq } from '@/lib/jwt';

const prismaClient = new PrismaClient();

export const slotRouter = Router();

// get user slots
const slotQueryBody = ['date']; // date in format of YYYY-MM-DD
slotRouter.get('/:username', (req, res) => {
  validateReqBody(req.query, slotQueryBody)
    .then(() => {
      prismaClient.slot
        .findMany({
          where: {
            user: { username: req.params.username },
            start_time: {
              gte: new Date(req.query.date as string).toISOString(),
              lte: dateFns
                .add(req.query.date as string, { days: 1 })
                .toISOString(),
            },
          },
        })
        .then((data) => {
          res.status(200).json(data);
        })
        .catch((err) => {
          res.status(400).json({ message: 'Failed to delete slot' });
        });
    })
    .catch((err) => res.status(400).json({ message: err }));
});

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
              res.status(400).json({ message: 'Failed to create slot' });
            });
        })
        .catch((err) => res.status(400).json({ message: err }));
    })
    .catch((err) => res.status(400).json({ message: err }));
});

slotRouter.delete('/:id', (req, res) => {
  getUserFromReq(req)
    .then((user: any) => {
      prismaClient.slot
        .delete({
          where: { user_id: user.id, id: req.params.id },
        })
        .then((data) => {
          res.status(200).json(data);
        })
        .catch((err) => {
          res.status(400).json({ message: 'Failed to delete slot' });
        });
    })
    .catch((err) => res.status(400).json({ message: err }));
});
