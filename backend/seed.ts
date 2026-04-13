import { db } from "./src/db";
import { users, rooms, posts, replies } from "./src/db/schema";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  console.log("Seeding database...");

  // 1. Clear existing data (Must be in this exact order to avoid foreign key constraint errors)
  await db.delete(replies);
  await db.delete(posts);
  await db.delete(rooms);
  await db.delete(users);

  // 2. Create Rooms (Manually forcing IDs 1-5)
  await db.insert(rooms).values([
    { id: 1, name: "Technology", description: "A place to discuss Technology" },
    { id: 2, name: "Sports", description: "A place to discuss Sports" },
    { id: 3, name: "Entertainment", description: "A place to discuss Entertainment" },
    { id: 4, name: "Education", description: "A place to discuss Education" },
    { id: 5, name: "General Discussion", description: "A place to discuss General Discussion" }
  ]);

  // 3. Create Users
  const salt = await bcrypt.genSalt(10);
  const passwordHashStr = await bcrypt.hash("password123", salt);

  const usernames = ["testuser", "alice", "bob", "charlie", "david", "eve", "frank", "grace"];
  const createdUsers = await db.insert(users).values(
    usernames.map(username => ({ username, passwordHash: passwordHashStr }))
  ).returning();

  // Create a map to safely grab dynamic user IDs
  const userMap = createdUsers.reduce((acc: Record<string, string>, user) => {
    acc[user.username] = user.id;
    return acc;
  }, {});

  // 4. Create Posts (Now with picsum.photos for rich media)
  const postData = [
    // --- Technology (roomId: 1) ---
    { title: "React 19 vs Next.js Server Components", content: "<p>What are your thoughts on React 19's new features compared to Next.js?</p><p><img src='https://picsum.photos/seed/react/800/400' alt='Code screen' class='rounded-lg mt-4' /></p>", roomId: 1, userId: userMap["testuser"], viewsCount: 154 },
    { title: "Switching from VS Code to Cursor?", content: "<p>Has anyone made the jump yet? The AI integration seems wild but I am used to my extensions.</p>", roomId: 1, userId: userMap["alice"], viewsCount: 89 },
    { title: "Understanding PostgreSQL Indexes", content: "<p>Can someone explain exactly when to use a B-Tree vs a Hash index? <b>Keep it simple please!</b></p>", roomId: 1, userId: userMap["bob"], viewsCount: 42 },
    { title: "My new mechanical keyboard build", content: "<p>Just finished lubing these linear switches. Sounds like marble.</p><p><img src='https://picsum.photos/seed/keyboard/800/400' alt='Keyboard build' class='rounded-lg mt-4' /></p>", roomId: 1, userId: userMap["frank"], viewsCount: 67 },

    // --- Sports (roomId: 2) ---
    { title: "Did anyone see that Champions League match?", content: "<p>That was an incredible climax to the game yesterday! <b>Unbelievable goals.</b></p><p><img src='https://picsum.photos/seed/soccer/800/400' alt='Stadium' class='rounded-lg mt-4' /></p>", roomId: 2, userId: userMap["charlie"], viewsCount: 210 },
    { title: "Best running shoes for flat feet", content: "<p>I am training for a half marathon and my arches are killing me. Recommendations?</p>", roomId: 2, userId: userMap["david"], viewsCount: 34 },

    // --- Entertainment (roomId: 3) ---
    { title: "Best sci-fi movies of the decade", content: "<p>Let's compile a list of the absolute best sci-fi movies released so far.</p><p><img src='https://picsum.photos/seed/scifi/800/400' alt='Sci-fi landscape' class='rounded-lg mt-4' /></p>", roomId: 3, userId: userMap["grace"], viewsCount: 305 },
    { title: "What video game are you currently addicted to?", content: "<p>I cannot stop playing Hades II. Help.</p>", roomId: 3, userId: userMap["eve"], viewsCount: 95 },
    { title: "Overrated TV shows", content: "<p>I will start: The Office. Don't come at me.</p>", roomId: 3, userId: userMap["frank"], viewsCount: 450 },

    // --- Education (roomId: 4) ---
    { title: "How to prepare for Data Structures & Algorithms", content: "<p>I'm feeling really anxious about my upcoming technical interviews. Any tips?</p>", roomId: 4, userId: userMap["david"], viewsCount: 120 },
    { title: "Study techniques that actually work", content: "<p>Pomodoro is okay, but has anyone tried the Feynman technique extensively?</p><p><img src='https://picsum.photos/seed/study/800/400' alt='Notes and books' class='rounded-lg mt-4' /></p>", roomId: 4, userId: userMap["alice"], viewsCount: 78 },

    // --- General Discussion (roomId: 5) ---
    { title: "Favorite morning coffee routine?", content: "<p>What's everyone's go-to coffee order or brewing method in the morning? I'm an Aeropress fan.</p><p><img src='https://picsum.photos/seed/coffee/800/400' alt='Morning coffee' class='rounded-lg mt-4' /></p>", roomId: 5, userId: userMap["testuser"], viewsCount: 220 },
  ];

  const createdPosts = await db.insert(posts).values(postData).returning();

  // 5. Create Replies
  console.log("Generating replies (Top-level and Nested)...");

  // Find specific posts to attach replies to
  const reactPost = createdPosts.find(p => p.title.includes("React 19"))!;
  const overratedPost = createdPosts.find(p => p.title.includes("Overrated TV"))!;
  const coffeePost = createdPosts.find(p => p.title.includes("morning coffee"))!;

  // Phase A: Insert Top-Level Replies (parentId is null)
  const topLevelRepliesData = [
    // React Post
    { postId: reactPost.id, userId: userMap["alice"], content: "<p>React 19 looks really promising, but I think Next.js still wins for SSR.</p>", parentId: null },
    { postId: reactPost.id, userId: userMap["testuser"], content: "<p>Yeah, I especially like the new Actions API. It cleans up so much state management.</p>", parentId: null },

    // TV Post
    { postId: overratedPost.id, userId: userMap["bob"], content: "<p>How dare you. The Office is a masterpiece.</p>", parentId: null },
    { postId: overratedPost.id, userId: userMap["alice"], content: "<p>My hot take: Friends is incredibly overrated.</p>", parentId: null },

    // Coffee Post
    { postId: coffeePost.id, userId: userMap["charlie"], content: "<p>French press, black. Keep it simple.</p>", parentId: null },
  ];

  const topReplies = await db.insert(replies).values(topLevelRepliesData).returning();

  // Phase B: Insert Child Replies (Nested)
  // We use the IDs returned from Phase A to set the parentId correctly
  const childRepliesData = [
    // Nested under Alice's React comment (topReplies[0])
    { postId: reactPost.id, userId: userMap["eve"], content: "<p><strong>@alice</strong> I'm still using Vite for everything. Much simpler mental model.</p>", parentId: topReplies[0].id },
    { postId: reactPost.id, userId: userMap["alice"], content: "<p><strong>@eve</strong> I agree for SPAs, but if you need SEO, Vite alone is tough.</p>", parentId: topReplies[0].id },

    // Nested under Testuser's React comment (topReplies[1])
    { postId: reactPost.id, userId: userMap["bob"], content: "<p><strong>@testuser</strong> Next.js will probably just adopt the native React features eventually anyway.</p>", parentId: topReplies[1].id },

    // Nested under Bob's TV comment (topReplies[2])
    { postId: overratedPost.id, userId: userMap["frank"], content: "<p><strong>@bob</strong> It's just awkward silence and looking at the camera! It gets old.</p>", parentId: topReplies[2].id },
    { postId: overratedPost.id, userId: userMap["grace"], content: "<p><strong>@frank</strong> I actually agree with you. Parks and Rec did that style better anyway.</p>", parentId: topReplies[2].id },

    // Nested under Alice's TV comment (topReplies[3])
    { postId: overratedPost.id, userId: userMap["david"], content: "<p><strong>@alice</strong> +1 on Friends. Seinfeld was much better.</p>", parentId: topReplies[3].id },
  ];

  await db.insert(replies).values(childRepliesData);

  console.log("Seeding complete! Database is primed and ready.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error during seeding:", error);
  process.exit(1);
});