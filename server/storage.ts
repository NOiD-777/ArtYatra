import { 
  type User, 
  type InsertUser,
  type ArtStyle,
  type InsertArtStyle,
  type Classification,
  type InsertClassification
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Art styles
  getAllArtStyles(): Promise<ArtStyle[]>;
  getArtStyleById(id: string): Promise<ArtStyle | undefined>;
  getArtStyleByName(name: string): Promise<ArtStyle | undefined>;
  createArtStyle(artStyle: InsertArtStyle): Promise<ArtStyle>;
  
  // Classifications
  createClassification(classification: InsertClassification): Promise<Classification>;
  getClassificationsByArtStyle(artStyleId: string): Promise<Classification[]>;
}

// Static art styles data
const staticArtStyles: ArtStyle[] = [
  {
    id: "warli-art-001",
    name: "Warli Art",
    originLocation: { lat: 19.0760, lng: 72.8777 },
    description: "Ancient tribal art form using geometric patterns in white pigment on mud walls, depicting daily life and nature.",
    funFacts: ["Over 3000 years old", "Uses rice paste and natural gum", "Traditionally painted by women"],
    imageUrl: null,
    culturalSignificance: "Sacred art form representing harmony between humans, animals, and nature in tribal communities.",
    state: "Maharashtra",
    createdAt: new Date()
  },
  {
    id: "pochampally-ikat-001",
    name: "Pochampally Ikat",
    originLocation: { lat: 17.3850, lng: 78.4867 },
    description: "Traditional tie-dye textile art creating intricate geometric patterns through resist dyeing technique.",
    funFacts: ["UNESCO protected craft", "Takes 3-4 months per saree", "Known as the Silk City of India"],
    imageUrl: null,
    culturalSignificance: "Royal patronage art form showcasing the weaving expertise passed down through generations.",
    state: "Telangana",
    createdAt: new Date()
  },
  {
    id: "thanjavur-painting-001",
    name: "Thanjavur Painting",
    originLocation: { lat: 10.7905, lng: 79.1378 },
    description: "Classical South Indian painting style featuring rich colors, gold foil work, and religious themes.",
    funFacts: ["Uses 22-carat gold foil", "Semi-precious stones embedded", "Maratha period origin"],
    imageUrl: null,
    culturalSignificance: "Sacred art form depicting Hindu deities, essential for temple decoration and spiritual practices.",
    state: "Tamil Nadu",
    createdAt: new Date()
  },
  {
    id: "madhubani-painting-001",
    name: "Madhubani Painting",
    originLocation: { lat: 26.3598, lng: 86.0661 },
    description: "Vibrant folk art from Bihar featuring nature and mythology themes using fingers, twigs, and matchsticks.",
    funFacts: ["Originally done on mud walls", "No blank spaces left", "Passed mother to daughter"],
    imageUrl: null,
    culturalSignificance: "Wedding and festival art form expressing folk beliefs and celebrating life events in rural communities.",
    state: "Bihar",
    createdAt: new Date()
  },
  {
    id: "kalamkari-001",
    name: "Kalamkari",
    originLocation: { lat: 15.9129, lng: 79.7400 },
    description: "Hand-painted textile art using natural dyes and depicting mythological stories and nature motifs.",
    funFacts: ["23-step process", "Uses bamboo pen", "Persian influence"],
    imageUrl: null,
    culturalSignificance: "Storytelling tradition through cloth, preserving ancient epics and connecting communities to their heritage.",
    state: "Andhra Pradesh",
    createdAt: new Date()
  },
  {
    id: "pattachitra-001",
    name: "Pattachitra",
    originLocation: { lat: 19.8135, lng: 85.0859 },
    description: "Traditional scroll painting from Odisha featuring mythological narratives with intricate details and vibrant colors.",
    funFacts: ["Cloth canvas preparation", "Natural stone colors", "No pencil sketches"],
    imageUrl: null,
    culturalSignificance: "Temple art form narrating Jagannath legends, integral to Odishan religious and cultural identity.",
    state: "Odisha",
    createdAt: new Date()
  },
  {
    id: "gond-art-001",
    name: "Gond Art",
    originLocation: { lat: 22.9734, lng: 78.6569 },
    description: "Tribal art form using dots and lines to create intricate patterns depicting folklore and nature.",
    funFacts: ["Signature dot technique", "Natural colors from earth", "Dreamtime stories"],
    imageUrl: null,
    culturalSignificance: "Spiritual connection to nature and ancestors, preserving tribal wisdom and environmental knowledge.",
    state: "Madhya Pradesh",
    createdAt: new Date()
  },
  {
    id: "pichwai-painting-001",
    name: "Pichwai Painting",
    originLocation: { lat: 24.5854, lng: 73.7125 },
    description: "Devotional art form depicting Lord Krishna, traditionally hung behind temple deities with seasonal themes.",
    funFacts: ["Nathdwara tradition", "Seasonal festivals depicted", "Intricate cloth work"],
    imageUrl: null,
    culturalSignificance: "Temple worship art expressing devotion to Krishna, marking religious festivals and seasonal celebrations.",
    state: "Rajasthan",
    createdAt: new Date()
  }
];

export class MemStorage implements IStorage {
  private users: User[] = [];
  private artStyles: ArtStyle[] = [...staticArtStyles];
  private classifications: Classification[] = [];
  private nextId = 1;

  private generateId(): string {
    return `id-${this.nextId++}`;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.generateId(),
      ...insertUser
    };
    this.users.push(user);
    return user;
  }

  async getAllArtStyles(): Promise<ArtStyle[]> {
    return [...this.artStyles];
  }

  async getArtStyleById(id: string): Promise<ArtStyle | undefined> {
    return this.artStyles.find(style => style.id === id);
  }

  async getArtStyleByName(name: string): Promise<ArtStyle | undefined> {
    return this.artStyles.find(style => style.name === name);
  }

  async createArtStyle(insertArtStyle: InsertArtStyle): Promise<ArtStyle> {
    const artStyle: ArtStyle = {
      id: this.generateId(),
      createdAt: new Date(),
      ...insertArtStyle
    };
    this.artStyles.push(artStyle);
    return artStyle;
  }

  async createClassification(insertClassification: InsertClassification): Promise<Classification> {
    const classification: Classification = {
      id: this.generateId(),
      createdAt: new Date(),
      ...insertClassification
    };
    this.classifications.push(classification);
    return classification;
  }

  async getClassificationsByArtStyle(artStyleId: string): Promise<Classification[]> {
    return this.classifications.filter(c => c.artStyleId === artStyleId);
  }
}

export const storage = new MemStorage();
