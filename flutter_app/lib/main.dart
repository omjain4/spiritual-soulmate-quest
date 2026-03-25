import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'core/theme.dart';
import 'core/supabase_client.dart';
import 'providers/auth_provider.dart';
import 'screens/auth_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/main_shell.dart';
import 'screens/discover_screen.dart';
import 'screens/likes_screen.dart';
import 'screens/chat_list_screen.dart';
import 'screens/chat_screen.dart';
import 'screens/calls_screen.dart';
import 'screens/profile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initSupabase();
  runApp(const JainJodiApp());
}

class JainJodiApp extends StatelessWidget {
  const JainJodiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return MaterialApp.router(
            title: 'Jain Jodi',
            theme: AppTheme.lightTheme,
            debugShowCheckedModeBanner: false,
            routerConfig: _buildRouter(auth),
          );
        },
      ),
    );
  }

  GoRouter _buildRouter(AuthProvider auth) {
    return GoRouter(
      initialLocation: '/',
      redirect: (context, state) {
        if (auth.isLoading) return null;

        final isLoggedIn = auth.isAuthenticated;
        final isAuthPage = state.matchedLocation == '/auth';
        final isOnboarding = state.matchedLocation == '/onboarding';

        if (!isLoggedIn && !isAuthPage) return '/auth';
        if (isLoggedIn && isAuthPage) {
          if (auth.profile?.onboardingCompleted == false) return '/onboarding';
          return '/discover';
        }
        if (isLoggedIn && !isOnboarding && auth.profile?.onboardingCompleted == false) {
          return '/onboarding';
        }
        return null;
      },
      routes: [
        GoRoute(
          path: '/auth',
          builder: (context, state) => const AuthScreen(),
        ),
        GoRoute(
          path: '/onboarding',
          builder: (context, state) => const OnboardingScreen(),
        ),
        ShellRoute(
          builder: (context, state, child) => MainShell(child: child),
          routes: [
            GoRoute(
              path: '/',
              redirect: (_, __) => '/discover',
            ),
            GoRoute(
              path: '/discover',
              builder: (context, state) => const DiscoverScreen(),
            ),
            GoRoute(
              path: '/likes',
              builder: (context, state) => const LikesScreen(),
            ),
            GoRoute(
              path: '/chat',
              builder: (context, state) => const ChatListScreen(),
            ),
            GoRoute(
              path: '/chat/:conversationId',
              builder: (context, state) {
                final convId = state.pathParameters['conversationId']!;
                return ChatScreen(conversationId: convId);
              },
            ),
            GoRoute(
              path: '/calls',
              builder: (context, state) => const CallsScreen(),
            ),
            GoRoute(
              path: '/profile',
              builder: (context, state) => const ProfileScreen(),
            ),
          ],
        ),
      ],
    );
  }
}
