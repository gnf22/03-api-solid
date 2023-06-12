import { prisma } from '@/lib/prisma';
import { Prisma } from 'prisma/prisma-client';


export class PrismaUsersRepository {
  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data
    });

    return user;
  }
}