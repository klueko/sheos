import { db, runMigrations, testConnection } from '../src/lib/db/index.js';
import { createUser } from '../src/lib/auth/utils.js';

type Args = Record<string, string | undefined>;

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 2; i < argv.length; i++) {
    const part = argv[i];
    if (part.startsWith('--')) {
      const [key, value] = part.replace(/^--/, '').split('=');
      args[key] = value ?? argv[++i];
    }
  }
  return args;
}

async function main() {
  if (!testConnection()) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }

  // Ensure migrations are applied (safe to run multiple times)
  runMigrations();

  const args = parseArgs(process.argv);
  const email = args.email;
  const password = args.password;
  const roleInput = (args.role || '').toUpperCase();
  const firstName = args.firstName || '';
  const lastName = args.lastName || '';
  const phone = args.phone || '';

  if (!email || !password) {
    console.error('Usage: tsx scripts/create-user.ts --email EMAIL --password PASSWORD [--role ADMIN|VENDEUR|CLIENT] [--firstName FIRST] [--lastName LAST] [--phone PHONE]');
    process.exit(1);
  }

  // Normalize roles: CLIENT -> CUSTOMER; default CUSTOMER if unspecified
  let role: 'ADMIN' | 'VENDEUR' | 'CUSTOMER';
  switch (roleInput) {
    case 'ADMIN':
      role = 'ADMIN';
      break;
    case 'VENDEUR':
      role = 'VENDEUR';
      break;
    case 'CLIENT':
      role = 'CUSTOMER';
      break;
    case '':
      role = 'CUSTOMER';
      break;
    default:
      console.error('Invalid role. Use one of: ADMIN | VENDEUR | CLIENT');
      process.exit(1);
  }

  try {
    const userId = await createUser(email, password, {
      firstName,
      lastName,
      phone,
      role
    });

    console.log('✅ User created');
    console.log(' id:', userId);
    console.log(' email:', email);
    console.log(' role:', role === 'CUSTOMER' ? 'CLIENT' : role);
  } catch (err) {
    console.error('❌ Failed to create user:', err);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


