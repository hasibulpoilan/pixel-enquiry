// Seed data matching a typical mobile shop setup
export const DEFAULT_DATA = {
    settings: {
        companyName: "Pixel Solution",
        tagline: "Your Digital Destination",
        logo: "",
        whatsappNumber: "918240017974",
        email: "pixelsolutionagency@gmail.com",
        phone: "+91 82400 17974",
    },
    categories: [
        { id: "cat-1", name: "Oppo", enabled: true },
        { id: "cat-2", name: "Samsung", enabled: true },
        { id: "cat-3", name: "iPhone", enabled: true },
    ],
    products: [
        { id: "p1", categoryId: "cat-1", name: "Oppo A18", price: 9000, image: "", images: [], description: ["6 GB RAM | 128 GB Storage", "Dimensity 6300 Octa-Core Processor", "50 MP AI Rear Camera", "5000 mAh Battery"], enabled: true },
        { id: "p2", categoryId: "cat-1", name: "Oppo A58", price: 15000, image: "", images: [], description: ["8 GB RAM | 128 GB Storage", "Snapdragon 680 Processor", "64 MP Main Camera", "5000 mAh Battery with 33W Fast Charge"], enabled: true },
        { id: "p3", categoryId: "cat-1", name: "Oppo Reno 11", price: 31000, image: "", images: [], description: ["8 GB RAM | 256 GB Storage", "MediaTek Dimensity 6080 Processor", "64 MP Triple Camera Setup", "4600 mAh with 67W SUPERVOOC Charging"], enabled: true },
        { id: "p4", categoryId: "cat-2", name: "Samsung Galaxy A15", price: 12000, image: "", images: [], description: ["4 GB RAM | 128 GB Storage", "MediaTek Helio G99 Processor", "50 MP Triple Camera", "5000 mAh Battery"], enabled: true },
        { id: "p5", categoryId: "cat-2", name: "Samsung Galaxy S23", price: 52000, image: "", images: [], description: ["8 GB RAM | 128 GB Storage", "Snapdragon 8 Gen 2 Processor", "50 MP Main + 12 MP Ultra Wide Camera", "3900 mAh with 25W Fast Charging"], enabled: true },
        { id: "p6", categoryId: "cat-3", name: "iPhone 14", price: 79900, image: "", images: [], description: ["6 GB RAM | 128 GB Storage", "Apple A15 Bionic Chip", "12 MP Dual Camera System", "3279 mAh Battery with MagSafe"], enabled: true },
        { id: "p7", categoryId: "cat-3", name: "iPhone 15 Pro", price: 134900, image: "", images: [], description: ["8 GB RAM | 256 GB Storage", "Apple A17 Pro Chip", "48 MP Triple Camera System with 5x Optical Zoom", "3274 mAh with 27W Fast Charging + MagSafe"], enabled: true },
    ],
};
