import dateFns from 'date-fns';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateReqBody } from '@/lib/validateBody';
import { getUserFromReq } from '@/lib/jwt';

const prismaClient = new PrismaClient();

export const bookingRouter = Router();

bookingRouter.get('/', (req, res) => {
  getUserFromReq(req)
    .then((user: any) => {
      prismaClient.booking
        .findMany({
          where: { user_id: user?.id },
          orderBy: { created_at: 'desc' },
        })
        .then((data) => res.status(200).json(data))
        .catch((err) => {
          res.status(400).json({ message: 'Failed to load bookings' });
        });
    })
    .catch((err) => res.status(400).json({ message: err }));
});

const bookingBody = ['slot_id'];
bookingRouter.post('/create', (req, res) => {
  getUserFromReq(req)
    .then((user: any) => {
      validateReqBody(req.query, bookingBody)
        .then(() => {
          prismaClient.booking
            .create({
              data: { slot_id: req.body.slot_id, user_id: user?.id },
            })
            .then((data) => res.status(200).json(data))
            .catch((err) => {
              res.status(400).json({ message: 'Failed to book slot' });
            });
        })
        .catch((err) => res.status(400).json({ message: err }));
    })
    .catch((err) => res.status(400).json({ message: err }));
});
