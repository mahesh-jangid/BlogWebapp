const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const Blog = require('./models/Blog');

const MONGODB_URI = `mongodb+srv://narsijangid01:12345678nj@cluster0.x8tzdfv.mongodb.net/blogapp?retryWrites=true&w=majority&appName=Cluster0`;

// Dummy Users Data
const users = [
  {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Full-stack developer passionate about web technologies',
    role: 'author',
    isVerified: true,
  },
  {
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Doe',
    bio: 'UI/UX Designer and creative writer',
    role: 'author',
    isVerified: true,
  },
  {
    username: 'mikebrown',
    email: 'mike@example.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Brown',
    bio: 'Tech enthusiast and blogger',
    role: 'author',
    isVerified: true,
  },
  {
    username: 'sarahsmith',
    email: 'sarah@example.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Smith',
    bio: 'Digital marketing expert',
    role: 'admin',
    isVerified: true,
  },
];

// Dummy Categories Data
const categories = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Latest tech news and tutorials',
    icon: '💻',
    color: '#3B82F6',
  },
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Web dev tips, tricks and tutorials',
    icon: '🌐',
    color: '#10B981',
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'UI/UX design inspiration and tips',
    icon: '🎨',
    color: '#F59E0B',
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Life hacks and personal development',
    icon: '🌿',
    color: '#8B5CF6',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Business insights and entrepreneurship',
    icon: '💼',
    color: '#EF4444',
  },
];

// Dummy Blogs Data
const blogs = [
  {
    title: 'Getting Started with React Hooks',
    slug: 'getting-started-with-react-hooks',
    content: `React Hooks have revolutionized the way we write React components. Since their introduction in React 16.8, they've become the standard way to manage state and side effects in functional components.

## What are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They don't work inside classes - they let you use React without classes.

## useState - The Most Common Hook

The useState hook is the most commonly used hook. It allows you to add state to functional components.

## useEffect - Handling Side Effects

The useEffect hook lets you perform side effects in function components.

## Conclusion

React Hooks provide a more concise and readable way to write React components.`,
    tags: ['react', 'javascript', 'hooks', 'frontend'],
    featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  },
  {
    title: 'The Future of Web Development in 2024',
    slug: 'future-of-web-development-in-2024',
    content: `The web development landscape is constantly evolving. As we move further into 2024, several trends are shaping the future of how we build web applications.

## AI-Powered Development

Artificial Intelligence is transforming how developers write code.

## Serverless Architecture

Serverless computing continues to gain popularity.

## WebAssembly Growth

WebAssembly is enabling high-performance applications in the browser.

## Conclusion

The future of web development is exciting.`,
    tags: ['web development', 'trends', '2024', 'future'],
    featuredImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
  },
  {
    title: 'Mastering CSS Grid Layout',
    slug: 'mastering-css-grid-layout',
    content: `CSS Grid Layout is a two-dimensional layout system for the web. It lets you lay out items in rows and columns.

## Why CSS Grid?

Grid provides a more intuitive way to create complex layouts.

## Basic Grid Container

To create a grid, define a container with display: grid.

## Conclusion

CSS Grid is an essential tool for modern web development.`,
    tags: ['css', 'grid', 'layout', 'responsive'],
    featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  },
  {
    title: 'Building a Successful Morning Routine',
    slug: 'building-a-successful-morning-routine',
    content: `A productive day starts with a solid morning routine. Here's how to build one that works for you.

## Why Morning Routines Matter

How you start your day often determines how the rest of it goes.

## Steps to Build Your Routine

Wake up early, hydrate, exercise, meditate, and plan your day.

## Conclusion

A morning routine is a personal thing. Customize it to fit your lifestyle.`,
    tags: ['lifestyle', 'productivity', 'morning routine', 'self-improvement'],
    featuredImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
  },
  {
    title: 'Introduction to TypeScript for JavaScript Developers',
    slug: 'introduction-to-typescript-for-javascript-developers',
    content: `TypeScript is JavaScript with syntax for types. It helps you catch errors early through type checking.

## Why TypeScript?

TypeScript adds static typing to catch errors during development.

## Basic Types

TypeScript provides several basic types: string, number, boolean, and arrays.

## Getting Started

Start by installing TypeScript globally.

## Conclusion

TypeScript improves code quality and developer experience.`,
    tags: ['typescript', 'javascript', 'programming', 'tutorial'],
    featuredImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
  },
  {
    title: 'Digital Marketing Strategies for Small Businesses',
    slug: 'digital-marketing-strategies-for-small-businesses',
    content: `In today's digital age, having a strong online presence is crucial for small businesses.

## Social Media Marketing

Social platforms offer affordable ways to reach potential customers.

## Content Marketing

Create valuable content that addresses your audience's needs.

## SEO Basics

Optimize your website for search engines.

## Conclusion

Digital marketing doesn't have to be expensive.`,
    tags: ['marketing', 'digital marketing', 'business', 'small business'],
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  },
  {
    title: 'Understanding Node.js Event Loop',
    slug: 'understanding-nodejs-event-loop',
    content: `The event loop is what allows Node.js to perform non-blocking I/O operations.

## What is the Event Loop?

The event loop is a mechanism that handles asynchronous operations in Node.js.

## Phases of the Event Loop

Timers, pending callbacks, poll, check, and close callbacks.

## Conclusion

Understanding the event loop helps you write better Node.js applications.`,
    tags: ['nodejs', 'javascript', 'backend', 'performance'],
    featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
  },
  {
    title: 'UI/UX Design Principles Every Developer Should Know',
    slug: 'ui-ux-design-principles-every-developer-should-know',
    content: `Good design is not just about aesthetics - it's about usability and user experience.

## Visual Hierarchy

Organize elements to guide users' attention.

## Consistency

Maintain consistency across your application.

## Accessibility

Design for everyone.

## Conclusion

Good design improves user satisfaction and product success.`,
    tags: ['design', 'ui', 'ux', 'accessibility'],
    featuredImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Blog.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create Users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create Categories (using first user as createdBy)
    const categoriesWithCreator = categories.map(cat => ({
      ...cat,
      createdBy: createdUsers[0]._id,
    }));
    const createdCategories = await Category.insertMany(categoriesWithCreator);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create Blogs
    const blogsWithRefs = blogs.map((blog, index) => ({
      ...blog,
      author: createdUsers[index % createdUsers.length]._id,
      category: createdCategories[index % createdCategories.length]._id,
      published: true,
      views: Math.floor(Math.random() * 1000),
      likeCount: Math.floor(Math.random() * 50),
      commentCount: Math.floor(Math.random() * 20),
    }));
    
    const createdBlogs = await Blog.insertMany(blogsWithRefs);
    console.log(`✅ Created ${createdBlogs.length} blogs`);

    console.log('🎉 Database seeded successfully!');
    console.log('\n📝 Demo Login Credentials:');
    console.log('   Email: john@example.com | Password: password123');
    console.log('   Email: jane@example.com | Password: password123');
    console.log('   Email: mike@example.com | Password: password123');
    console.log('   Email: sarah@example.com | Password: password123 (Admin)');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDatabase();
