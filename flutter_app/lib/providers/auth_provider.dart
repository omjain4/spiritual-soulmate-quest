import 'package:flutter/foundation.dart';
import '../core/supabase_client.dart';
import '../models/models.dart';

class AuthProvider extends ChangeNotifier {
  Profile? _profile;
  bool _isLoading = true;

  Profile? get profile => _profile;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => supabase.auth.currentUser != null;
  String? get userId => supabase.auth.currentUser?.id;

  AuthProvider() {
    _init();
  }

  void _init() {
    supabase.auth.onAuthStateChange.listen((data) async {
      final user = data.session?.user;
      if (user != null) {
        await fetchProfile(user.id);
      } else {
        _profile = null;
      }
      _isLoading = false;
      notifyListeners();
    });

    // Get initial session
    final user = supabase.auth.currentUser;
    if (user != null) {
      fetchProfile(user.id);
    } else {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchProfile(String userId) async {
    try {
      final data = await supabase
          .from('profiles')
          .select()
          .eq('user_id', userId)
          .maybeSingle();

      if (data != null) {
        _profile = Profile.fromMap(data);
      }
    } catch (e) {
      debugPrint('Error fetching profile: $e');
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> refreshProfile() async {
    final user = supabase.auth.currentUser;
    if (user != null) {
      await fetchProfile(user.id);
    }
  }

  Future<void> login(String email, String password) async {
    final response = await supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
    if (response.user != null) {
      await fetchProfile(response.user!.id);
    }
  }

  Future<void> signup(String email, String password, String name) async {
    final response = await supabase.auth.signUp(
      email: email,
      password: password,
    );

    if (response.user != null) {
      await supabase.from('profiles').insert({
        'user_id': response.user!.id,
        'name': name,
        'email': email,
        'photos': <String>[],
        'interests': <String>[],
      });
      await fetchProfile(response.user!.id);
    }
  }

  Future<void> logout() async {
    await supabase.auth.signOut();
    _profile = null;
    notifyListeners();
  }

  Future<void> updateProfile(Map<String, dynamic> updates) async {
    final user = supabase.auth.currentUser;
    if (user == null) return;

    await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

    await refreshProfile();
  }
}
