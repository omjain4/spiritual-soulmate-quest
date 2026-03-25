const int maxPrompts = 3;

class PromptOption {
  final String id;
  final String question;
  final String category;
  final String emoji;

  const PromptOption({
    required this.id,
    required this.question,
    required this.category,
    required this.emoji,
  });
}

const promptCategories = [
  {'id': 'about-me', 'label': 'About Me', 'emoji': '✨'},
  {'id': 'dating', 'label': 'Dating & Relationships', 'emoji': '💕'},
  {'id': 'spiritual', 'label': 'Spiritual & Values', 'emoji': '🙏'},
  {'id': 'lifestyle', 'label': 'Lifestyle', 'emoji': '🌿'},
  {'id': 'fun', 'label': 'Fun & Quirky', 'emoji': '🎉'},
  {'id': 'deep', 'label': 'Deep & Thoughtful', 'emoji': '💭'},
];

const promptOptions = [
  PromptOption(id: 'simple-pleasures', question: 'A life goal of mine is...', category: 'about-me', emoji: '🎯'),
  PromptOption(id: 'believe-in', question: "I'm convinced that...", category: 'about-me', emoji: '💡'),
  PromptOption(id: 'typical-sunday', question: 'My typical Sunday looks like...', category: 'about-me', emoji: '☀️'),
  PromptOption(id: 'fun-fact', question: 'A fun fact about me is...', category: 'about-me', emoji: '🤓'),
  PromptOption(id: 'best-quality', question: 'My best quality is...', category: 'about-me', emoji: '⭐'),
  PromptOption(id: 'geek-out', question: 'I geek out on...', category: 'about-me', emoji: '🤩'),
  PromptOption(id: 'hidden-talent', question: 'My hidden talent is...', category: 'about-me', emoji: '🎪'),
  PromptOption(id: 'looking-for', question: "I'm looking for someone who...", category: 'dating', emoji: '💖'),
  PromptOption(id: 'together-we', question: 'Together, we could...', category: 'dating', emoji: '🤝'),
  PromptOption(id: 'win-me-over', question: 'The way to win me over is...', category: 'dating', emoji: '🏆'),
  PromptOption(id: 'perfect-date', question: 'My ideal first date would be...', category: 'dating', emoji: '🌹'),
  PromptOption(id: 'love-language', question: 'My love language is...', category: 'dating', emoji: '💝'),
  PromptOption(id: 'dealbreaker', question: 'My non-negotiable in a partner is...', category: 'dating', emoji: '🚩'),
  PromptOption(id: 'green-flag', question: 'The biggest green flag is when...', category: 'dating', emoji: '🟢'),
  PromptOption(id: 'fav-tirth', question: 'My favorite Tirth is...', category: 'spiritual', emoji: '🛕'),
  PromptOption(id: 'spiritual-practice', question: 'My daily spiritual practice includes...', category: 'spiritual', emoji: '🧘'),
  PromptOption(id: 'jain-value', question: 'The Jain value I live by most is...', category: 'spiritual', emoji: '☸️'),
  PromptOption(id: 'temple-memory', question: 'My most memorable temple experience was...', category: 'spiritual', emoji: '🕉️'),
  PromptOption(id: 'family-tradition', question: 'A family tradition I cherish is...', category: 'spiritual', emoji: '👨‍👩‍👧‍👦'),
  PromptOption(id: 'value-dear', question: 'A value I hold dear is...', category: 'spiritual', emoji: '💎'),
  PromptOption(id: 'paryushan', question: 'During Paryushan, I...', category: 'spiritual', emoji: '📿'),
  PromptOption(id: 'cooking', question: 'My signature dish is...', category: 'lifestyle', emoji: '👨‍🍳'),
  PromptOption(id: 'travel-dream', question: 'My dream travel destination is...', category: 'lifestyle', emoji: '✈️'),
  PromptOption(id: 'weekend-plans', question: 'My perfect weekend involves...', category: 'lifestyle', emoji: '🎉'),
  PromptOption(id: 'fitness', question: 'To stay healthy, I...', category: 'lifestyle', emoji: '💪'),
  PromptOption(id: 'comfort-food', question: 'My go-to comfort food is...', category: 'lifestyle', emoji: '🍲'),
  PromptOption(id: 'morning-routine', question: 'My morning routine starts with...', category: 'lifestyle', emoji: '🌅'),
  PromptOption(id: 'unpopular-opinion', question: 'An unpopular opinion I have is...', category: 'fun', emoji: '🔥'),
  PromptOption(id: 'never-shutup', question: "I'll never shut up about...", category: 'fun', emoji: '📢'),
  PromptOption(id: 'worst-idea', question: "The worst idea I've ever had was...", category: 'fun', emoji: '😅'),
  PromptOption(id: 'guilty-pleasure', question: 'My guilty pleasure is...', category: 'fun', emoji: '🍫'),
  PromptOption(id: 'useless-skill', question: 'My most useless skill is...', category: 'fun', emoji: '🎭'),
  PromptOption(id: 'grateful-for', question: "I'm most grateful for...", category: 'deep', emoji: '🙏'),
  PromptOption(id: 'changed-perspective', question: 'Something that changed my perspective was...', category: 'deep', emoji: '🔄'),
  PromptOption(id: 'lesson-learned', question: "The best lesson I've learned is...", category: 'deep', emoji: '📖'),
  PromptOption(id: 'define-success', question: 'I define success as...', category: 'deep', emoji: '🏅'),
  PromptOption(id: 'meaningful-cause', question: 'A cause I care deeply about is...', category: 'deep', emoji: '❤️'),
];

const sects = [
  {'id': 'digambar', 'title': 'Digambar', 'description': 'Sky-clad tradition', 'icon': '🕉️'},
  {'id': 'shwetambar-sthanakvasi', 'title': 'Shwetambar - Sthanakvasi', 'description': 'Non-idol worshipping', 'icon': '🙏'},
  {'id': 'shwetambar-murtipujak', 'title': 'Shwetambar - Murtipujak', 'description': 'Idol worshipping', 'icon': '🛕'},
  {'id': 'shwetambar-terapanthi', 'title': 'Shwetambar - Terapanthi', 'description': 'Reform movement', 'icon': '✨'},
];

const defaultInterests = [
  {'id': 'pilgrimage', 'label': 'Pilgrimage Enthusiast', 'emoji': '⛩️'},
  {'id': 'volunteer', 'label': 'Volunteer', 'emoji': '🤝'},
  {'id': 'vegan', 'label': 'Vegan', 'emoji': '🥬'},
  {'id': 'business', 'label': 'Business Background', 'emoji': '💼'},
  {'id': 'meditation', 'label': 'Meditation Practice', 'emoji': '🧘'},
  {'id': 'charity', 'label': 'Charity Focused', 'emoji': '🥰'},
  {'id': 'traditional', 'label': 'Traditional Values', 'emoji': '👥'},
  {'id': 'modern', 'label': 'Modern Outlook', 'emoji': '✨'},
  {'id': 'fitness', 'label': 'Fitness Enthusiast', 'emoji': '💪'},
  {'id': 'reader', 'label': 'Avid Reader', 'emoji': '📚'},
  {'id': 'travel', 'label': 'Travel Lover', 'emoji': '✈️'},
  {'id': 'music', 'label': 'Music Enthusiast', 'emoji': '🎵'},
];
