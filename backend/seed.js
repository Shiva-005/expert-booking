require('dotenv').config();
const mongoose = require('mongoose');
const Expert = require('./models/Expert');

const generateSlots = () => {
  const slots = [];
  const today = new Date();
  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  for (let d = 1; d <= 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dateStr = date.toISOString().split('T')[0];
    times.forEach((time) => {
      slots.push({ date: dateStr, time, isBooked: false });
    });
  }
  return slots;
};

const experts = [
  {
    name: 'Dr. Sarah Chen',
    category: 'Technology',
    bio: 'Principal Engineer at Google with 12 years experience in distributed systems, AI/ML infrastructure, and cloud architecture. Speaker at Google I/O, AWS re:Invent.',
    experience: 12,
    rating: 4.9,
    totalReviews: 234,
    hourlyRate: 250,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sarah',
    skills: ['Distributed Systems', 'Machine Learning', 'Kubernetes', 'Go', 'Python'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Marcus Rodriguez',
    category: 'Business',
    bio: 'Serial entrepreneur with 3 successful exits. Former McKinsey consultant. Expert in startup strategy, fundraising, and scaling operations from 0 to 100M ARR.',
    experience: 15,
    rating: 4.8,
    totalReviews: 189,
    hourlyRate: 300,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=marcus',
    skills: ['Startup Strategy', 'Fundraising', 'Operations', 'Leadership', 'M&A'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Priya Nair',
    category: 'Design',
    bio: 'Head of Design at Figma. Previously led design at Airbnb and Uber. Specializes in design systems, product design, and creating human-centric experiences at scale.',
    experience: 10,
    rating: 4.9,
    totalReviews: 312,
    hourlyRate: 200,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=priya',
    skills: ['Product Design', 'Design Systems', 'User Research', 'Figma', 'Design Leadership'],
    availableSlots: generateSlots(),
  },
  {
    name: 'James Thornton',
    category: 'Finance',
    bio: 'CFA with 18 years on Wall Street. Former Goldman Sachs VP. Expert in investment strategies, portfolio management, and financial modeling for startups and enterprises.',
    experience: 18,
    rating: 4.7,
    totalReviews: 156,
    hourlyRate: 350,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=james',
    skills: ['Investment Strategy', 'Portfolio Management', 'Financial Modeling', 'VC', 'IPO'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Aisha Okonkwo',
    category: 'Marketing',
    bio: 'CMO-turned-consultant. Grew Duolingo\'s user base from 5M to 50M. Specializes in growth hacking, viral loops, content strategy, and performance marketing.',
    experience: 11,
    rating: 4.8,
    totalReviews: 201,
    hourlyRate: 225,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=aisha',
    skills: ['Growth Marketing', 'SEO/SEM', 'Content Strategy', 'Viral Loops', 'Brand Building'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Dr. Raj Patel',
    category: 'Health',
    bio: 'Stanford-trained physician and healthcare entrepreneur. Founded 2 health-tech startups. Expert in digital health, clinical workflows, and health data interoperability.',
    experience: 14,
    rating: 4.9,
    totalReviews: 278,
    hourlyRate: 275,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=raj',
    skills: ['Digital Health', 'Clinical Strategy', 'Health Tech', 'FDA Compliance', 'Telemedicine'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Elena Vasquez',
    category: 'Legal',
    bio: 'Partner at top-tier IP law firm. 16 years specializing in tech IP, startup legal structures, GDPR compliance, and international IP strategy for global companies.',
    experience: 16,
    rating: 4.7,
    totalReviews: 143,
    hourlyRate: 400,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=elena',
    skills: ['Intellectual Property', 'Startup Law', 'GDPR', 'Contracts', 'International Law'],
    availableSlots: generateSlots(),
  },
  {
    name: 'Tom Nakamura',
    category: 'Education',
    bio: 'EdTech pioneer with 20 years in instructional design. Built learning platforms used by 10M+ students. Expert in curriculum design, online learning, and adaptive education.',
    experience: 20,
    rating: 4.6,
    totalReviews: 167,
    hourlyRate: 175,
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=tom',
    skills: ['Curriculum Design', 'EdTech', 'Online Learning', 'Adaptive Systems', 'LMS'],
    availableSlots: generateSlots(),
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Expert.deleteMany({});
    const inserted = await Expert.insertMany(experts);
    console.log(`✅ Seeded ${inserted.length} experts`);

    mongoose.disconnect();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
