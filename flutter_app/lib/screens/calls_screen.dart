import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../core/theme.dart';
import '../core/supabase_client.dart';

class CallsScreen extends StatefulWidget {
  const CallsScreen({super.key});
  @override
  State<CallsScreen> createState() => _CallsScreenState();
}

class _CallsScreenState extends State<CallsScreen> {
  List<Map<String, dynamic>> _callHistory = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCallHistory();
  }

  Future<void> _loadCallHistory() async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    try {
      final data = await supabase
          .from('call_history')
          .select()
          .or('caller_id.eq.$userId,callee_id.eq.$userId')
          .order('created_at', ascending: false);

      final enriched = <Map<String, dynamic>>[];
      for (var call in data) {
        final otherId = call['caller_id'] == userId ? call['callee_id'] : call['caller_id'];
        final isOutgoing = call['caller_id'] == userId;

        final profile = await supabase
            .from('profiles')
            .select('name, photos, main_photo_index')
            .eq('user_id', otherId)
            .maybeSingle();

        String? avatarUrl;
        if (profile != null) {
          final photos = List<String>.from(profile['photos'] ?? []);
          final mainIdx = profile['main_photo_index'] ?? 0;
          avatarUrl = photos.isNotEmpty ? photos[mainIdx.clamp(0, photos.length - 1)] : null;
        }

        enriched.add({
          ...call,
          'is_outgoing': isOutgoing,
          'other_name': profile?['name'] ?? 'Unknown',
          'other_avatar': avatarUrl,
        });
      }

      setState(() {
        _callHistory = enriched;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Calls')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _callHistory.isEmpty
              ? _buildEmpty()
              : RefreshIndicator(
                  onRefresh: _loadCallHistory,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: _callHistory.length,
                    itemBuilder: (_, i) => _buildCallItem(_callHistory[i]),
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
            child: const Icon(Icons.phone, size: 40, color: AppColors.mutedForeground),
          ),
          const SizedBox(height: 16),
          Text('No calls yet', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text('Start a conversation to make your first call',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground)),
        ],
      ),
    );
  }

  Widget _buildCallItem(Map<String, dynamic> call) {
    final isMissed = call['status'] == 'missed';
    final isOutgoing = call['is_outgoing'] ?? false;
    final isVideo = call['call_type'] == 'video';
    final duration = call['duration_seconds'] ?? 0;

    IconData statusIcon;
    Color statusColor;
    String statusText;

    if (isMissed) {
      statusIcon = Icons.phone_missed;
      statusColor = AppColors.destructive;
      statusText = 'Missed';
    } else if (isOutgoing) {
      statusIcon = Icons.phone_forwarded;
      statusColor = AppColors.primary;
      statusText = duration > 0 ? _formatDuration(duration) : 'Outgoing';
    } else {
      statusIcon = Icons.phone_callback;
      statusColor = AppColors.success;
      statusText = duration > 0 ? _formatDuration(duration) : 'Incoming';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isMissed ? AppColors.destructive.withValues(alpha: 0.05) : AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundImage: call['other_avatar'] != null
                ? CachedNetworkImageProvider(call['other_avatar'])
                : null,
            child: call['other_avatar'] == null
                ? Text(call['other_name'][0], style: const TextStyle(fontWeight: FontWeight.w600))
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(call['other_name'],
                        style: TextStyle(
                          fontWeight: FontWeight.w500,
                          color: isMissed ? AppColors.destructive : AppColors.foreground,
                        )),
                    const SizedBox(width: 6),
                    Icon(isVideo ? Icons.videocam : Icons.phone, size: 14, color: AppColors.mutedForeground),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(statusIcon, size: 14, color: statusColor),
                    const SizedBox(width: 4),
                    Text(statusText, style: TextStyle(fontSize: 12, color: statusColor)),
                    const SizedBox(width: 8),
                    Text(_timeAgo(call['created_at']),
                        style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground)),
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(isVideo ? Icons.videocam : Icons.phone, color: AppColors.primary),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  String _formatDuration(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return mins > 0 ? '${mins}m ${secs}s' : '${secs}s';
  }

  String _timeAgo(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}
