import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';
import '../core/theme.dart';
import '../core/constants.dart';
import '../core/supabase_client.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final profile = auth.profile;

    if (profile == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => _showSettings(context, auth),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => auth.refreshProfile(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              _buildProfileHeader(profile),
              const SizedBox(height: 16),
              _buildPhotosSection(profile),
              const SizedBox(height: 16),
              _buildInfoSection(profile),
              const SizedBox(height: 16),
              _buildInterestsSection(profile),
              const SizedBox(height: 16),
              _buildPromptsSection(profile),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(profile) {
    final photos = profile.photos;
    final mainPhoto = photos.isNotEmpty
        ? photos[profile.mainPhotoIndex.clamp(0, photos.length - 1)]
        : null;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundImage: mainPhoto != null ? CachedNetworkImageProvider(mainPhoto) : null,
            child: mainPhoto == null ? const Icon(Icons.person, size: 40) : null,
          ),
          const SizedBox(height: 12),
          Text(profile.name, style: Theme.of(context).textTheme.headlineLarge),
          if (profile.location != null) ...[
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.location_on, size: 14, color: AppColors.mutedForeground),
                const SizedBox(width: 4),
                Text(profile.location!, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ],
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _statBadge('${profile.jainRating}%', 'Jain Rating', Icons.auto_awesome),
              const SizedBox(width: 16),
              _statBadge('${profile.photos.length}', 'Photos', Icons.photo),
              const SizedBox(width: 16),
              _statBadge(profile.isVerified ? '✓' : '✗', 'Verified', Icons.verified),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statBadge(String value, String label, IconData icon) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: AppColors.primaryLight.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(value, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.primary)),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 10, color: AppColors.mutedForeground)),
      ],
    );
  }

  Widget _buildPhotosSection(profile) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Photos', style: Theme.of(context).textTheme.titleLarge),
              const Spacer(),
              TextButton(
                onPressed: _uploadPhoto,
                child: const Text('Manage', style: TextStyle(color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 120,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                ...profile.photos.asMap().entries.map((e) => Container(
                  width: 90, height: 120,
                  margin: const EdgeInsets.only(right: 8),
                  child: Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: CachedNetworkImage(
                          imageUrl: e.value,
                          width: 90, height: 120,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(color: AppColors.muted),
                        ),
                      ),
                      if (e.key == profile.mainPhotoIndex)
                        Positioned(
                          bottom: 4, left: 4,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('Main', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w600)),
                          ),
                        ),
                    ],
                  ),
                )),
                GestureDetector(
                  onTap: _uploadPhoto,
                  child: Container(
                    width: 90, height: 120,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border, width: 2),
                    ),
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add, color: AppColors.mutedForeground),
                        SizedBox(height: 4),
                        Text('Add', style: TextStyle(fontSize: 11, color: AppColors.mutedForeground)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(profile) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('About', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          _infoRow(Icons.work_outline, 'Occupation', profile.occupation),
          _infoRow(Icons.school_outlined, 'Education', profile.education),
          _infoRow(Icons.height, 'Height', profile.height),
          _infoRow(Icons.temple_hindu, 'Sect', profile.sect),
          _infoRow(Icons.restaurant_outlined, 'Diet', profile.dietaryPreference),
          _infoRow(Icons.people_outline, 'Community', profile.community),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.mutedForeground),
          const SizedBox(width: 10),
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.mutedForeground)),
          const Spacer(),
          Text(value ?? 'Not set',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500,
                  color: value != null ? AppColors.foreground : AppColors.mutedForeground)),
        ],
      ),
    );
  }

  Widget _buildInterestsSection(profile) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('My Interests', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: profile.interests.map<Widget>((id) {
              final interest = defaultInterests.firstWhere(
                (i) => i['id'] == id,
                orElse: () => {'label': id, 'emoji': '✨'},
              );
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.muted,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('${interest['emoji']} ${interest['label']}',
                    style: const TextStyle(fontSize: 13)),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildPromptsSection(profile) {
    final prompts = profile.prompts;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.favorite_border, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text('My Vibe', style: Theme.of(context).textTheme.titleLarge),
              const Spacer(),
              TextButton(
                onPressed: () {},
                child: Text(prompts.isEmpty ? 'Add' : 'Edit',
                    style: const TextStyle(color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (prompts.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border, width: 2),
              ),
              child: Column(
                children: [
                  const Text('✨', style: TextStyle(fontSize: 28)),
                  const SizedBox(height: 8),
                  Text('Add prompts to show your personality',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground)),
                  Text('Choose up to 3 prompts',
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            )
          else
            ...prompts.map((p) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p.question,
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppColors.primary)),
                  const SizedBox(height: 6),
                  Text(p.answer, style: const TextStyle(fontSize: 14)),
                ],
              ),
            )),
        ],
      ),
    );
  }

  Future<void> _uploadPhoto() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1200);
    if (image == null) return;

    final auth = context.read<AuthProvider>();
    final bytes = await image.readAsBytes();
    final userId = supabase.auth.currentUser!.id;
    final path = '$userId/${DateTime.now().millisecondsSinceEpoch}.jpg';

    try {
      await supabase.storage.from('photos').uploadBinary(path, bytes);
      final url = supabase.storage.from('photos').getPublicUrl(path);
      final currentPhotos = auth.profile?.photos ?? [];
      await auth.updateProfile({'photos': [...currentPhotos, url]});
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  void _showSettings(BuildContext context, AuthProvider auth) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40, height: 4,
                margin: const EdgeInsets.only(top: 12, bottom: 20),
                decoration: BoxDecoration(
                  color: AppColors.muted,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.person_outline),
                title: const Text('Edit Profile'),
                trailing: const Icon(Icons.chevron_right, size: 20),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.tune),
                title: const Text('Preferences'),
                trailing: const Icon(Icons.chevron_right, size: 20),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.help_outline),
                title: const Text('Help Center'),
                trailing: const Icon(Icons.chevron_right, size: 20),
                onTap: () {},
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.logout, color: AppColors.destructive),
                title: const Text('Log Out', style: TextStyle(color: AppColors.destructive)),
                onTap: () async {
                  Navigator.pop(ctx);
                  await auth.logout();
                  if (context.mounted) context.go('/auth');
                },
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }
}
