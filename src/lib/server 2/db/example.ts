import 'dotenv/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { users } from './schema';
import { createId } from '@paralleldrive/cuid2';

// For this example, we'll use better-sqlite3 directly
// This is for demonstration only and works outside the SvelteKit context
async function main() {
  try {
    // Connect to the database
    const sqlite = new Database('local.db');
    const db = drizzle(sqlite);
    
    console.log('Connected to database successfully');
    
    // Create a user
    const user = {
      id: createId(),
      email: 'example@celestecms.pro',
      username: 'example_user',
      passwordHash: 'not_a_real_hash', // In a real app, use bcrypt or similar
      firstName: 'Example',
      lastName: 'User',
      role: 'editor' as const,
      active: true,
      verifiedEmail: true
    };
    
    console.log('Creating user:', user);
    
    // Insert the user
    await db.insert(users).values(user).onConflictDoNothing();
    console.log('✅ User created successfully');
    
    // Query all users
    const allUsers = await db.select().from(users);
    console.log('All users in database:', allUsers);
    
    // Update the user
    await db.update(users)
      .set({
        firstName: 'Updated',
        lastName: 'Name'
      })
      .where(eq(users.email, user.email));
    console.log('✅ User updated successfully');
    
    // Query the updated user
    const updatedUser = await db.select().from(users).where(eq(users.email, user.email));
    console.log('Updated user:', updatedUser);
    
    // Delete the user
    await db.delete(users).where(eq(users.email, user.email));
    console.log('✅ User deleted successfully');
    
    // Verify deletion
    const remainingUsers = await db.select().from(users).where(eq(users.email, user.email));
    console.log('Remaining users with that email:', remainingUsers);
    
    // Close the database connection
    sqlite.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error in database operations:', error);
  }
}

// Run the main function
main();
