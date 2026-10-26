import { connectDatabase } from '../config/database';
import { seedDatabase } from '../services/seedService';

const run = async () => {
  try {
    await connectDatabase();
    await seedDatabase(true); // Force reseed
    console.log('Database re-seed finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

run();
