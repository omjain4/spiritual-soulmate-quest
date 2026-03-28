import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../core/theme.dart';
import '../core/constants.dart';
import '../core/supabase_client.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../providers/auth_provider.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _step = 0;
  bool _saving = false;
  final _totalSteps = 8;

  // Basic info
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  String _gender = '';
  final _birthDate = TextEditingController();
  final _location = TextEditingController();
  final _occupation = TextEditingController();

  // Sect
  String? _selectedSect;

  // Quiz
  int _quizIndex = 0;
  final Map<int, String> _quizAnswers = {};

  // Prompts
  final List<Map<String, String>> _selectedPrompts = [];

  // Photos
  final List<String> _photos = [];
  int _mainPhotoIndex = 0;

  // Preferences
  double _minAge = 21;
  double _maxAge = 35;

  final _quizQuestions = [
    {
      'question': 'Do you follow Chauvihar (eating before sunset)?',
      'options': [
        {'id': 'always', 'label': 'Always', 'emoji': '🌅'},
        {'id': 'mostly', 'label': 'Mostly', 'emoji': '⭐'},
        {'id': 'sometimes', 'label': 'Sometimes', 'emoji': '🌙'},
        {'id': 'rarely', 'label': 'Rarely', 'emoji': '🌃'},
      ],
    },
    {
      'question': 'What are your dietary preferences?',
      'options': [
        {'id': 'strict-jain', 'label': 'Strict Jain (No root vegetables)', 'emoji': '🥬'},
        {'id': 'jain-veg', 'label': 'Jain Vegetarian', 'emoji': '🥗'},
        {'id': 'vegetarian', 'label': 'Vegetarian', 'emoji': '🥦'},
        {'id': 'flexible', 'label': 'Flexible', 'emoji': '🍽️'},
      ],
    },
    {
      'question': 'How often do you visit the temple?',
      'options': [
        {'id': 'daily', 'label': 'Daily', 'emoji': '🛕'},
        {'id': 'weekly', 'label': 'Weekly', 'emoji': '📅'},
        {'id': 'monthly', 'label': 'On special occasions', 'emoji': '🎉'},
        {'id': 'rarely', 'label': 'Rarely', 'emoji': '🏠'},
      ],
    },
  ];

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(2000, 1, 1),
      firstDate: DateTime(1960),
      lastDate: DateTime.now().subtract(const Duration(days: 365 * 18)),
    );
    if (picked != null) {
      _birthDate.text = '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
    }
  }

  bool _isUploadingPhoto = false;

  Future<void> _uploadPhoto() async {
    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1200);
      if (image == null) return;

      setState(() => _isUploadingPhoto = true);
      
      final file = File(image.path);
      final userId = supabase.auth.currentUser!.id;
      final path = '$userId/${DateTime.now().millisecondsSinceEpoch}.jpg';

      await uploadFileToSupabase('chat-media', path, file);
      final url = supabase.storage.from('chat-media').getPublicUrl(path);

      if (mounted) {
        setState(() {
          _photos.add(url);
          _isUploadingPhoto = false;
        });
      }
    } catch (e) {
      debugPrint('Upload error: $e');
      if (mounted) {
        setState(() => _isUploadingPhoto = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to upload photo: $e')));
      }
    }
  }

  int _calculateRating() {
    int score = 0;
    if (_selectedSect != null) score += 20;
    score += _quizAnswers.length * 10;
    score += _selectedPrompts.where((p) => p['answer']?.isNotEmpty == true).length * 10;
    if (_photos.length >= 3) score += 20;
    return score.clamp(0, 100);
  }

  Future<void> _saveOnboarding() async {
    setState(() => _saving = true);
    final auth = context.read<AuthProvider>();
    final userId = supabase.auth.currentUser!.id;

    try {
      final promptsData = _selectedPrompts
          .where((p) => p['answer']?.isNotEmpty == true)
          .toList();

      await supabase.from('profiles').update({
        'name': '${_firstName.text} ${_lastName.text}'.trim(),
        'gender': _gender,
        'date_of_birth': _birthDate.text,
        'location': _location.text,
        'occupation': _occupation.text,
        'sect': _selectedSect,
        'dietary_preference': _quizAnswers[1],
        'chauvihar_level': _quizAnswers[0],
        'temple_frequency': _quizAnswers[2],
        'jain_rating': _calculateRating(),
        'photos': _photos,
        'main_photo_index': _mainPhotoIndex,
        'prompts': promptsData,
        'onboarding_completed': true,
      }).eq('user_id', userId);

      await supabase.from('preferences').upsert({
        'user_id': userId,
        'min_age': _minAge.round(),
        'max_age': _maxAge.round(),
        'preferred_gender': _gender == 'male' ? 'female' : 'male',
      });

      await auth.refreshProfile();
      if (mounted) context.go('/discover');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _next() {
    if (_step == 5 && _photos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add at least one photo')),
      );
      return;
    }
    if (_step < _totalSteps - 1) {
      setState(() => _step++);
    } else {
      _saveOnboarding();
    }
  }

  void _back() {
    if (_step > 0) setState(() => _step--);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Progress bar
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Step ${_step + 1} of $_totalSteps',
                          style: Theme.of(context).textTheme.bodySmall),
                      Text(_stepTitle(),
                          style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: (_step + 1) / _totalSteps,
                      backgroundColor: AppColors.muted,
                      color: AppColors.primary,
                      minHeight: 6,
                    ),
                  ),
                ],
              ),
            ),

            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: _buildStep(),
              ),
            ),

            // Navigation buttons
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  if (_step > 0)
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _back,
                        icon: const Icon(Icons.arrow_back, size: 18),
                        label: const Text('Back'),
                      ),
                    ),
                  if (_step > 0) const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _saving ? null : _next,
                      child: _saving
                          ? const SizedBox(
                              height: 20, width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Text(_step == _totalSteps - 1 ? 'Start Discovering' : 'Continue'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _stepTitle() {
    const titles = ['Welcome', 'Basic Info', 'Sect', 'Quiz', 'Prompts', 'Photos', 'Preferences', 'Complete'];
    return titles[_step];
  }

  Widget _buildStep() {
    switch (_step) {
      case 0: return _welcomeStep();
      case 1: return _basicInfoStep();
      case 2: return _sectStep();
      case 3: return _quizStep();
      case 4: return _promptsStep();
      case 5: return _photosStep();
      case 6: return _preferencesStep();
      case 7: return _completeStep();
      default: return const SizedBox();
    }
  }

  Widget _welcomeStep() {
    return Column(
      children: [
        const SizedBox(height: 40),
        Text('Welcome to Jain Jodi', style: Theme.of(context).textTheme.displayMedium, textAlign: TextAlign.center),
        const SizedBox(height: 12),
        Text("Let's set up your profile to find your perfect match",
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground),
            textAlign: TextAlign.center),
        const SizedBox(height: 40),
        Container(
          width: 120, height: 120,
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(60),
          ),
          child: const Icon(Icons.auto_awesome, color: AppColors.primary, size: 60),
        ),
        const SizedBox(height: 40),
        ...[
          ('Tell us about yourself', Icons.person_outline),
          ('Select your Jain sect', Icons.check_circle_outline),
          ('Complete the Jain Rating quiz', Icons.auto_awesome_outlined),
          ('Upload your photos', Icons.camera_alt_outlined),
          ('Set your preferences', Icons.tune),
        ].map((item) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.muted.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Icon(item.$2, color: AppColors.primary, size: 18),
                ),
                const SizedBox(width: 12),
                Text(item.$1, style: Theme.of(context).textTheme.bodyMedium),
              ],
            ),
          ),
        )),
      ],
    );
  }

  Widget _basicInfoStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Center(child: Text('Basic Information', style: Theme.of(context).textTheme.displayMedium)),
        const SizedBox(height: 8),
        Center(child: Text('Tell us about yourself', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground))),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(child: TextField(controller: _firstName, decoration: const InputDecoration(labelText: 'First Name'))),
                  const SizedBox(width: 12),
                  Expanded(child: TextField(controller: _lastName, decoration: const InputDecoration(labelText: 'Last Name'))),
                ],
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _gender.isEmpty ? null : _gender,
                decoration: const InputDecoration(labelText: 'Gender'),
                items: const [
                  DropdownMenuItem(value: 'male', child: Text('Male')),
                  DropdownMenuItem(value: 'female', child: Text('Female')),
                ],
                onChanged: (v) => setState(() => _gender = v ?? ''),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _birthDate,
                decoration: const InputDecoration(labelText: 'Date of Birth', suffixIcon: Icon(Icons.calendar_today)),
                readOnly: true,
                onTap: _pickDate,
              ),
              const SizedBox(height: 16),
              TextField(controller: _location, decoration: const InputDecoration(labelText: 'Location', hintText: 'e.g., Mumbai, Maharashtra')),
              const SizedBox(height: 16),
              TextField(controller: _occupation, decoration: const InputDecoration(labelText: 'Occupation', hintText: 'e.g., Software Engineer')),
            ],
          ),
        ),
      ],
    );
  }

  Widget _sectStep() {
    return Column(
      children: [
        const SizedBox(height: 20),
        Text('Select your Sect', style: Theme.of(context).textTheme.displayMedium),
        const SizedBox(height: 8),
        Text('Choose the tradition you follow', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground)),
        const SizedBox(height: 24),
        ...sects.map((sect) => Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: GestureDetector(
            onTap: () => setState(() => _selectedSect = sect['id']),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _selectedSect == sect['id'] ? AppColors.primaryLight : AppColors.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _selectedSect == sect['id'] ? AppColors.primary : AppColors.border,
                  width: _selectedSect == sect['id'] ? 2 : 1,
                ),
              ),
              child: Row(
                children: [
                  Text(sect['icon']!, style: const TextStyle(fontSize: 24)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(sect['title']!, style: Theme.of(context).textTheme.titleMedium),
                        Text(sect['description']!, style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                  if (_selectedSect == sect['id'])
                    const Icon(Icons.check_circle, color: AppColors.primary),
                ],
              ),
            ),
          ),
        )),
      ],
    );
  }

  Widget _quizStep() {
    final q = _quizQuestions[_quizIndex];
    return Column(
      children: [
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.auto_awesome, color: AppColors.primary, size: 20),
            const SizedBox(width: 8),
            Text('Jain Rating Quiz', style: Theme.of(context).textTheme.displayMedium),
          ],
        ),
        const SizedBox(height: 8),
        Text('Question ${_quizIndex + 1} of ${_quizQuestions.length}',
            style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 16),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: (_quizIndex + 1) / _quizQuestions.length,
            backgroundColor: AppColors.muted,
            color: AppColors.primary,
            minHeight: 6,
          ),
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Text(q['question'] as String,
                  style: Theme.of(context).textTheme.headlineMedium,
                  textAlign: TextAlign.center),
              const SizedBox(height: 20),
              ...(q['options'] as List).map((opt) {
                final o = opt as Map<String, String>;
                final isSelected = _quizAnswers[_quizIndex] == o['id'];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: GestureDetector(
                    onTap: () {
                      setState(() => _quizAnswers[_quizIndex] = o['id']!);
                      Future.delayed(const Duration(milliseconds: 300), () {
                        if (_quizIndex < _quizQuestions.length - 1) {
                          setState(() => _quizIndex++);
                        }
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primaryLight : AppColors.muted.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: isSelected ? AppColors.primary : Colors.transparent),
                      ),
                      child: Row(
                        children: [
                          Text(o['emoji']!, style: const TextStyle(fontSize: 24)),
                          const SizedBox(width: 12),
                          Expanded(child: Text(o['label']!, style: Theme.of(context).textTheme.bodyLarge)),
                          if (isSelected) const Icon(Icons.check_circle, color: AppColors.primary, size: 20),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_quizQuestions.length, (i) =>
            GestureDetector(
              onTap: () => setState(() => _quizIndex = i),
              child: Container(
                width: 32, height: 6,
                margin: const EdgeInsets.symmetric(horizontal: 3),
                decoration: BoxDecoration(
                  color: i == _quizIndex ? AppColors.primary : (_quizAnswers.containsKey(i) ? AppColors.primary.withValues(alpha: 0.5) : AppColors.muted),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _promptsStep() {
    return Column(
      children: [
        const SizedBox(height: 20),
        Text('Your Vibe', style: Theme.of(context).textTheme.displayMedium),
        const SizedBox(height: 8),
        Text('Pick up to 3 prompts to show your personality',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground)),
        const SizedBox(height: 24),
        ..._selectedPrompts.asMap().entries.map((entry) {
          final p = entry.value;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(p['question']!, style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600, color: AppColors.primary)),
                const SizedBox(height: 8),
                Text(p['answer'] ?? '', style: Theme.of(context).textTheme.bodyLarge),
              ],
            ),
          );
        }),
        if (_selectedPrompts.length < 3)
          GestureDetector(
            onTap: _showPromptPicker,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 32),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border, width: 2, strokeAlign: BorderSide.strokeAlignInside),
              ),
              child: Column(
                children: [
                  const Icon(Icons.add, size: 28, color: AppColors.mutedForeground),
                  const SizedBox(height: 8),
                  Text(_selectedPrompts.isEmpty ? 'Choose your first prompt' : 'Add another prompt',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground)),
                ],
              ),
            ),
          ),
      ],
    );
  }

  void _showPromptPicker() {
    final usedQuestions = _selectedPrompts.map((p) => p['question']).toSet();
    String? selectedCategory;
    String searchQuery = '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            final filtered = promptOptions.where((p) {
              if (usedQuestions.contains(p.question)) return false;
              if (selectedCategory != null && p.category != selectedCategory) return false;
              if (searchQuery.isNotEmpty && !p.question.toLowerCase().contains(searchQuery.toLowerCase())) return false;
              return true;
            }).toList();

            return DraggableScrollableSheet(
              initialChildSize: 0.85,
              maxChildSize: 0.95,
              minChildSize: 0.5,
              expand: false,
              builder: (_, scrollController) {
                return Column(
                  children: [
                    Container(
                      width: 40, height: 4,
                      margin: const EdgeInsets.only(top: 12, bottom: 16),
                      decoration: BoxDecoration(
                        color: AppColors.muted,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    Text('Choose a Prompt', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 12),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: TextField(
                        onChanged: (v) => setSheetState(() => searchQuery = v),
                        decoration: InputDecoration(
                          hintText: 'Search prompts...',
                          prefixIcon: const Icon(Icons.search, size: 20),
                          filled: true,
                          fillColor: AppColors.muted.withValues(alpha: 0.5),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(30),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 36,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        children: [
                          _categoryChip('All', null, selectedCategory, (v) => setSheetState(() => selectedCategory = v)),
                          ...promptCategories.map((c) => _categoryChip(
                            '${c['emoji']} ${c['label']}',
                            c['id'] as String,
                            selectedCategory,
                            (v) => setSheetState(() => selectedCategory = v),
                          )),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: ListView.builder(
                        controller: scrollController,
                        itemCount: filtered.length,
                        itemBuilder: (_, i) {
                          final p = filtered[i];
                          return ListTile(
                            leading: Text(p.emoji, style: const TextStyle(fontSize: 22)),
                            title: Text(p.question, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                            trailing: const Icon(Icons.chevron_right, size: 20, color: AppColors.mutedForeground),
                            onTap: () {
                              Navigator.pop(ctx);
                              _showAnswerPrompt(p.question);
                            },
                          );
                        },
                      ),
                    ),
                  ],
                );
              },
            );
          },
        );
      },
    );
  }

  Widget _categoryChip(String label, String? catId, String? selected, Function(String?) onTap) {
    final isActive = selected == catId;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: GestureDetector(
        onTap: () => onTap(catId),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isActive ? AppColors.foreground : AppColors.muted,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(label, style: TextStyle(
            fontSize: 12, fontWeight: FontWeight.w500,
            color: isActive ? Colors.white : AppColors.mutedForeground,
          )),
        ),
      ),
    );
  }

  void _showAnswerPrompt(String question) {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 24, right: 24, top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(question, style: TextStyle(
                  fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary)),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                maxLines: 4,
                maxLength: 250,
                autofocus: true,
                decoration: const InputDecoration(hintText: 'Write your answer here...'),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (controller.text.trim().isNotEmpty) {
                      setState(() {
                        _selectedPrompts.add({
                          'question': question,
                          'answer': controller.text.trim(),
                        });
                      });
                      Navigator.pop(ctx);
                    }
                  },
                  child: const Text('Add to Profile'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _photosStep() {
    return Column(
      children: [
        const SizedBox(height: 20),
        Text('Add Photos', style: Theme.of(context).textTheme.displayMedium),
        const SizedBox(height: 8),
        Text('Add at least 1 photo to continue',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground)),
        const SizedBox(height: 24),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 3,
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
          childAspectRatio: 3 / 4,
          children: [
            ..._photos.asMap().entries.map((entry) => Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: Image.network(entry.value, fit: BoxFit.cover, width: double.infinity, height: double.infinity),
                ),
                if (entry.key == _mainPhotoIndex)
                  Positioned(
                    top: 4, left: 4,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text('Main', style: TextStyle(color: Colors.white, fontSize: 10)),
                    ),
                  ),
                Positioned(
                  top: 4, right: 4,
                  child: GestureDetector(
                    onTap: () => setState(() {
                      _photos.removeAt(entry.key);
                      if (_mainPhotoIndex >= _photos.length) _mainPhotoIndex = 0;
                    }),
                    child: Container(
                      width: 24, height: 24,
                      decoration: const BoxDecoration(
                        color: AppColors.destructive,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.close, color: Colors.white, size: 14),
                    ),
                  ),
                ),
              ],
            )),
            if (_photos.length < 6)
              GestureDetector(
                onTap: _isUploadingPhoto ? null : _uploadPhoto,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border, width: 2),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_isUploadingPhoto)
                        const SizedBox(
                          width: 28, height: 28,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                        )
                      else ...[
                        const Icon(Icons.camera_alt_outlined, color: AppColors.mutedForeground, size: 28),
                        const SizedBox(height: 4),
                        const Text('Add', style: TextStyle(fontSize: 12, color: AppColors.mutedForeground)),
                      ],
                    ],
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }

  Widget _preferencesStep() {
    return Column(
      children: [
        const SizedBox(height: 20),
        Text('Preferences', style: Theme.of(context).textTheme.displayMedium),
        const SizedBox(height: 8),
        Text('Set your match preferences',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground)),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Age Range', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text('${_minAge.round()} - ${_maxAge.round()} years',
                  style: Theme.of(context).textTheme.bodySmall),
              RangeSlider(
                values: RangeValues(_minAge, _maxAge),
                min: 18,
                max: 60,
                divisions: 42,
                activeColor: AppColors.primary,
                onChanged: (v) => setState(() {
                  _minAge = v.start;
                  _maxAge = v.end;
                }),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _completeStep() {
    return Column(
      children: [
        const SizedBox(height: 40),
        Container(
          width: 100, height: 100,
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(50),
          ),
          child: const Icon(Icons.check, color: AppColors.primary, size: 48),
        ),
        const SizedBox(height: 24),
        Text("You're all set!", style: Theme.of(context).textTheme.displayMedium),
        const SizedBox(height: 12),
        Text('Your profile is ready. Let\'s find your match.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.mutedForeground),
            textAlign: TextAlign.center),
        const SizedBox(height: 32),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.auto_awesome, color: AppColors.primary, size: 18),
                  const SizedBox(width: 8),
                  Text('Your Jain Rating', style: Theme.of(context).textTheme.titleMedium),
                ],
              ),
              const SizedBox(height: 8),
              Text('${_calculateRating()}%',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(color: AppColors.primary)),
              const SizedBox(height: 4),
              Text('Based on your profile completeness',
                  style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _statCard('${_photos.length}', 'Photos'),
            const SizedBox(width: 16),
            _statCard('${_selectedPrompts.length}', 'Prompts'),
          ],
        ),
      ],
    );
  }

  Widget _statCard(String value, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
      decoration: BoxDecoration(
        color: AppColors.muted,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          Text(value, style: Theme.of(context).textTheme.headlineLarge),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _birthDate.dispose();
    _location.dispose();
    _occupation.dispose();
    super.dispose();
  }
}
