class Profile {
  final String id;
  final String userId;
  final String name;
  final String? email;
  final String? avatarUrl;
  final String? bio;
  final String? dateOfBirth;
  final String? gender;
  final String? location;
  final String? occupation;
  final String? education;
  final String? height;
  final String? community;
  final String? sect;
  final String? gotra;
  final String? dietaryPreference;
  final String? chauviharLevel;
  final String? templeFrequency;
  final int jainRating;
  final List<String> photos;
  final int mainPhotoIndex;
  final List<String> interests;
  final List<PromptAnswer> prompts;
  final bool isVerified;
  final bool onboardingCompleted;
  final int? matchScore;

  Profile({
    required this.id,
    required this.userId,
    required this.name,
    this.email,
    this.avatarUrl,
    this.bio,
    this.dateOfBirth,
    this.gender,
    this.location,
    this.occupation,
    this.education,
    this.height,
    this.community,
    this.sect,
    this.gotra,
    this.dietaryPreference,
    this.chauviharLevel,
    this.templeFrequency,
    this.jainRating = 0,
    this.photos = const [],
    this.mainPhotoIndex = 0,
    this.interests = const [],
    this.prompts = const [],
    this.isVerified = false,
    this.onboardingCompleted = false,
    this.matchScore,
  });

  String get mainPhoto =>
      photos.isNotEmpty ? photos[mainPhotoIndex.clamp(0, photos.length - 1)] : '';

  int? get age {
    if (dateOfBirth == null) return null;
    final dob = DateTime.tryParse(dateOfBirth!);
    if (dob == null) return null;
    final now = DateTime.now();
    int age = now.year - dob.year;
    if (now.month < dob.month ||
        (now.month == dob.month && now.day < dob.day)) {
      age--;
    }
    return age;
  }

  factory Profile.fromMap(Map<String, dynamic> map) {
    final promptsList = (map['prompts'] as List<dynamic>?)
            ?.map((p) => PromptAnswer.fromMap(p as Map<String, dynamic>))
            .toList() ??
        [];

    return Profile(
      id: map['id'] ?? '',
      userId: map['user_id'] ?? '',
      name: map['name'] ?? '',
      email: map['email'],
      avatarUrl: map['avatar_url'],
      bio: map['bio'],
      dateOfBirth: map['date_of_birth'],
      gender: map['gender'],
      location: map['location'],
      occupation: map['occupation'],
      education: map['education'],
      height: map['height'],
      community: map['community'],
      sect: map['sect'],
      gotra: map['gotra'],
      dietaryPreference: map['dietary_preference'],
      chauviharLevel: map['chauvihar_level'],
      templeFrequency: map['temple_frequency'],
      jainRating: map['jain_rating'] ?? 0,
      photos: List<String>.from(map['photos'] ?? []),
      mainPhotoIndex: map['main_photo_index'] ?? 0,
      interests: List<String>.from(map['interests'] ?? []),
      prompts: promptsList,
      isVerified: map['is_verified'] ?? false,
      onboardingCompleted: map['onboarding_completed'] ?? false,
      matchScore: map['match_score'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'email': email,
      'avatar_url': avatarUrl,
      'bio': bio,
      'date_of_birth': dateOfBirth,
      'gender': gender,
      'location': location,
      'occupation': occupation,
      'education': education,
      'height': height,
      'community': community,
      'sect': sect,
      'gotra': gotra,
      'dietary_preference': dietaryPreference,
      'chauvihar_level': chauviharLevel,
      'temple_frequency': templeFrequency,
      'jain_rating': jainRating,
      'photos': photos,
      'main_photo_index': mainPhotoIndex,
      'interests': interests,
      'prompts': prompts.map((p) => p.toMap()).toList(),
      'is_verified': isVerified,
      'onboarding_completed': onboardingCompleted,
    };
  }
}

class PromptAnswer {
  final String question;
  final String answer;

  PromptAnswer({required this.question, required this.answer});

  factory PromptAnswer.fromMap(Map<String, dynamic> map) {
    return PromptAnswer(
      question: map['question'] ?? '',
      answer: map['answer'] ?? '',
    );
  }

  Map<String, dynamic> toMap() => {'question': question, 'answer': answer};
}

class Conversation {
  final String id;
  final String participant1Id;
  final String participant2Id;
  final DateTime? lastMessageAt;
  final String? otherUserName;
  final String? otherUserAvatar;
  final String? otherUserId;
  final String? lastMessageContent;
  final int unreadCount;

  Conversation({
    required this.id,
    required this.participant1Id,
    required this.participant2Id,
    this.lastMessageAt,
    this.otherUserName,
    this.otherUserAvatar,
    this.otherUserId,
    this.lastMessageContent,
    this.unreadCount = 0,
  });
}

class Message {
  final String id;
  final String conversationId;
  final String senderId;
  final String? content;
  final String? mediaUrl;
  final String? mediaType;
  final bool isRead;
  final DateTime createdAt;

  Message({
    required this.id,
    required this.conversationId,
    required this.senderId,
    this.content,
    this.mediaUrl,
    this.mediaType,
    this.isRead = false,
    required this.createdAt,
  });

  factory Message.fromMap(Map<String, dynamic> map) {
    return Message(
      id: map['id'] ?? '',
      conversationId: map['conversation_id'] ?? '',
      senderId: map['sender_id'] ?? '',
      content: map['content'],
      mediaUrl: map['media_url'],
      mediaType: map['media_type'],
      isRead: map['is_read'] ?? false,
      createdAt: DateTime.parse(map['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class Like {
  final String id;
  final String fromUserId;
  final String toUserId;
  final bool isSuperLike;
  final DateTime createdAt;
  final Profile? fromUser;
  final Profile? toUser;

  Like({
    required this.id,
    required this.fromUserId,
    required this.toUserId,
    this.isSuperLike = false,
    required this.createdAt,
    this.fromUser,
    this.toUser,
  });
}

class Match {
  final String id;
  final String user1Id;
  final String user2Id;
  final DateTime matchedAt;
  final Profile? otherUser;

  Match({
    required this.id,
    required this.user1Id,
    required this.user2Id,
    required this.matchedAt,
    this.otherUser,
  });
}

class CallHistoryEntry {
  final String id;
  final String callerId;
  final String calleeId;
  final String conversationId;
  final String callType;
  final String status;
  final DateTime? startedAt;
  final DateTime? endedAt;
  final int durationSeconds;
  final DateTime createdAt;
  final bool isOutgoing;
  final Profile? otherUser;

  CallHistoryEntry({
    required this.id,
    required this.callerId,
    required this.calleeId,
    required this.conversationId,
    this.callType = 'video',
    required this.status,
    this.startedAt,
    this.endedAt,
    this.durationSeconds = 0,
    required this.createdAt,
    this.isOutgoing = false,
    this.otherUser,
  });
}
