import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../core/theme.dart';
import '../core/supabase_client.dart';
import '../providers/auth_provider.dart';
import '../models/models.dart';

class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({super.key});
  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  List<Profile> _profiles = [];
  int _currentIndex = 0;
  bool _isLoading = true;
  int _currentPhotoIndex = 0;
  Offset _dragOffset = Offset.zero;
  double _dragRotation = 0;

  @override
  void initState() {
    super.initState();
    _loadProfiles();
  }

  Future<void> _loadProfiles() async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    try {
      final data = await supabase.rpc('get_recommended_profiles', params: {
        'current_user_id': userId,
        'limit_count': 20,
      });

      setState(() {
        _profiles = (data as List).map((e) => Profile.fromMap(e)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _likeProfile(String targetUserId, {String? message}) async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    try {
      await supabase.from('likes').insert({
        'from_user_id': userId,
        'to_user_id': targetUserId,
        'is_super_like': false,
      });

      if (message != null) {
        final existing = await supabase.from('conversations').select('id').or('and(participant1_id.eq.$userId,participant2_id.eq.$targetUserId),and(participant1_id.eq.$targetUserId,participant2_id.eq.$userId)').maybeSingle();
        String convId;
        if (existing != null) {
          convId = existing['id'];
        } else {
          final newConv = await supabase.from('conversations').insert({
            'participant1_id': userId,
            'participant2_id': targetUserId,
          }).select('id').single();
          convId = newConv['id'];
        }

        await supabase.from('messages').insert({
          'conversation_id': convId,
          'sender_id': userId,
          'content': message,
        });
        await supabase.from('conversations').update({
          'last_message_at': DateTime.now().toIso8601String(),
        }).eq('id', convId);
      }

      final matchData = await supabase.from('matches').select('*').or('and(user1_id.eq.$userId,user2_id.eq.$targetUserId),and(user1_id.eq.$targetUserId,user2_id.eq.$userId)').maybeSingle();
      if (matchData != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('It\'s a Match! 💕'), backgroundColor: AppColors.primary),
        );
      }
    } catch (e) {
      debugPrint('Like error: $e');
    }
    _nextProfile();
  }

  Future<void> _skipProfile(String targetUserId) async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    try {
      await supabase.from('skipped_profiles').insert({
        'user_id': userId,
        'skipped_user_id': targetUserId,
      });
    } catch (e) {
      debugPrint('Skip error: $e');
    }
    _nextProfile();
  }

  void _nextProfile() {
    setState(() {
      _currentIndex++;
      _currentPhotoIndex = 0;
      _dragOffset = Offset.zero;
      _dragRotation = 0;
    });
  }

  Profile? get _currentProfile =>
      _currentIndex < _profiles.length ? _profiles[_currentIndex] : null;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.favorite, color: AppColors.primary, size: 18),
            ),
            const SizedBox(width: 10),
            const Text('Jain Jodi'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune, size: 22),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _currentProfile == null
              ? _buildEmptyState()
              : _buildCardStack(),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              color: AppColors.muted,
              borderRadius: BorderRadius.circular(40),
            ),
            child: const Icon(Icons.explore_off, size: 40, color: AppColors.mutedForeground),
          ),
          const SizedBox(height: 20),
          Text("You've seen everyone!", style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text('Check back later for new profiles', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              setState(() { _currentIndex = 0; _isLoading = true; });
              _loadProfiles();
            },
            icon: const Icon(Icons.refresh, size: 18),
            label: const Text('Refresh'),
          ),
        ],
      ),
    );
  }

  Widget _buildCardStack() {
    final profile = _currentProfile!;
    final photos = profile.photos.isNotEmpty ? profile.photos : [''];
    final size = MediaQuery.of(context).size;

    return Stack(
      children: [
        // Card
        Center(
          child: GestureDetector(
            onPanUpdate: (details) {
              setState(() {
                _dragOffset += details.delta;
                _dragRotation = _dragOffset.dx / (size.width / 2) * 0.3;
              });
            },
            onPanEnd: (details) {
              if (_dragOffset.dx.abs() > 120) {
                if (_dragOffset.dx > 0) {
                  _likeProfile(profile.userId);
                } else {
                  _skipProfile(profile.userId);
                }
              } else {
                setState(() {
                  _dragOffset = Offset.zero;
                  _dragRotation = 0;
                });
              }
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 100),
              transform: Matrix4.identity()
                ..translate(_dragOffset.dx, _dragOffset.dy)
                ..rotateZ(_dragRotation),
              child: Container(
                margin: const EdgeInsets.all(16),
                width: size.width - 32,
                height: size.height * 0.65,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // Photo
                      if (photos[_currentPhotoIndex].isNotEmpty)
                        GestureDetector(
                          onTapUp: (details) {
                            final tapX = details.localPosition.dx;
                            final halfWidth = (size.width - 32) / 2;
                            setState(() {
                              if (tapX > halfWidth && _currentPhotoIndex < photos.length - 1) {
                                _currentPhotoIndex++;
                              } else if (tapX < halfWidth && _currentPhotoIndex > 0) {
                                _currentPhotoIndex--;
                              }
                            });
                          },
                          child: CachedNetworkImage(
                            imageUrl: photos[_currentPhotoIndex],
                            fit: BoxFit.cover,
                            placeholder: (_, __) => Container(color: AppColors.muted),
                            errorWidget: (_, __, ___) => Container(
                              color: AppColors.muted,
                              child: const Icon(Icons.person, size: 80, color: AppColors.mutedForeground),
                            ),
                          ),
                        )
                      else
                        Container(
                          color: AppColors.muted,
                          child: const Icon(Icons.person, size: 80, color: AppColors.mutedForeground),
                        ),

                      // Photo indicators
                      if (photos.length > 1)
                        Positioned(
                          top: 12,
                          left: 12, right: 12,
                          child: Row(
                            children: photos.asMap().entries.map((e) {
                              return Expanded(
                                child: Container(
                                  height: 3,
                                  margin: const EdgeInsets.symmetric(horizontal: 2),
                                  decoration: BoxDecoration(
                                    color: e.key == _currentPhotoIndex
                                        ? Colors.white
                                        : Colors.white.withValues(alpha: 0.4),
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),

                      // Gradient overlay
                      Positioned(
                        bottom: 0,
                        left: 0, right: 0,
                        child: Container(
                          height: 200,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                Colors.black.withValues(alpha: 0.7),
                              ],
                            ),
                          ),
                        ),
                      ),

                      // Info
                      Positioned(
                        bottom: 16,
                        left: 16, right: 16,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    '${profile.name}, ${profile.age ?? ''}',
                                    style: const TextStyle(
                                      fontSize: 24, fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                                if (profile.matchScore != null)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      '${profile.matchScore}%',
                                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                                    ),
                                  ),
                              ],
                            ),
                            if (profile.location != null) ...[
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.location_on, size: 14, color: Colors.white70),
                                  const SizedBox(width: 4),
                                  Text(profile.location!, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                                ],
                              ),
                            ],
                            if (profile.sect != null) ...[
                              const SizedBox(height: 4),
                              Text(profile.sect!, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                            ],
                            if (profile.prompts.isNotEmpty) ...[
                              const SizedBox(height: 12),
                              ...profile.prompts.take(2).map((prompt) => GestureDetector(
                                onTap: () => _showReplyDialog(profile, prompt),
                                child: Container(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.3),
                                    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(prompt.question, style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
                                      const SizedBox(height: 6),
                                      Text(prompt.answer, style: const TextStyle(color: Colors.white, fontSize: 15)),
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: Colors.white.withValues(alpha: 0.2),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: const Row(
                                              children: [
                                                Icon(Icons.chat_bubble_outline, color: Colors.white, size: 12),
                                                SizedBox(width: 4),
                                                Text('Reply', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              )),
                            ],
                          ],
                        ),
                      ),

                      // Swipe indicators
                      if (_dragOffset.dx > 30)
                        Positioned(
                          top: 60, left: 24,
                          child: Transform.rotate(
                            angle: -0.3,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                border: Border.all(color: AppColors.success, width: 3),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text('LIKE', style: TextStyle(color: AppColors.success, fontSize: 28, fontWeight: FontWeight.w800)),
                            ),
                          ),
                        ),
                      if (_dragOffset.dx < -30)
                        Positioned(
                          top: 60, right: 24,
                          child: Transform.rotate(
                            angle: 0.3,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                border: Border.all(color: AppColors.destructive, width: 3),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text('NOPE', style: TextStyle(color: AppColors.destructive, fontSize: 28, fontWeight: FontWeight.w800)),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),

        // Action buttons
        Positioned(
          bottom: 24,
          left: 0, right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _actionButton(Icons.close, AppColors.destructive, () => _skipProfile(profile.userId), 56),
              _actionButton(Icons.favorite, AppColors.primary, () => _likeProfile(profile.userId), 64),
              _actionButton(Icons.bookmark_outline, AppColors.accent, () {}, 48),
            ],
          ),
        ),
      ],
    );
  }

  Widget _actionButton(IconData icon, Color color, VoidCallback onTap, double size) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size, height: size,
        decoration: BoxDecoration(
          color: AppColors.card,
          shape: BoxShape.circle,
          border: Border.all(color: color.withValues(alpha: 0.3)),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.15),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Icon(icon, color: color, size: size * 0.45),
      ),
    );
  }

  void _showReplyDialog(Profile profile, PromptAnswer prompt) {
    final _controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.background,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Reply to Prompt', style: TextStyle(fontSize: 18, fontFamily: 'Playfair Display', fontWeight: FontWeight.w600)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.muted,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(prompt.question, style: const TextStyle(color: AppColors.mutedForeground, fontSize: 12, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 4),
                  Text(prompt.answer, style: const TextStyle(color: AppColors.foreground, fontSize: 14)),
                ],
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _controller,
              autofocus: true,
              maxLines: 3,
              style: const TextStyle(fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Add a message with your like...',
                hintStyle: const TextStyle(color: AppColors.mutedForeground),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primary),
                ),
                contentPadding: const EdgeInsets.all(12),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: AppColors.mutedForeground)),
          ),
          ElevatedButton(
            onPressed: () {
              final text = _controller.text.trim();
              if (text.isNotEmpty) {
                Navigator.pop(context);
                final msg = '**Replying to:** *"${prompt.question}"*\n\n$text';
                _likeProfile(profile.userId, message: msg);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            ),
            child: const Text('Send Like'),
          ),
        ],
      ),
    );
  }
}
