import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../core/theme.dart';
import '../core/supabase_client.dart';
import '../models/models.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});
  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  List<Map<String, dynamic>> _conversations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadConversations();
  }

  Future<void> _loadConversations() async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    try {
      final matchData = await supabase
          .from('matches')
          .select()
          .or('user1_id.eq.$userId,user2_id.eq.$userId');
          
      final matchedUserIds = (matchData as List).map((m) => 
          m['user1_id'] == userId ? m['user2_id'] : m['user1_id']
      ).toList();

      final data = await supabase
          .from('conversations')
          .select()
          .or('participant1_id.eq.$userId,participant2_id.eq.$userId')
          .order('last_message_at', ascending: false);

      final matchedConversations = (data as List).where((conv) {
        final otherId = conv['participant1_id'] == userId
            ? conv['participant2_id']
            : conv['participant1_id'];
        return matchedUserIds.contains(otherId);
      }).toList();

      final enriched = <Map<String, dynamic>>[];
      for (var conv in matchedConversations) {
        final otherId = conv['participant1_id'] == userId
            ? conv['participant2_id']
            : conv['participant1_id'];

        final profileData = await supabase
            .from('profiles')
            .select('name, photos, main_photo_index')
            .eq('user_id', otherId)
            .maybeSingle();

        final lastMsg = await supabase
            .from('messages')
            .select('content, created_at, sender_id, is_read')
            .eq('conversation_id', conv['id'])
            .order('created_at', ascending: false)
            .limit(1)
            .maybeSingle();

        final unreadCount = await supabase
            .from('messages')
            .select()
            .eq('conversation_id', conv['id'])
            .eq('is_read', false)
            .neq('sender_id', userId)
            .count();

        String? avatarUrl;
        if (profileData != null) {
          final photos = List<String>.from(profileData['photos'] ?? []);
          final mainIdx = profileData['main_photo_index'] ?? 0;
          avatarUrl = photos.isNotEmpty ? photos[mainIdx.clamp(0, photos.length - 1)] : null;
        }

        enriched.add({
          'id': conv['id'],
          'other_id': otherId,
          'other_name': profileData?['name'] ?? 'Unknown',
          'avatar_url': avatarUrl,
          'last_message': lastMsg?['content'],
          'last_message_time': lastMsg?['created_at'],
          'unread_count': unreadCount.count,
        });
      }

      setState(() {
        _conversations = enriched;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      debugPrint('Error loading conversations: $e');
    }
  }

  String _timeAgo(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    if (diff.inDays < 7) return '${diff.inDays}d';
    return '${(diff.inDays / 7).floor()}w';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Messages')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _conversations.isEmpty
              ? _buildEmpty()
              : RefreshIndicator(
                  onRefresh: _loadConversations,
                  child: ListView.builder(
                    itemCount: _conversations.length,
                    itemBuilder: (_, i) => _buildConversationTile(_conversations[i]),
                  ),
                ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(color: AppColors.muted, borderRadius: BorderRadius.circular(40)),
            child: const Icon(Icons.chat_bubble_outline, size: 40, color: AppColors.mutedForeground),
          ),
          const SizedBox(height: 16),
          Text('No conversations yet', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text('Match with someone to start chatting!',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground)),
        ],
      ),
    );
  }

  Widget _buildConversationTile(Map<String, dynamic> conv) {
    final unread = conv['unread_count'] ?? 0;
    return InkWell(
      onTap: () => context.go('/chat/${conv['id']}'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            CircleAvatar(
              radius: 26,
              backgroundImage: conv['avatar_url'] != null
                  ? CachedNetworkImageProvider(conv['avatar_url'])
                  : null,
              child: conv['avatar_url'] == null
                  ? Text(conv['other_name'][0], style: const TextStyle(fontWeight: FontWeight.w600))
                  : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(conv['other_name'],
                            style: TextStyle(
                              fontWeight: unread > 0 ? FontWeight.w700 : FontWeight.w500,
                              fontSize: 15,
                            )),
                      ),
                      Text(_timeAgo(conv['last_message_time']),
                          style: TextStyle(
                            fontSize: 12,
                            color: unread > 0 ? AppColors.primary : AppColors.mutedForeground,
                          )),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          conv['last_message'] ?? 'Start a conversation',
                          style: TextStyle(
                            fontSize: 13,
                            color: unread > 0 ? AppColors.foreground : AppColors.mutedForeground,
                            fontWeight: unread > 0 ? FontWeight.w500 : FontWeight.w400,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (unread > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text('$unread', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
