import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { ValidateCheckInUseCase } from './validate-check-in';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

let checkInRepository: InMemoryCheckInsRepository;
let sut: ValidateCheckInUseCase;

describe('Validate Check-in Use Case', () => {
  beforeEach(async () => {
    checkInRepository = new InMemoryCheckInsRepository();
    sut = new ValidateCheckInUseCase(checkInRepository);
    // vi.useFakeTimers();
  });

  afterEach(() => {
    // vi.useRealTimers();
  });

  it('should be able to validate the check-in', async () => {
    const createdCheckIn = await checkInRepository.create({
      gym_id: 'gym-01',
      user_id: 'user-01',
    });

    const { checkIn } = await sut.execute({
      checkInId: createdCheckIn.id,
    });

    expect(checkIn.validated_at).toEqual(expect.any(Date));
    expect(checkInRepository.items[0].validated_at).toEqual(expect.any(Date));
  });

  it('should not be able to validate an inexistent check-in', async () => {
    await expect(() => sut.execute({
      checkInId: 'inexistent-check-in-id',
    })).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});