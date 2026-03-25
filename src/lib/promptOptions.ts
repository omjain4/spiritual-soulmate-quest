// Hinge-style prompt options for the Jain Jodi app
// Users can pick up to 3 prompts and write their answers

export const MAX_PROMPTS = 3;

export interface PromptOption {
    id: string;
    question: string;
    category: string;
    emoji: string;
}

export const PROMPT_CATEGORIES = [
    { id: "about-me", label: "About Me", emoji: "✨" },
    { id: "dating", label: "Dating & Relationships", emoji: "💕" },
    { id: "spiritual", label: "Spiritual & Values", emoji: "🙏" },
    { id: "lifestyle", label: "Lifestyle", emoji: "🌿" },
    { id: "fun", label: "Fun & Quirky", emoji: "🎉" },
    { id: "deep", label: "Deep & Thoughtful", emoji: "💭" },
];

export const PROMPT_OPTIONS: PromptOption[] = [
    // About Me
    { id: "simple-pleasures", question: "A life goal of mine is...", category: "about-me", emoji: "🎯" },
    { id: "believe-in", question: "I'm convinced that...", category: "about-me", emoji: "💡" },
    { id: "typical-sunday", question: "My typical Sunday looks like...", category: "about-me", emoji: "☀️" },
    { id: "fun-fact", question: "A fun fact about me is...", category: "about-me", emoji: "🤓" },
    { id: "best-quality", question: "My best quality is...", category: "about-me", emoji: "⭐" },
    { id: "geek-out", question: "I geek out on...", category: "about-me", emoji: "🤩" },
    { id: "hidden-talent", question: "My hidden talent is...", category: "about-me", emoji: "🎪" },

    // Dating & Relationships
    { id: "looking-for", question: "I'm looking for someone who...", category: "dating", emoji: "💖" },
    { id: "together-we", question: "Together, we could...", category: "dating", emoji: "🤝" },
    { id: "win-me-over", question: "The way to win me over is...", category: "dating", emoji: "🏆" },
    { id: "perfect-date", question: "My ideal first date would be...", category: "dating", emoji: "🌹" },
    { id: "love-language", question: "My love language is...", category: "dating", emoji: "💝" },
    { id: "dealbreaker", question: "My non-negotiable in a partner is...", category: "dating", emoji: "🚩" },
    { id: "green-flag", question: "The biggest green flag is when...", category: "dating", emoji: "🟢" },

    // Spiritual & Values
    { id: "fav-tirth", question: "My favorite Tirth is...", category: "spiritual", emoji: "🛕" },
    { id: "spiritual-practice", question: "My daily spiritual practice includes...", category: "spiritual", emoji: "🧘" },
    { id: "jain-value", question: "The Jain value I live by most is...", category: "spiritual", emoji: "☸️" },
    { id: "temple-memory", question: "My most memorable temple experience was...", category: "spiritual", emoji: "🕉️" },
    { id: "family-tradition", question: "A family tradition I cherish is...", category: "spiritual", emoji: "👨‍👩‍👧‍👦" },
    { id: "value-dear", question: "A value I hold dear is...", category: "spiritual", emoji: "💎" },
    { id: "paryushan", question: "During Paryushan, I...", category: "spiritual", emoji: "📿" },

    // Lifestyle
    { id: "cooking", question: "My signature dish is...", category: "lifestyle", emoji: "👨‍🍳" },
    { id: "travel-dream", question: "My dream travel destination is...", category: "lifestyle", emoji: "✈️" },
    { id: "weekend-plans", question: "My perfect weekend involves...", category: "lifestyle", emoji: "🎉" },
    { id: "fitness", question: "To stay healthy, I...", category: "lifestyle", emoji: "💪" },
    { id: "comfort-food", question: "My go-to comfort food is...", category: "lifestyle", emoji: "🍲" },
    { id: "morning-routine", question: "My morning routine starts with...", category: "lifestyle", emoji: "🌅" },

    // Fun & Quirky
    { id: "unpopular-opinion", question: "An unpopular opinion I have is...", category: "fun", emoji: "🔥" },
    { id: "never-shutup", question: "I'll never shut up about...", category: "fun", emoji: "📢" },
    { id: "worst-idea", question: "The worst idea I've ever had was...", category: "fun", emoji: "😅" },
    { id: "guilty-pleasure", question: "My guilty pleasure is...", category: "fun", emoji: "🍫" },
    { id: "useless-skill", question: "My most useless skill is...", category: "fun", emoji: "🎭" },

    // Deep & Thoughtful
    { id: "grateful-for", question: "I'm most grateful for...", category: "deep", emoji: "🙏" },
    { id: "changed-perspective", question: "Something that changed my perspective was...", category: "deep", emoji: "🔄" },
    { id: "lesson-learned", question: "The best lesson I've learned is...", category: "deep", emoji: "📖" },
    { id: "define-success", question: "I define success as...", category: "deep", emoji: "🏅" },
    { id: "meaningful-cause", question: "A cause I care deeply about is...", category: "deep", emoji: "❤️" },
];

// Helper to get prompt question by ID
export const getPromptQuestion = (id: string): string => {
    return PROMPT_OPTIONS.find(p => p.id === id)?.question || id;
};
