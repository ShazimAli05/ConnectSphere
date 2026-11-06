require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Report = require('../models/Report');

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connectsphere';
    await mongoose.connect(mongoURI);
    console.log('[Seeder] Connected to MongoDB for database seeding.');

    // Clear existing collections
    await User.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Report.deleteMany({});
    console.log('[Seeder] Existing collections cleared.');

    // 1. Create Users
    const usersData = [
      {
        name: 'Eleanor Vance',
        username: 'eleanor',
        email: 'admin@connectsphere.com',
        password: 'AdminPass123!',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        bio: 'Platform Administrator & VP of Engineering at ConnectSphere.',
        role: 'admin',
        status: 'available',
      },
      {
        name: 'Alex Morgan',
        username: 'alexm',
        email: 'alex@connectsphere.com',
        password: 'UserPass123!',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: 'Staff Distributed Systems Architect. Building scalable WebSocket pipelines.',
        role: 'user',
        status: 'available',
      },
      {
        name: 'Sarah Jenkins',
        username: 'sarahj',
        email: 'sarah@connectsphere.com',
        password: 'UserPass123!',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
        bio: 'Principal Product Designer. Passionate about typography, dark modes, and micro-interactions.',
        role: 'user',
        status: 'available',
      },
      {
        name: 'Marcus Brody',
        username: 'marcusb',
        email: 'marcus@connectsphere.com',
        password: 'UserPass123!',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        bio: 'Lead SRE & Kubernetes Captain. Monitoring high-availability clusters.',
        role: 'user',
        status: 'busy',
      },
      {
        name: 'Dr. Elena Rostova',
        username: 'elena_r',
        email: 'elena@connectsphere.com',
        password: 'UserPass123!',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        bio: 'AI & NLP Specialist. Integrating low-latency contextual intelligence.',
        role: 'user',
        status: 'away',
      },
      {
        name: 'David Kim',
        username: 'davidk',
        email: 'david@connectsphere.com',
        password: 'UserPass123!',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        bio: 'Director of Product Management. Turning complex requirements into elegant solutions.',
        role: 'user',
        status: 'offline',
      },
    ];

    const createdUsers = await User.create(usersData);
    const [admin, alex, sarah, marcus, elena, david] = createdUsers;
    console.log(`[Seeder] Created ${createdUsers.length} seed users.`);

    // 2. Create 1-to-1 Conversation between Alex and Sarah
    const directChat1 = await Conversation.create({
      participants: [alex._id, sarah._id],
      isGroup: false,
      unreadCounts: {
        [alex._id.toString()]: 0,
        [sarah._id.toString()]: 0,
      },
    });

    const msg1_1 = await Message.create({
      sender: sarah._id,
      conversation: directChat1._id,
      content: 'Hey Alex! Have you reviewed the new dark glassmorphic design system tokens?',
      messageType: 'text',
      readBy: [{ user: sarah._id, readAt: new Date(Date.now() - 3600000) }, { user: alex._id, readAt: new Date(Date.now() - 3000000) }],
      reactions: [{ user: alex._id, emoji: '👍', createdAt: new Date() }],
    });

    const msg1_2 = await Message.create({
      sender: alex._id,
      conversation: directChat1._id,
      content: 'Yes! The charcoal contrast ratios and royal-blue accents look outstanding. The message bubbles have perfect elevation.',
      replyTo: msg1_1._id,
      messageType: 'text',
      readBy: [{ user: alex._id, readAt: new Date(Date.now() - 2800000) }, { user: sarah._id, readAt: new Date(Date.now() - 2500000) }],
      reactions: [{ user: sarah._id, emoji: '❤️', createdAt: new Date() }],
    });

    const msg1_3 = await Message.create({
      sender: sarah._id,
      conversation: directChat1._id,
      content: 'I also packaged the Figma export documentation. Let me know if the font scale works across all breakpoints.',
      messageType: 'text',
      readBy: [{ user: sarah._id, readAt: new Date(Date.now() - 1800000) }, { user: alex._id, readAt: new Date(Date.now() - 1200000) }],
    });

    const msg1_4 = await Message.create({
      sender: alex._id,
      conversation: directChat1._id,
      content: 'Socket latency benchmark shows under 18ms round-trip with real-time presence. The app is incredibly responsive!',
      messageType: 'text',
      readBy: [{ user: alex._id, readAt: new Date(Date.now() - 600000) }],
    });

    directChat1.lastMessage = msg1_4._id;
    await directChat1.save();

    // 3. Create 1-to-1 Conversation between Admin and Alex
    const directChat2 = await Conversation.create({
      participants: [admin._id, alex._id],
      isGroup: false,
      unreadCounts: {
        [admin._id.toString()]: 0,
        [alex._id.toString()]: 0,
      },
    });

    const msg2_1 = await Message.create({
      sender: admin._id,
      conversation: directChat2._id,
      content: 'Alex, could you confirm when the real-time presence heartbeat and cluster telemetry are going live?',
      messageType: 'text',
      readBy: [{ user: admin._id, readAt: new Date(Date.now() - 7200000) }, { user: alex._id, readAt: new Date(Date.now() - 7000000) }],
    });

    const msg2_2 = await Message.create({
      sender: alex._id,
      conversation: directChat2._id,
      content: 'Everything is locked and verified. Rate limiters and security headers are active on all REST routes.',
      messageType: 'text',
      readBy: [{ user: alex._id, readAt: new Date(Date.now() - 6500000) }, { user: admin._id, readAt: new Date(Date.now() - 6000000) }],
      reactions: [{ user: admin._id, emoji: '🔥', createdAt: new Date() }],
    });

    directChat2.lastMessage = msg2_2._id;
    await directChat2.save();

    // 4. Create Group Conversation: Core Engineering Hub
    const engineeringGroup = await Conversation.create({
      participants: [admin._id, alex._id, sarah._id, marcus._id],
      isGroup: true,
      groupName: 'Core Engineering Hub',
      groupDescription: 'Architecture, WebSocket throughput, database indexes, and cloud infrastructure.',
      groupImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&q=80',
      groupAdmin: admin._id,
      unreadCounts: {
        [admin._id.toString()]: 0,
        [alex._id.toString()]: 0,
        [sarah._id.toString()]: 0,
        [marcus._id.toString()]: 0,
      },
    });

    const groupMsg1 = await Message.create({
      sender: admin._id,
      conversation: engineeringGroup._id,
      content: 'Welcome team to the ConnectSphere Core Engineering command room!',
      messageType: 'text',
      readBy: [
        { user: admin._id, readAt: new Date() },
        { user: alex._id, readAt: new Date() },
        { user: sarah._id, readAt: new Date() },
      ],
      reactions: [
        { user: alex._id, emoji: '🚀', createdAt: new Date() },
        { user: sarah._id, emoji: '🎉', createdAt: new Date() },
      ],
    });

    const groupMsg2 = await Message.create({
      sender: marcus._id,
      conversation: engineeringGroup._id,
      content: 'Kubernetes cluster health check: all pods healthy, zero memory leak on socket channels.',
      messageType: 'text',
      readBy: [
        { user: marcus._id, readAt: new Date() },
        { user: alex._id, readAt: new Date() },
      ],
      reactions: [{ user: admin._id, emoji: '👏', createdAt: new Date() }],
    });

    const groupMsg3 = await Message.create({
      sender: sarah._id,
      conversation: engineeringGroup._id,
      content: 'I uploaded the high-res architectural infographic and UI design assets. All accessible contrast compliant.',
      messageType: 'image',
      attachments: [
        {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          name: 'ConnectSphere_Modern_UI_Theme.jpg',
          size: 245000,
          type: 'image/jpeg',
        },
      ],
      readBy: [{ user: sarah._id, readAt: new Date() }],
    });

    engineeringGroup.lastMessage = groupMsg3._id;
    await engineeringGroup.save();

    // 5. Create Group Conversation: Product & UX Guild
    const productGuild = await Conversation.create({
      participants: [sarah._id, david._id, alex._id],
      isGroup: true,
      groupName: 'Product & UX Guild',
      groupDescription: 'User testing feedback, interface polish, and roadmap planning.',
      groupImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=200&q=80',
      groupAdmin: sarah._id,
      unreadCounts: {
        [sarah._id.toString()]: 0,
        [david._id.toString()]: 0,
        [alex._id.toString()]: 0,
      },
    });

    const guildMsg = await Message.create({
      sender: sarah._id,
      conversation: productGuild._id,
      content: 'User feedback from alpha testers: 98% rated the real-time speed and dark theme as phenomenal.',
      messageType: 'text',
      readBy: [{ user: sarah._id, readAt: new Date() }],
      reactions: [{ user: david._id, emoji: '🔥', createdAt: new Date() }],
    });

    productGuild.lastMessage = guildMsg._id;
    await productGuild.save();

    // 6. Create Seed Moderation Report
    await Report.create({
      reporter: alex._id,
      reportedUser: david._id,
      reason: 'spam',
      description: 'Repeated test notifications during automated load testing.',
      status: 'pending',
    });

    console.log('[Seeder] Database successfully seeded with rich mock data!');
    console.log('------------------------------------------------------------');
    console.log('DEMO ACCOUNTS READY:');
    console.log('1. Admin:   admin@connectsphere.com   | AdminPass123!');
    console.log('2. User:    alex@connectsphere.com    | UserPass123!');
    console.log('3. User:    sarah@connectsphere.com   | UserPass123!');
    console.log('4. User:    marcus@connectsphere.com  | UserPass123!');
    console.log('------------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
