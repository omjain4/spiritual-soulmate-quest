import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../core/theme.dart';
import '../core/supabase_client.dart';
import '../models/models.dart';

class LikesScreen extends StatefulWidget {
  const LikesScreen({super.key});
  @override
  State<LikesScreen> createState() => _LikesScreenState();
}

class _LikesScreenState extends State<LikesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _receivedLikes = [];
  List<Map<String, dynamic>> _matches = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    try {
      // Load received likes with profiles
      final likesData = await supabase
          .from('likes')
          .select('*, from_profile:profiles!likes_from_user_id_fkey(id, user_id, name, photos, main_photo_index, location, date_of_birth, sect)')
          .eq('to_user_id', userId)
          .order('created_at', ascending: false);

      // Load matches with profiles
      final matchesData = await supabase
          .from('matches')
          .select('*')
          .or('user1_id.eq.$userId,user2_id.eq.$userId')
          .order('matched_at', ascending: false);

      final matchProfiles = <Map<String, dynamic>>[];
      for (var m in matchesData) {
        final otherId = m['user1_id'] == userId ? m['user2_id'] : m['user1_id'];
        final profile = await supabase
            .from('profiles')
            .select('id, user_id, name, photos, main_photo_index, location')
            .eq('user_id', otherId)
            .maybeSingle();
        matchProfiles.add({...m, 'profile': profile});
      }

      setState(() {
        _receivedLikes = List<Map<String, dynamic>>.from(likesData);
        _matches = matchProfiles;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      debugPrint('Error loading likes: $e');
    }
  }

  Future<void> _likeBack(String userId) async {
    final myId = supabase.auth.currentUser?.id;
    if (myId == null) return;

    try {
      await supabase.from('likes').insert({
        'from_user_id': myId,
        'to_user_id': userId,
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('It\'s a match! 💕')),
      );
      _loadData();
    } catch (e) {
      debugPrint('Error liking back: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Likes & Matches'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.mutedForeground,
          indicatorColor: AppColors.primary,
          tabs: [
            Tab(text: 'Likes (${_receivedLikes.length})'),
            Tab(text: 'Matches (${_matches.length})'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : TabBarView(
              controller: _tabController,
              children: [_buildLikesList(), _buildMatchesList()],
            ),
    );
  }

  Widget _buildLikesList() {
    if (_receivedLikes.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(color: AppColors.muted, borderRadius: BorderRadius.circular(40)),
              child: const Icon(Icons.favorite_border, size: 40, color: AppColors.mutedForeground),
            ),
            const SizedBox(height: 16),
            Text('No likes yet', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text('When someone likes you, they\'ll appear here',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground)),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.7,
      ),
      itemCount: _receivedLikes.length,
      itemBuilder: (_, i) {
        final like = _receivedLikes[i];
        final profile = like['from_profile'];
        if (profile == null) return const SizedBox();

        final photos = List<String>.from(profile['photos'] ?? []);
        final mainIdx = profile['main_photo_index'] ?? 0;
        final photoUrl = photos.isNotEmpty ? photos[mainIdx.clamp(0, photos.length - 1)] : null;
        final isSuperLike = like['is_super_like'] ?? false;

        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 8, offset: const Offset(0, 2)),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (photoUrl != null)
                  CachedNetworkImage(imageUrl: photoUrl, fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: AppColors.muted))
                else
                  Container(color: AppColors.muted, child: const Icon(Icons.person, size: 40, color: AppColors.mutedForeground)),
                Positioned(
                  bottom: 0, left: 0, right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Colors.black.withValues(alpha: 0.7)],
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                profile['name'] ?? '',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (isSuperLike)
                              Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(color: Colors.blue, shape: BoxShape.circle),
                                child: const Icon(Icons.star, color: Colors.white, size: 12),
                              ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () => _likeBack(profile['user_id']),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 6),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.favorite, color: Colors.white, size: 14),
                                      SizedBox(width: 4),
                                      Text('Like', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            GestureDetector(
                              onTap: () {},
                              child: Container(
                                width: 32, height: 32,
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.2),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.close, color: Colors.white, size: 16),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildMatchesList() {
    if (_matches.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(color: AppColors.muted, borderRadius: BorderRadius.circular(40)),
              child: const Icon(Icons.handshake_outlined, size: 40, color: AppColors.mutedForeground),
            ),
            const SizedBox(height: 16),
            Text('No matches yet', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text('Mutual likes will appear here',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _matches.length,
      itemBuilder: (_, i) {
        final match = _matches[i];
        final profile = match['profile'];
        if (profile == null) return const SizedBox();

        final photos = List<String>.from(profile['photos'] ?? []);
        final mainIdx = profile['main_photo_index'] ?? 0;
        final photoUrl = photos.isNotEmpty ? photos[mainIdx.clamp(0, photos.length - 1)] : null;

        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            leading: CircleAvatar(
              radius: 28,
              backgroundImage: photoUrl != null ? CachedNetworkImageProvider(photoUrl) : null,
              child: photoUrl == null ? const Icon(Icons.person) : null,
            ),
            title: Text(profile['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text(profile['location'] ?? '', style: Theme.of(context).textTheme.bodySmall),
            trailing: ElevatedButton.icon(
              onPressed: () => context.go('/chat?userId=${profile['user_id']}'),
              icon: const Icon(Icons.chat_bubble_outline, size: 16),
              label: const Text('Chat'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                textStyle: const TextStyle(fontSize: 13),
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}
