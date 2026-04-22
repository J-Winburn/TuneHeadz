const { PrismaClient } = require('@prisma/client');

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
        // Don't select password for security
      },
    });

    console.log('\n✅ Connected to database successfully!\n');
    console.log(`📊 Total Users: ${users.length}\n`);

    if (users.length === 0) {
      console.log('No users yet. Try signing up at http://127.0.0.1:3000/signup\n');
    } else {
      console.log('Users in database:');
      console.log('==================\n');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Display Name: ${user.displayName}`);
        console.log(`   Phone: ${user.phone || 'Not provided'}`);
        console.log(`   Created: ${user.createdAt.toLocaleString()}`);
        console.log('');
      });
    }

    // Also check other tables
    const savedTracks = await prisma.savedTrack.count();
    const generatedTracks = await prisma.generatedTrack.count();
    const playlists = await prisma.playlist.count();

    console.log('\n📈 Other Data:');
    console.log(`   Saved Tracks: ${savedTracks}`);
    console.log(`   Generated Tracks: ${generatedTracks}`);
    console.log(`   Playlists: ${playlists}\n`);

  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
