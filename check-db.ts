import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
        createdAt: true,
      },
    });

    console.log('\n✅ Connected to database successfully!\n');
    console.log(`📊 Total Users: ${users.length}\n`);

    if (users.length === 0) {
      console.log('No users yet. Try signing up at http://127.0.0.1:3000/signup\n');
    } else {
      console.log('Users in database:');
      console.log('==================\n');
      users.forEach((user: any, index: number) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Display Name: ${user.displayName}`);
        console.log(`   Phone: ${user.phone || 'Not provided'}`);
        console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
        console.log('');
      });
    }

    // Check other tables
    const [savedTracks, generatedTracks, playlists] = await Promise.all([
      prisma.savedTrack.count(),
      prisma.generatedTrack.count(),
      prisma.playlist.count(),
    ]);

    console.log('\n📈 Other Data:');
    console.log(`   Saved Tracks: ${savedTracks}`);
    console.log(`   Generated Tracks: ${generatedTracks}`);
    console.log(`   Playlists: ${playlists}\n`);

  } catch (error: any) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
