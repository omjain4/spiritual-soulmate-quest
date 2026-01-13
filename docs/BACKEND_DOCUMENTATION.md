# Jain Jodi - Backend Documentation

This document provides comprehensive documentation for the backend architecture of the Jain Jodi matrimonial platform.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)
4. [Database Functions](#database-functions)
5. [Real-Time Features](#real-time-features)
6. [Storage Buckets](#storage-buckets)
7. [Authentication](#authentication)
8. [API Usage Examples](#api-usage-examples)

---

## Architecture Overview

The backend is powered by **Lovable Cloud** (Supabase under the hood), providing:

- **PostgreSQL Database** - Relational database with full SQL support
- **Real-time Subscriptions** - WebSocket-based live updates for chat/calls
- **Row-Level Security** - Fine-grained access control at the database level
- **Edge Functions** - Serverless functions for custom backend logic
- **Storage** - File storage for media (chat attachments, profile photos)
- **Authentication** - Built-in auth with email/password support

### Technology Stack

| Layer | Technology |
|-------|------------|
| Database | PostgreSQL 14+ |
| API | PostgREST (auto-generated REST API) |
| Real-time | Supabase Realtime (WebSockets) |
| Auth | Supabase Auth (JWT-based) |
| Storage | Supabase Storage (S3-compatible) |
| Client SDK | @supabase/supabase-js |

---

## Database Schema

### Tables Overview

| Table | Description |
|-------|-------------|
| `profiles` | User profile information and preferences |
| `preferences` | Matchmaking preferences for each user |
| `likes` | Records of likes/super-likes between users |
| `matches` | Mutual matches between users |
| `conversations` | Chat conversations between matched users |
| `messages` | Individual chat messages |
| `typing_indicators` | Real-time typing status |
| `video_calls` | WebRTC video/audio call state |
| `call_history` | Record of past calls |
| `notifications` | In-app notifications |
| `saved_profiles` | Bookmarked/saved profiles |
| `skipped_profiles` | Passed/skipped profiles |
| `user_roles` | Admin/moderator role assignments |
| `reports` | User content reports for moderation |

---

### profiles

Stores all user profile information including Jain-specific attributes.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,           -- References auth.users
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  gender TEXT,                             -- 'male' | 'female'
  location TEXT,
  occupation TEXT,
  education TEXT,
  height TEXT,
  
  -- Jain-specific fields
  sect TEXT,                               -- 'digambar' | 'shwetambar-*'
  community TEXT,
  gotra TEXT,
  dietary_preference TEXT,                 -- 'vegan' | 'jain' | 'vegetarian'
  chauvihar_level TEXT DEFAULT 'sometimes',
  temple_frequency TEXT DEFAULT 'monthly',
  jain_rating INTEGER DEFAULT 0,           -- 0-100 spirituality score
  
  -- Profile data
  photos TEXT[] DEFAULT '{}',              -- Array of photo URLs
  main_photo_index INTEGER DEFAULT 0,
  interests TEXT[] DEFAULT '{}',           -- Array of interest IDs
  prompts JSONB DEFAULT '[]',              -- Array of {question, answer}
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  password_updated_at TIMESTAMPTZ
);
```

---

### preferences

User matchmaking preferences used by the recommendation engine.

```sql
CREATE TABLE public.preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Age preferences
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 50,
  
  -- Match preferences
  preferred_gender TEXT,                   -- 'male' | 'female' | null (any)
  preferred_sects TEXT[] DEFAULT '{}',
  preferred_communities TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  preferred_dietary TEXT[] DEFAULT '{}',
  
  -- Gotra exclusion
  gotra TEXT,
  exclude_gotra BOOLEAN DEFAULT true,      -- Exclude same gotra
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### likes

Records when a user likes or super-likes another user.

```sql
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL,              -- User who liked
  to_user_id UUID NOT NULL,                -- User who was liked
  is_super_like BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(from_user_id, to_user_id)
);
```

---

### matches

Created automatically when two users like each other (mutual like).

```sql
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL,                  -- Always LEAST(user_a, user_b)
  user2_id UUID NOT NULL,                  -- Always GREATEST(user_a, user_b)
  matched_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user1_id, user2_id)
);
```

---

### conversations

Represents a chat thread between two users.

```sql
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL,
  participant2_id UUID NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### messages

Individual chat messages with support for media attachments.

```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL,
  content TEXT,                            -- Text content (nullable for media-only)
  media_url TEXT,                          -- URL to attached media
  media_type TEXT,                         -- 'image' | 'video' | 'audio' | 'file'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### typing_indicators

Real-time typing status for chat.

```sql
CREATE TABLE public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  user_id UUID NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(conversation_id, user_id)
);
```

---

### video_calls

WebRTC signaling state for video/audio calls.

```sql
CREATE TABLE public.video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL,
  callee_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  call_type TEXT DEFAULT 'video',          -- 'video' | 'audio'
  status TEXT NOT NULL,                    -- 'pending' | 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed'
  
  -- WebRTC signaling data
  offer JSONB,                             -- RTCSessionDescription
  answer JSONB,                            -- RTCSessionDescription
  ice_candidates JSONB[] DEFAULT '{}',     -- Array of RTCIceCandidate
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,                  -- When call was answered
  ended_at TIMESTAMPTZ
);
```

---

### call_history

Persistent record of all calls for the Calls page.

```sql
CREATE TABLE public.call_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES video_calls(id),
  caller_id UUID NOT NULL,
  callee_id UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  call_type TEXT DEFAULT 'video',
  status TEXT NOT NULL,                    -- 'answered' | 'missed' | 'rejected'
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### notifications

In-app notification system.

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                   -- Recipient
  from_user_id UUID,                       -- Sender (optional)
  conversation_id UUID,                    -- Related conversation (optional)
  type TEXT NOT NULL,                      -- 'like' | 'super_like' | 'match' | 'message' | 'missed_call'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### user_roles

Role-based access control for admin features.

```sql
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, role)
);
```

**Assigning a user as admin (run via SQL Editor):**
```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('user-uuid-here', 'admin');
```

---

### reports

User-submitted reports for content moderation.

```sql
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,              -- User who filed the report
  reported_user_id UUID NOT NULL,         -- User being reported
  reason TEXT NOT NULL,                   -- Category of report
  description TEXT,                       -- Additional details
  status TEXT DEFAULT 'pending',          -- 'pending' | 'resolved' | 'dismissed'
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,                       -- Admin who resolved
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Row-Level Security (RLS) Policies

All tables have RLS enabled. Below are the key policies:

### profiles

| Policy | Command | Rule |
|--------|---------|------|
| Authenticated users can view profiles | SELECT | `auth.role() = 'authenticated'` |
| Users can insert own profile | INSERT | `auth.uid() = user_id` |
| Users can update own profile | UPDATE | `auth.uid() = user_id` |

### likes

| Policy | Command | Rule |
|--------|---------|------|
| Users can create likes | INSERT | `auth.uid() = from_user_id` |
| Users can view likes | SELECT | `auth.uid() IN (from_user_id, to_user_id)` |
| Users can delete own likes | DELETE | `auth.uid() = from_user_id` |

### messages

| Policy | Command | Rule |
|--------|---------|------|
| Users can send messages | INSERT | User is sender AND participant in conversation |
| Users can view messages | SELECT | User is participant in conversation |
| Users can update messages | UPDATE | User is participant in conversation |

### video_calls

| Policy | Command | Rule |
|--------|---------|------|
| Users can create calls | INSERT | `auth.uid() = caller_id` |
| Users can view own calls | SELECT | User is caller or callee |
| Users can update own calls | UPDATE | User is caller or callee |

### matches

| Policy | Command | Rule |
|--------|---------|------|
| Users can view own matches | SELECT | `auth.uid() IN (user1_id, user2_id)` |
| Users can delete own matches | DELETE | `auth.uid() IN (user1_id, user2_id)` |

### user_roles

| Policy | Command | Rule |
|--------|---------|------|
| Admins can view all roles | SELECT | `has_role(auth.uid(), 'admin')` |
| Admins can manage roles | ALL | `has_role(auth.uid(), 'admin')` |

### reports

| Policy | Command | Rule |
|--------|---------|------|
| Users can create reports | INSERT | `auth.uid() = reporter_id` |
| Users can view own reports | SELECT | `auth.uid() = reporter_id` |
| Admins can manage reports | ALL | `has_role(auth.uid(), 'admin')` |

---

## Database Functions

### calculate_match_score(viewer_id, target_id)

Calculates a compatibility score (0-100) between two users.

**Scoring criteria:**
- Age preference match: +15 points
- Location match: +10 points
- Sect match: +15 points
- Dietary preference match: +10 points
- Shared interests: up to +20 points (5 per match)
- Same gotra (with exclusion enabled): -50 points
- Verified profile: +5 points
- Jain rating similarity: up to +10 points

```sql
SELECT calculate_match_score(
  '550e8400-e29b-41d4-a716-446655440000',  -- viewer
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8'   -- target
);
-- Returns: 78
```

### get_recommended_profiles(current_user_id, limit_count)

Returns recommended profiles sorted by match score.

**Filters applied:**
- Excludes current user
- Excludes incomplete profiles
- Respects gender preferences
- Excludes already liked profiles
- Excludes already skipped profiles
- Excludes already matched profiles

```sql
SELECT * FROM get_recommended_profiles(
  '550e8400-e29b-41d4-a716-446655440000',
  20  -- limit
);
```

### check_and_create_match()

Trigger function that automatically creates a match when mutual likes occur.

### has_role(user_id, role)

Security definer function to check if a user has a specific role. Used in RLS policies to prevent infinite recursion.

```sql
SELECT has_role(auth.uid(), 'admin');
-- Returns: true/false
```

---

## Real-Time Features

The following tables are enabled for real-time subscriptions:

### Enabled Tables

- `messages` - New message notifications
- `typing_indicators` - Live typing status
- `video_calls` - Call state changes (ringing, answered, etc.)
- `notifications` - Real-time notification delivery

### Subscription Example

```typescript
// Subscribe to new messages
const channel = supabase
  .channel('messages-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();

// Subscribe to incoming calls
const callChannel = supabase
  .channel(`video-calls-${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'video_calls',
      filter: `callee_id=eq.${userId}`,
    },
    (payload) => {
      console.log('Incoming call:', payload.new);
    }
  )
  .subscribe();
```

---

## Storage Buckets

### chat-media

Stores chat attachments (images, videos, audio, files).

| Property | Value |
|----------|-------|
| Name | `chat-media` |
| Public | Yes |
| Max file size | 50MB |
| Allowed types | images, video, audio, documents |

**File naming convention:**
```
{user_id}/{timestamp}.{extension}
```

---

## Authentication

### Supported Methods

- Email/Password sign-up and sign-in
- Auto-confirm enabled (no email verification required)

### Session Management

JWT tokens with 1-hour expiry, auto-refreshed by the client SDK.

### User Creation Flow

1. User signs up via `supabase.auth.signUp()`
2. A profile record is created with `user_id` referencing `auth.users.id`
3. User completes onboarding to set `onboarding_completed = true`

---

## API Usage Examples

### Creating a Like

```typescript
const { error } = await supabase.from('likes').insert({
  from_user_id: currentUserId,
  to_user_id: targetUserId,
  is_super_like: false,
});
```

### Fetching Recommended Profiles

```typescript
const { data, error } = await supabase.rpc('get_recommended_profiles', {
  current_user_id: userId,
  limit_count: 20,
});
```

### Sending a Message

```typescript
const { error } = await supabase.from('messages').insert({
  conversation_id: conversationId,
  sender_id: userId,
  content: 'Hello!',
  media_url: null,
  media_type: null,
});
```

### Initiating a Video Call

```typescript
const { data, error } = await supabase
  .from('video_calls')
  .insert({
    caller_id: userId,
    callee_id: otherUserId,
    conversation_id: conversationId,
    status: 'ringing',
    call_type: 'video',
  })
  .select()
  .single();
```

### Uploading Media

```typescript
const { error: uploadError } = await supabase.storage
  .from('chat-media')
  .upload(`${userId}/${Date.now()}.jpg`, file);

const { data } = await supabase.storage
  .from('chat-media')
  .getPublicUrl(filePath);
```

---

## Security Considerations

1. **RLS is enforced on all tables** - Users can only access data they're authorized to see
2. **No direct auth.users access** - Profile data is stored separately with RLS
3. **Media access** - Chat media is publicly accessible by URL but URLs are only shared via secure message channels
4. **WebRTC signaling** - Call data (offer/answer/ICE) is only visible to call participants
5. **Input validation** - Zod schemas validate all user input before database operations

---

## Triggers

### Notification Triggers

| Trigger | Table | Event | Action |
|---------|-------|-------|--------|
| `create_like_notification` | likes | INSERT | Creates notification for like recipient |
| `create_match_notification` | matches | INSERT | Notifies both users of new match |
| `create_message_notification` | messages | INSERT | Notifies conversation partner of new message |

### Utility Triggers

| Trigger | Table | Event | Action |
|---------|-------|-------|--------|
| `update_updated_at_column` | profiles, preferences | UPDATE | Sets `updated_at` to current timestamp |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/public API key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

---

## Edge Functions

Edge functions are deployed automatically and run server-side:

### send-notification-email

Sends email notifications for important events (matches, messages when user is offline).

---

*Last updated: January 2026*
