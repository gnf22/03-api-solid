import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository';
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository';
import { Decimal } from '@prisma/client/runtime/library';
import { expect, describe, it, beforeEach, vi, afterEach } from 'vitest';
import { CheckInUseCase } from './check-in';
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error';
import { MaxDistanceError } from './errors/max-distance-error';

let checkInRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;

describe('Check-in Use Case', () => {
  beforeEach(async () => {
    checkInRepository = new InMemoryCheckInsRepository();
    gymsRepository = new InMemoryGymsRepository();
    sut = new CheckInUseCase(checkInRepository, gymsRepository);

    await gymsRepository.create({
      id: 'gym-01',
      title: 'Javascript Gym',
      description: '',
      phone: '',
      latitude: 53.3803913,
      longitude: -2.8861104,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: 53.3803913,
      userLongitude: -2.8861104,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2017, 5, 22, 13, 0, 0));
    
    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: 53.3803913,
      userLongitude: -2.8861104,
    });

    await expect(() => sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: 53.3803913,
      userLongitude: -2.8861104,
    })).rejects.toBeInstanceOf(MaxNumberOfCheckInsError);

  });

  it('should be able to check in twice but in different days', async () => {
    vi.setSystemTime(new Date(2017, 5, 21, 13, 0, 0));
    
    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: 53.3803913,
      userLongitude: -2.8861104,
    });

    vi.setSystemTime(new Date(2017, 5, 22, 13, 0, 0));

    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: 53.3803913,
      userLongitude: -2.8861104,
    });

    console.log(checkIn.created_at);

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it('should not be able to check in on distant gym', async () => {
    gymsRepository.items.push({
      id: 'gym-02',
      title: 'Javascript Gym',
      description: '',
      phone: '',
      latitude: new Decimal(53.5314963),
      longitude: new Decimal(-2.6618745),
    });

    await expect(() => sut.execute({
      gymId: 'gym-02',
      userId: 'user-01',
      userLatitude: 53.3803913,
      userLongitude: -2.8861104,
    })).rejects.toBeInstanceOf(MaxDistanceError);
  });
});