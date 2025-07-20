// Mock database for Vercel deployment without a real database
// This uses in-memory storage for demo purposes

interface User {
  id: string;
  createdAt: Date;
  lastActive: Date;
}

interface Course {
  id: string;
  title: string;
  topic: string;
  createdAt: Date;
}

interface UserCourse {
  id: string;
  userId: string;
  courseId: string;
  startedAt: Date;
  completedAt?: Date;
  currentXP: number;
}

interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  knowledgeProb: number;
  correctAttempts: number;
  totalAttempts: number;
  lastReviewedAt: Date;
  nextReviewAt: Date;
  intervalDays: number;
  easeFactor: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

// In-memory storage
const storage = {
  users: new Map<string, User>(),
  courses: new Map<string, Course>(),
  userCourses: new Map<string, UserCourse>(),
  userSkills: new Map<string, UserSkill>(),
  achievements: new Map<string, Achievement>(),
  userAchievements: new Map<string, UserAchievement>(),
};

// Initialize with default achievements
const defaultAchievements: Achievement[] = [
  { id: 'first-step', name: 'First Step', description: 'Complete your first lesson', icon: '🎯', xpReward: 50 },
  { id: 'streak-3', name: 'Consistent Learner', description: 'Maintain a 3-day streak', icon: '🔥', xpReward: 100 },
  { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', xpReward: 250 },
  { id: 'master-skill', name: 'Skill Master', description: 'Master your first skill', icon: '🏆', xpReward: 200 },
  { id: 'perfect-score', name: 'Perfect Score', description: 'Answer 5 questions correctly in a row', icon: '💯', xpReward: 150 },
];

defaultAchievements.forEach(a => storage.achievements.set(a.id, a));

// Mock Prisma client interface
export const db = {
  user: {
    create: async ({ data }: any) => {
      const user = {
        id: data.id || `user-${Date.now()}`,
        createdAt: new Date(),
        lastActive: new Date(),
      };
      storage.users.set(user.id, user);
      return user;
    },
    findUnique: async ({ where }: any) => {
      return storage.users.get(where.id) || null;
    },
    update: async ({ where, data }: any) => {
      const user = storage.users.get(where.id);
      if (!user) throw new Error('User not found');
      const updated = { ...user, ...data, lastActive: new Date() };
      storage.users.set(where.id, updated);
      return updated;
    },
  },
  
  course: {
    create: async ({ data }: any) => {
      const course = {
        id: data.id,
        title: data.title,
        topic: data.topic,
        createdAt: new Date(),
      };
      storage.courses.set(course.id, course);
      return course;
    },
    findUnique: async ({ where }: any) => {
      return storage.courses.get(where.id) || null;
    },
  },
  
  userCourse: {
    create: async ({ data }: any) => {
      const userCourse = {
        id: `uc-${Date.now()}`,
        userId: data.userId,
        courseId: data.courseId,
        startedAt: new Date(),
        completedAt: data.completedAt || undefined,
        currentXP: data.currentXP || 0,
      };
      storage.userCourses.set(userCourse.id, userCourse);
      return userCourse;
    },
    findMany: async ({ where }: any) => {
      return Array.from(storage.userCourses.values()).filter(uc => 
        (!where.userId || uc.userId === where.userId) &&
        (!where.courseId || uc.courseId === where.courseId)
      );
    },
  },
  
  userSkill: {
    create: async ({ data }: any) => {
      const userSkill = {
        id: `us-${Date.now()}`,
        userId: data.userId,
        skillId: data.skillId,
        knowledgeProb: data.knowledgeProb || 0.3,
        correctAttempts: data.correctAttempts || 0,
        totalAttempts: data.totalAttempts || 0,
        lastReviewedAt: new Date(),
        nextReviewAt: new Date(),
        intervalDays: data.intervalDays || 1,
        easeFactor: data.easeFactor || 2.5,
      };
      storage.userSkills.set(userSkill.id, userSkill);
      return userSkill;
    },
    findFirst: async ({ where }: any) => {
      return Array.from(storage.userSkills.values()).find(us =>
        us.userId === where.userId && us.skillId === where.skillId
      ) || null;
    },
    update: async ({ where, data }: any) => {
      const skills = Array.from(storage.userSkills.values());
      const skill = skills.find(us =>
        us.userId === where.userId_skillId.userId && 
        us.skillId === where.userId_skillId.skillId
      );
      if (!skill) throw new Error('Skill not found');
      const updated = { ...skill, ...data };
      storage.userSkills.set(skill.id, updated);
      return updated;
    },
    findMany: async ({ where }: any) => {
      return Array.from(storage.userSkills.values()).filter(us =>
        !where.userId || us.userId === where.userId
      );
    },
  },
  
  achievement: {
    findMany: async () => {
      return Array.from(storage.achievements.values());
    },
    createMany: async ({ data }: any) => {
      data.forEach((a: Achievement) => {
        storage.achievements.set(a.id, a);
      });
      return { count: data.length };
    },
  },
  
  userAchievement: {
    create: async ({ data }: any) => {
      const userAchievement = {
        id: `ua-${Date.now()}`,
        userId: data.userId,
        achievementId: data.achievementId,
        unlockedAt: new Date(),
      };
      storage.userAchievements.set(userAchievement.id, userAchievement);
      return userAchievement;
    },
    findMany: async ({ where, include }: any) => {
      const userAchievements = Array.from(storage.userAchievements.values())
        .filter(ua => !where.userId || ua.userId === where.userId);
      
      if (include?.achievement) {
        return userAchievements.map(ua => ({
          ...ua,
          achievement: storage.achievements.get(ua.achievementId),
        }));
      }
      
      return userAchievements;
    },
  },
  
  // Helper to clear all data (for testing)
  $reset: async () => {
    storage.users.clear();
    storage.courses.clear();
    storage.userCourses.clear();
    storage.userSkills.clear();
    storage.userAchievements.clear();
    // Re-add default achievements
    defaultAchievements.forEach(a => storage.achievements.set(a.id, a));
  },
};