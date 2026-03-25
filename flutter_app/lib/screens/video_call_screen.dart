import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import '../core/theme.dart';
import '../core/supabase_client.dart';

class VideoCallScreen extends StatefulWidget {
  final String callId;
  final String otherUserId;
  final String otherUserName;
  final String callType; // 'video' or 'audio'
  final bool isIncoming;

  const VideoCallScreen({
    super.key,
    required this.callId,
    required this.otherUserId,
    required this.otherUserName,
    this.callType = 'video',
    this.isIncoming = false,
  });

  @override
  State<VideoCallScreen> createState() => _VideoCallScreenState();
}

class _VideoCallScreenState extends State<VideoCallScreen> {
  final _localRenderer = RTCVideoRenderer();
  final _remoteRenderer = RTCVideoRenderer();
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;
  bool _isMuted = false;
  bool _isVideoOff = false;
  bool _isSpeaker = true;
  bool _isConnected = false;
  bool _isRinging = true;
  String _callStatus = 'Connecting...';
  StreamSubscription? _callSubscription;
  DateTime? _callStartTime;
  Timer? _durationTimer;
  String _callDuration = '00:00';

  String get _userId => supabase.auth.currentUser!.id;

  @override
  void initState() {
    super.initState();
    _initRenderers();
  }

  Future<void> _initRenderers() async {
    await _localRenderer.initialize();
    await _remoteRenderer.initialize();
    await _startCall();
  }

  Future<void> _startCall() async {
    try {
      // Get user media
      final mediaConstraints = {
        'audio': true,
        'video': widget.callType == 'video' ? {'facingMode': 'user'} : false,
      };
      _localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      _localRenderer.srcObject = _localStream;

      // Create peer connection
      final config = {
        'iceServers': [
          {'urls': 'stun:stun.l.google.com:19302'},
          {'urls': 'stun:stun1.l.google.com:19302'},
        ],
      };

      _peerConnection = await createPeerConnection(config);

      // Add local tracks
      _localStream!.getTracks().forEach((track) {
        _peerConnection!.addTrack(track, _localStream!);
      });

      // Handle remote stream
      _peerConnection!.onTrack = (event) {
        if (event.streams.isNotEmpty) {
          setState(() {
            _remoteRenderer.srcObject = event.streams[0];
            _isConnected = true;
            _isRinging = false;
            _callStatus = 'Connected';
            _callStartTime = DateTime.now();
            _startDurationTimer();
          });
        }
      };

      // Handle ICE candidates
      _peerConnection!.onIceCandidate = (candidate) {
        _sendIceCandidate(candidate);
      };

      _peerConnection!.onConnectionState = (state) {
        if (state == RTCPeerConnectionState.RTCPeerConnectionStateDisconnected ||
            state == RTCPeerConnectionState.RTCPeerConnectionStateFailed) {
          _endCall();
        }
      };

      if (!widget.isIncoming) {
        // Create offer
        final offer = await _peerConnection!.createOffer();
        await _peerConnection!.setLocalDescription(offer);

        await supabase.from('video_calls').update({
          'offer': {'type': offer.type, 'sdp': offer.sdp},
          'status': 'ringing',
        }).eq('id', widget.callId);

        setState(() => _callStatus = 'Ringing...');
      }

      // Listen for call updates
      _callSubscription = supabase
          .from('video_calls')
          .stream(primaryKey: ['id'])
          .eq('id', widget.callId)
          .listen((data) async {
        if (data.isEmpty) return;
        final call = data.first;
        final status = call['status'];

        if (status == 'accepted' && call['answer'] != null && !_isConnected) {
          final answer = RTCSessionDescription(
            call['answer']['sdp'],
            call['answer']['type'],
          );
          await _peerConnection?.setRemoteDescription(answer);
          setState(() {
            _callStatus = 'Connecting...';
            _isRinging = false;
          });
        }

        if (status == 'rejected' || status == 'ended' || status == 'missed') {
          _endCall();
        }

        // Process ICE candidates
        final candidates = call['ice_candidates'] as List<dynamic>?;
        if (candidates != null) {
          for (var c in candidates) {
            if (c is Map) {
              final candidate = RTCIceCandidate(
                c['candidate'],
                c['sdpMid'],
                c['sdpMLineIndex'],
              );
              await _peerConnection?.addCandidate(candidate);
            }
          }
        }
      });
    } catch (e) {
      debugPrint('Call error: $e');
      setState(() => _callStatus = 'Error: $e');
    }
  }

  Future<void> _sendIceCandidate(RTCIceCandidate candidate) async {
    try {
      final call = await supabase
          .from('video_calls')
          .select('ice_candidates')
          .eq('id', widget.callId)
          .single();

      final existing = List<dynamic>.from(call['ice_candidates'] ?? []);
      existing.add({
        'candidate': candidate.candidate,
        'sdpMid': candidate.sdpMid,
        'sdpMLineIndex': candidate.sdpMLineIndex,
      });

      await supabase.from('video_calls').update({
        'ice_candidates': existing,
      }).eq('id', widget.callId);
    } catch (e) {
      debugPrint('ICE error: $e');
    }
  }

  void _startDurationTimer() {
    _durationTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_callStartTime != null) {
        final elapsed = DateTime.now().difference(_callStartTime!);
        final mins = elapsed.inMinutes.toString().padLeft(2, '0');
        final secs = (elapsed.inSeconds % 60).toString().padLeft(2, '0');
        setState(() => _callDuration = '$mins:$secs');
      }
    });
  }

  void _toggleMute() {
    setState(() => _isMuted = !_isMuted);
    _localStream?.getAudioTracks().forEach((track) {
      track.enabled = !_isMuted;
    });
  }

  void _toggleVideo() {
    setState(() => _isVideoOff = !_isVideoOff);
    _localStream?.getVideoTracks().forEach((track) {
      track.enabled = !_isVideoOff;
    });
  }

  void _toggleSpeaker() {
    setState(() => _isSpeaker = !_isSpeaker);
    // Platform-specific speaker toggle would go here
  }

  Future<void> _endCall() async {
    try {
      final duration = _callStartTime != null
          ? DateTime.now().difference(_callStartTime!).inSeconds
          : 0;

      await supabase.from('video_calls').update({
        'status': 'ended',
        'ended_at': DateTime.now().toIso8601String(),
      }).eq('id', widget.callId);

      // Record in call history
      final call = await supabase
          .from('video_calls')
          .select()
          .eq('id', widget.callId)
          .single();

      await supabase.from('call_history').insert({
        'call_id': widget.callId,
        'caller_id': call['caller_id'],
        'callee_id': call['callee_id'],
        'conversation_id': call['conversation_id'],
        'call_type': widget.callType,
        'status': _isConnected ? 'answered' : 'missed',
        'started_at': _callStartTime?.toIso8601String(),
        'ended_at': DateTime.now().toIso8601String(),
        'duration_seconds': duration,
      });
    } catch (e) {
      debugPrint('End call error: $e');
    }

    _cleanup();
    if (mounted) Navigator.of(context).pop();
  }

  void _cleanup() {
    _durationTimer?.cancel();
    _callSubscription?.cancel();
    _localStream?.getTracks().forEach((t) => t.stop());
    _localStream?.dispose();
    _peerConnection?.close();
    _localRenderer.dispose();
    _remoteRenderer.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Remote video (full screen)
          if (_isConnected && widget.callType == 'video')
            Positioned.fill(
              child: RTCVideoView(
                _remoteRenderer,
                objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
              ),
            )
          else
            // Ringing / audio only state
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppColors.primary.withValues(alpha: 0.8),
                      Colors.black.withValues(alpha: 0.9),
                    ],
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      radius: 60,
                      backgroundColor: Colors.white.withValues(alpha: 0.2),
                      child: Text(
                        widget.otherUserName.isNotEmpty ? widget.otherUserName[0] : '?',
                        style: const TextStyle(fontSize: 48, color: Colors.white, fontWeight: FontWeight.w300),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      widget.otherUserName,
                      style: const TextStyle(fontSize: 28, color: Colors.white, fontWeight: FontWeight.w300),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _isConnected ? _callDuration : _callStatus,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white.withValues(alpha: 0.7),
                      ),
                    ),
                    if (_isRinging) ...[
                      const SizedBox(height: 24),
                      SizedBox(
                        width: 40, height: 40,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white.withValues(alpha: 0.5),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

          // Local video (picture-in-picture)
          if (widget.callType == 'video' && !_isVideoOff)
            Positioned(
              top: MediaQuery.of(context).padding.top + 16,
              right: 16,
              child: Container(
                width: 120,
                height: 160,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 8,
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: RTCVideoView(
                    _localRenderer,
                    mirror: true,
                    objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
                  ),
                ),
              ),
            ),

          // Duration display (when connected)
          if (_isConnected)
            Positioned(
              top: MediaQuery.of(context).padding.top + 16,
              left: 0, right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _callDuration,
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ),
              ),
            ),

          // Controls
          Positioned(
            bottom: MediaQuery.of(context).padding.bottom + 32,
            left: 0, right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _controlButton(
                  _isMuted ? Icons.mic_off : Icons.mic,
                  _isMuted ? 'Unmute' : 'Mute',
                  _toggleMute,
                  isActive: _isMuted,
                ),
                if (widget.callType == 'video')
                  _controlButton(
                    _isVideoOff ? Icons.videocam_off : Icons.videocam,
                    _isVideoOff ? 'Camera On' : 'Camera Off',
                    _toggleVideo,
                    isActive: _isVideoOff,
                  ),
                _controlButton(
                  _isSpeaker ? Icons.volume_up : Icons.volume_off,
                  _isSpeaker ? 'Speaker' : 'Earpiece',
                  _toggleSpeaker,
                  isActive: !_isSpeaker,
                ),
                _controlButton(
                  Icons.call_end,
                  'End',
                  _endCall,
                  isEnd: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _controlButton(IconData icon, String label, VoidCallback onTap,
      {bool isActive = false, bool isEnd = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              color: isEnd
                  ? AppColors.destructive
                  : isActive
                      ? Colors.white.withValues(alpha: 0.3)
                      : Colors.white.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 26),
          ),
          const SizedBox(height: 6),
          Text(label, style: TextStyle(
            color: Colors.white.withValues(alpha: 0.8),
            fontSize: 11,
          )),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _cleanup();
    super.dispose();
  }
}
