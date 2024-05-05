import bcrypt from 'bcrypt';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateReqBody } from '@/lib/validateBody';
import { generateToken } from '@/lib/jwt';

const prismaClient = new PrismaClient();

export const userRouter = Router();

const registerBody = ['name', 'username', 'password'];
userRouter.post('/register', (req, res) => {
  validateReqBody(req.body, registerBody)
    .then(async () => {
      const hashedPassword = bcrypt.hash(req.body.password, 10);

      prismaClient.user
        .create({
          data: {
            ...req.body,
            password: hashedPassword,
          },
          select: {
            id: true,
            name: true,
            username: true,
          },
        })
        .then((data: any) => {
          res.status(200).json({
            ...data,
            token: generateToken(data),
          });
        })
        .catch((err) => {
          /* 
          https://www.prisma.io/docs/reference/api-reference/error-reference
          error `P2002` = "Unique constraint failed on the {constraint}" 
          user is trying to signup with and email which is already exits
        */
          if (err.code === 'P2002') {
            res
              .status(400)
              .json({ message: `${req.body.username} already exist` });
            return;
          }

          res.status(400).json({ message: 'Failed to register user' });
        });
    })
    .catch((err) => res.status(400).json({ message: err }));
});

const loginBody = ['username', 'password'];
userRouter.post('/login', (req, res) => {
  validateReqBody(req.body, loginBody)
    .then(() => {
      // find user
      prismaClient.user
        .findUnique({
          where: { username: req.body.username },
        })
        .then((user: any) => {
          if (!user) {
            res.status(400).json({ message: 'Failed to find user' });
            return;
          }

          bcrypt.compare(req.body.password, user.password, (err, pass) => {
            if (err)
              return res
                .status(500)
                .json({ message: 'Failed to validate password' });
            if (!pass)
              return res.status(400).json({ message: 'Invalid password' });

            delete user.password; // removes password from user object

            res.status(200).json({
              ...user,
              token: generateToken(user),
            });
          });
        })
        .catch(() => res.status(400).json({ message: 'Failed to find user' }));
    })
    .catch((err) => res.status(400).json({ message: err }));
});
