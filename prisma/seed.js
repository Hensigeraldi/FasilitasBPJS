const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Ganti password baru di sini
  const Password = 'adminyangbolehmasuk';
  const hashedPassword = await bcrypt.hash(Password, 10);
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { 
      password: hashedPassword  // ← INI PENTING! Agar password terupdate
    },
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log(`✅ Password berhasil diubah!`);
  console.log(`   Username: admin`);
  console.log(`   Password: ${Password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });