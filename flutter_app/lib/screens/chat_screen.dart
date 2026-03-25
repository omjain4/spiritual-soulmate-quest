import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';
import '../core/theme.dart';
import '../core/supabase_client.dart';
import '../models/models.dart';

class ChatScreen extends StatefulWidget {
  final String conversationId;
  const ChatScreen({super.key, required this.conversationId});
  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  List<Message> _messages = [];
  Map<String, dynamic>? _otherUser;
  bool _isLoading = true;
  StreamSubscription? _subscription;

  String get _userId => supabase.auth.currentUser!.id;

  @override
  void initState() {
    super.initState();
    _loadMessages();
    _subscribeToMessages();
    _markAsRead();
  }

  Future<void> _loadMessages() async {
    try {
      // Load conversation details
      final conv = await supabase
          .from('conversations')
          .select()
          .eq('id', widget.conversationId)
          .single();

      final otherId = conv['participant1_id'] == _userId
          ? conv['participant2_id']
          : conv['participant1_id'];

      final profile = await supabase
          .from('profiles')
          .select('name, photos, main_photo_index')
          .eq('user_id', otherId)
          .maybeSingle();

      if (profile != null) {
        final photos = List<String>.from(profile['photos'] ?? []);
        final mainIdx = profile['main_photo_index'] ?? 0;
        _otherUser = {
          'id': otherId,
          'name': profile['name'],
          'avatar': photos.isNotEmpty ? photos[mainIdx.clamp(0, photos.length - 1)] : null,
        };
      }

      final data = await supabase
          .from('messages')
          .select()
          .eq('conversation_id', widget.conversationId)
          .order('created_at', ascending: true);

      setState(() {
        _messages = (data as List).map((e) => Message.fromMap(e)).toList();
        _isLoading = false;
      });
      _scrollToBottom();
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _subscribeToMessages() {
    _subscription = supabase
        .from('messages')
        .stream(primaryKey: ['id'])
        .eq('conversation_id', widget.conversationId)
        .order('created_at', ascending: true)
        .listen((data) {
      setState(() {
        _messages = data.map((e) => Message.fromMap(e)).toList();
      });
      _scrollToBottom();
      _markAsRead();
    });
  }

  Future<void> _markAsRead() async {
    await supabase
        .from('messages')
        .update({'is_read': true})
        .eq('conversation_id', widget.conversationId)
        .neq('sender_id', _userId)
        .eq('is_read', false);
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;
    _messageController.clear();

    try {
      await supabase.from('messages').insert({
        'conversation_id': widget.conversationId,
        'sender_id': _userId,
        'content': text,
      });
      await supabase.from('conversations').update({
        'last_message_at': DateTime.now().toIso8601String(),
      }).eq('id', widget.conversationId);
    } catch (e) {
      debugPrint('Send error: $e');
    }
  }

  Future<void> _sendImage() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1200);
    if (image == null) return;

    final bytes = await image.readAsBytes();
    final path = '$_userId/${DateTime.now().millisecondsSinceEpoch}.jpg';

    try {
      await supabase.storage.from('chat-media').uploadBinary(path, bytes);
      final url = supabase.storage.from('chat-media').getPublicUrl(path);

      await supabase.from('messages').insert({
        'conversation_id': widget.conversationId,
        'sender_id': _userId,
        'media_url': url,
        'media_type': 'image',
      });
    } catch (e) {
      debugPrint('Image send error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/chat'),
        ),
        title: _otherUser != null
            ? Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundImage: _otherUser!['avatar'] != null
                        ? CachedNetworkImageProvider(_otherUser!['avatar'])
                        : null,
                    child: _otherUser!['avatar'] == null
                        ? Text(_otherUser!['name'][0])
                        : null,
                  ),
                  const SizedBox(width: 10),
                  Text(_otherUser!['name'] ?? '', style: const TextStyle(fontSize: 16)),
                ],
              )
            : const Text('Chat'),
        actions: [
          IconButton(icon: const Icon(Icons.videocam), onPressed: () {/* TODO: video call */}),
          IconButton(icon: const Icon(Icons.phone), onPressed: () {/* TODO: audio call */}),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    itemCount: _messages.length,
                    itemBuilder: (_, i) => _buildMessage(_messages[i]),
                  ),
          ),
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildMessage(Message msg) {
    final isMe = msg.senderId == _userId;
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        child: Column(
          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            if (msg.mediaUrl != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: CachedNetworkImage(
                  imageUrl: msg.mediaUrl!,
                  width: 200,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(
                    width: 200, height: 150,
                    color: AppColors.muted,
                  ),
                ),
              ),
            if (msg.content != null && msg.content!.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: isMe ? AppColors.foreground : AppColors.card,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(18),
                    topRight: const Radius.circular(18),
                    bottomLeft: Radius.circular(isMe ? 18 : 4),
                    bottomRight: Radius.circular(isMe ? 4 : 18),
                  ),
                  border: isMe ? null : Border.all(color: AppColors.border),
                ),
                child: Text(
                  msg.content!,
                  style: TextStyle(
                    color: isMe ? Colors.white : AppColors.foreground,
                    fontSize: 14,
                  ),
                ),
              ),
            const SizedBox(height: 2),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _formatTime(msg.createdAt),
                  style: const TextStyle(fontSize: 10, color: AppColors.mutedForeground),
                ),
                if (isMe) ...[
                  const SizedBox(width: 4),
                  Icon(
                    msg.isRead ? Icons.done_all : Icons.done,
                    size: 13,
                    color: msg.isRead ? AppColors.primary : AppColors.mutedForeground,
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  Widget _buildInputBar() {
    return Container(
      padding: EdgeInsets.only(
        left: 12, right: 8, top: 8,
        bottom: MediaQuery.of(context).padding.bottom + 8,
      ),
      decoration: BoxDecoration(
        color: AppColors.card,
        border: Border(top: BorderSide(color: AppColors.border.withValues(alpha: 0.5))),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.image_outlined, color: AppColors.mutedForeground),
            onPressed: _sendImage,
          ),
          Expanded(
            child: TextField(
              controller: _messageController,
              decoration: InputDecoration(
                hintText: 'Type a message...',
                filled: true,
                fillColor: AppColors.muted.withValues(alpha: 0.5),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              ),
              onSubmitted: (_) => _sendMessage(),
              textInputAction: TextInputAction.send,
            ),
          ),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: _sendMessage,
            child: Container(
              width: 40, height: 40,
              decoration: const BoxDecoration(
                color: AppColors.foreground,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.send, color: Colors.white, size: 18),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _subscription?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
