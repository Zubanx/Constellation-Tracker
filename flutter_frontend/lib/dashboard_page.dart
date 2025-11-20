import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:http_parser/http_parser.dart';

// --- Mock Data Structures (Based on dashboard.tsx) ---
class UserStats {
  final int totalObservations;
  final int constellationsTracked;
  final String favoriteConstellation;
  final DateTime lastObservationDate;

  UserStats({
    required this.totalObservations,
    required this.constellationsTracked,
    required this.favoriteConstellation,
    required this.lastObservationDate,
  });
}

class Observation {
  final String name;
  final String date;
  final int rating;
  final String constellationAbbr;

  Observation({
    required this.name,
    required this.date,
    required this.rating,
    required this.constellationAbbr,
  });
}

// Mock service data
final mockStats = UserStats(
  totalObservations: 42,
  constellationsTracked: 15,
  favoriteConstellation: "Orion",
  lastObservationDate: DateTime(2024, 11, 15),
);

final mockObservations = [
  Observation(
    name: "Jupiter",
    date: "2024-11-15",
    rating: 5,
    constellationAbbr: "ORI",
  ),
  Observation(
    name: "Pleiades Cluster",
    date: "2024-11-10",
    rating: 4,
    constellationAbbr: "TAU",
  ),
  Observation(
    name: "Andromeda Galaxy",
    date: "2024-10-28",
    rating: 4,
    constellationAbbr: "AND",
  ),
  Observation(
    name: "Great Nebula",
    date: "2024-10-01",
    rating: 5,
    constellationAbbr: "ORI",
  ),
];

// --- Dashboard Implementation ---

class DashboardPage extends StatefulWidget {
  final String? authToken;
  final VoidCallback? onLogout;
  const DashboardPage({super.key, this.authToken, this.onLogout});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage>
    with TickerProviderStateMixin {
  late final AnimationController _starController;
  late final AnimationController _floatController;

  static const String _obsApiUrl =
      'http://10.0.2.2:3000/api/observations'; // local backend

  UserStats stats = mockStats;
  List<Observation> observations = mockObservations;
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    // Starfield animation controller
    _starController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 180), // Slower animation
    )..repeat();

    // Floating animation controller for icons (replicates .stat-icon animation)
    _floatController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    // Simulate data fetching delay
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    setState(() => isLoading = true);
    try {
      // If we don't have a token, keep mock data.
      if (widget.authToken == null || widget.authToken!.isEmpty) {
        setState(() => isLoading = false);
        return;
      }

      final res = await http.get(
        Uri.parse(_obsApiUrl),
        headers: {'Authorization': 'Bearer ${widget.authToken}'},
      );
      if (res.statusCode != 200) {
        setState(() => isLoading = false);
        return;
      }

      final decoded = jsonDecode(res.body);
      final list = decoded['observations'] as List<dynamic>? ?? [];

      // Compute stats from live data
      int totalObs = list.length;
      final seenConstellations = <String>{};
      final constellationCount = <String, int>{};
      DateTime? lastDate;
      String favorite = stats.favoriteConstellation;

      for (final item in list.whereType<Map<String, dynamic>>()) {
        // Constellation tracking
        final constel = item['constellationId'];
        String? constelId;
        String? constelName;
        if (constel is Map<String, dynamic>) {
          constelId = constel['_id']?.toString() ?? constel['id']?.toString();
          constelName = constel['name']?.toString();
        } else if (constel is String) {
          constelId = constel;
        }
        if (constelId != null) {
          seenConstellations.add(constelId);
          constellationCount[constelName ?? constelId] =
              (constellationCount[constelName ?? constelId] ?? 0) + 1;
        }

        // Last observation date
        if (item['observationDate'] != null) {
          final parsed = DateTime.tryParse(item['observationDate']);
          if (parsed != null) {
            if (lastDate == null || parsed.isAfter(lastDate!)) {
              lastDate = parsed;
            }
          }
        }
      }

      // Determine favorite constellation by highest count
      if (constellationCount.isNotEmpty) {
        favorite = constellationCount.entries
            .reduce((a, b) => a.value >= b.value ? a : b)
            .key;
      }

      setState(() {
        stats = UserStats(
          totalObservations: totalObs,
          constellationsTracked: seenConstellations.length,
          favoriteConstellation: favorite,
          lastObservationDate: lastDate ?? stats.lastObservationDate,
        );
        // Optionally keep mock observations list; not shown on dashboard currently.
        isLoading = false;
      });
    } catch (_) {
      setState(() => isLoading = false);
    }
  }

  @override
  void dispose() {
    _starController.dispose();
    _floatController.dispose();
    super.dispose();
  }

  String _formatDateLocal(DateTime date) {
    final d = date.toLocal();
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  }

  void _handleLogout(BuildContext context) {
    if (widget.onLogout != null) {
      widget.onLogout!();
    } else {
      Navigator.of(context).popUntil((route) => route.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // 1. Deep Space Background Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: [0.0, 0.5, 1.0],
                colors: [
                  Color(0xFF0a0e27), // Top
                  Color(0xFF1a1f3a), // Middle
                  Color(0xFF2d1b4e), // Bottom
                ],
              ),
            ),
          ),

          // 2. Animated Star Layers (Reusing the StarPainter logic)
          AnimatedBuilder(
            animation: _starController,
            builder: (context, child) {
              return Stack(
                children: [
                  CustomPaint(
                    painter: StarPainter(
                      animationValue: _starController.value,
                      count: 80,
                      speedScale: 1.0,
                      starSize: 2.0,
                      opacity: 0.9,
                    ),
                    size: Size.infinite,
                  ),
                  CustomPaint(
                    painter: StarPainter(
                      animationValue: _starController.value,
                      count: 50,
                      speedScale: 1.5,
                      starSize: 1.5,
                      opacity: 0.6,
                    ),
                    size: Size.infinite,
                  ),
                  CustomPaint(
                    painter: StarPainter(
                      animationValue: _starController.value,
                      count: 20,
                      speedScale: 2.0,
                      starSize: 3.0,
                      opacity: 0.4,
                    ),
                    size: Size.infinite,
                  ),
                ],
              );
            },
          ),

          // 3. Main Content (Scrollable)
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    maxWidth: 1000,
                  ), // Max width for content
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Welcome Section
                      _buildWelcomeSection(),
                      const SizedBox(height: 32),

                      // Loading Indicator
                      if (isLoading)
                        const Center(
                          child: CircularProgressIndicator(
                            color: Color(0xFFff9900),
                          ),
                        )
                      else ...[
                        // Stat Cards
                        _buildStatsCards(),
                        const SizedBox(height: 48),

                        // Quick Actions
                        _buildQuickActions(),
                        const SizedBox(height: 48),

                        // Progress Section
                        _buildProgressCard(),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // dashboard-title style
                  ShaderMask(
                    shaderCallback: (Rect bounds) {
                      return const LinearGradient(
                        colors: [Color(0xFFffffff), Color(0xFFffd700)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ).createShader(bounds);
                    },
                    child: const Text(
                      "Welcome Back, Stargazer!",
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w700,
                        color: Colors.white, // fallback
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // dashboard-subtitle style
                  const Text(
                    "Here's a summary of your celestial journey",
                    style: TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                ],
              ),
            ),
            OutlinedButton.icon(
              onPressed: () => _handleLogout(context),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: const BorderSide(color: Colors.white24),
              ),
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Logout'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatsCards() {
    final cardData = [
      {
        'icon': '📊',
        'value': stats.totalObservations.toString(),
        'label': 'Total Observations',
      },
      {
        'icon': '🌟',
        'value': stats.constellationsTracked.toString(),
        'label': 'Constellations Tracked',
      },
      {
        'icon': '⭐',
        'value': stats.favoriteConstellation,
        'label': 'Favorite Constellation',
      },
      {
        'icon': '📅',
        'value': _formatDateLocal(stats.lastObservationDate),
        'label': 'Last Observation',
      },
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        // Always use 2 columns on phone screens for better fit
        final crossAxisCount = constraints.maxWidth > 700 ? 4 : 2;

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.3, // Made wider/shorter to fit better on phone
          ),
          itemCount: cardData.length,
          itemBuilder: (context, index) {
            final item = cardData[index];
            return AnimatedBuilder(
              animation: _floatController,
              builder: (context, child) {
                // Replicates the 'float' keyframe animation
                final floatOffset =
                    -5 * math.sin(_floatController.value * 2 * math.pi);
                return Transform.translate(
                  offset: Offset(0, floatOffset),
                  child: _buildGlassCard(
                    padding: const EdgeInsets.all(16), // Reduced padding
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['icon']!,
                          style: const TextStyle(fontSize: 28),
                        ), // Smaller icon
                        const SizedBox(height: 6),
                        Text(
                          item['value']!,
                          style: const TextStyle(
                            fontSize: 20, // Smaller font
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFffd700), // stat-value
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          item['label']!,
                          style: const TextStyle(
                            color: Colors.white70, // stat-label
                            fontSize: 12, // Smaller label
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {'icon': '🔭', 'text': 'Browse Constellations', 'route': '/constellations'},
      {'icon': '➕', 'text': 'Log Observation', 'route': '/observations/new'},
      {'icon': '📷', 'text': 'My Observations', 'route': '/observations'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Quick Actions",
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: Color(0xFFffd700), // section-heading
          ),
        ),
        const SizedBox(height: 20),
        SizedBox(
          height: 150, // Fixed height for visual consistency
      child: Row(
        children: actions
            .map(
              (action) => Expanded(
                child: Padding(
                  padding: EdgeInsets.only(
                    right: action == actions.last ? 0 : 16,
                  ),
                  child: _buildActionButton(
                    action['icon']!,
                    action['text']!,
                    action['route']!,
                  ),
                ),
              ),
            )
            .toList(),
      ),
        ),
      ],
    );
  }

  Widget _buildActionButton(String icon, String text, String route) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10, width: 2),
        color: Colors.white.withOpacity(0.05),
      ),
      child: InkWell(
        onTap: () async {
          // Navigate to placeholder pages for now so the quick actions actually open.
          if (route == '/constellations') {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ConstellationsPage(authToken: widget.authToken),
              ),
            );
          } else if (route == '/observations/new') {
            await Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => LogObservationPage(authToken: widget.authToken),
              ),
            );
            // Refresh stats after returning from logging an observation
            _fetchDashboardData();
          } else if (route == '/observations') {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ObservationsPage(authToken: widget.authToken),
              ),
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Navigating to $text ($route)')),
            );
          }
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 8.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(icon, style: const TextStyle(fontSize: 32)), // action-icon
              const SizedBox(height: 8),
              Text(
                text,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600, // action-text
                  fontSize: 16,
                  height: 1.1,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressCard() {
    final progress = stats.constellationsTracked / 88;
    return _buildGlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Your Progress",
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: Color(0xFFffd700), // section-heading
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Constellations Discovered",
                style: TextStyle(color: Colors.white, fontSize: 16),
              ),
              Text(
                "${stats.constellationsTracked}/88",
                style: const TextStyle(color: Colors.white, fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            height: 10,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1), // progress background
              borderRadius: BorderRadius.circular(10),
            ),
            child: FractionallySizedBox(
              widthFactor: progress,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF4158d0),
                      Color(0xFFc850c0),
                    ], // progress-bar
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            "Keep exploring! You've tracked ${stats.constellationsTracked} out of 88 recognized constellations.",
            style: const TextStyle(color: Colors.white60), // text-muted
          ),
        ],
      ),
    );
  }

  // Helper function to create the Glassmorphism effect card (based on stat-card, progress-card)
  Widget _buildGlassCard({
    required Widget child,
    EdgeInsets padding = const EdgeInsets.all(24),
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(15),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(
              0.05,
            ), // background: rgba(255, 255, 255, 0.05)
            borderRadius: BorderRadius.circular(15),
            border: Border.all(
              color: Colors.white.withOpacity(
                0.1,
              ), // border: 1px solid rgba(255, 255, 255, 0.1)
              width: 1.0,
            ),
          ),
          child: Padding(padding: padding, child: child),
        ),
      ),
    );
  }
}

class ConstellationsPage extends StatelessWidget {
  final String? authToken;
  const ConstellationsPage({super.key, this.authToken});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _ConstellationsView(authToken: authToken),
    );
  }
}

class _Constellation {
  final String id;
  final String name;
  final String abbreviation;
  final String hemisphere;
  final String season;
  final String description;
  final String brightestStar;

  _Constellation({
    required this.id,
    required this.name,
    required this.abbreviation,
    required this.hemisphere,
    required this.season,
    required this.description,
    required this.brightestStar,
  });

  factory _Constellation.fromJson(Map<String, dynamic> json) {
    return _Constellation(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Unknown',
      abbreviation: json['abbreviation']?.toString() ?? '',
      hemisphere: json['hemisphere']?.toString() ?? 'Unknown',
      season: json['season']?.toString() ?? json['visibleIn']?.toString() ?? '',
      description: json['description']?.toString() ?? 'No description available.',
      brightestStar: json['brightestStar']?.toString() ?? 'Unknown',
    );
  }
}

class _ConstellationsView extends StatefulWidget {
  final String? authToken;
  const _ConstellationsView({super.key, this.authToken});

  @override
  State<_ConstellationsView> createState() => _ConstellationsViewState();
}

class _ConstellationsViewState extends State<_ConstellationsView> {
  // Match the local backend base for emulator.
  static const String _apiUrl = 'http://10.0.2.2:3000/api/constellations';

  late Future<List<_Constellation>> _futureConstellations;

  @override
  void initState() {
    super.initState();
    _futureConstellations = _fetchConstellations();
  }

  Future<List<_Constellation>> _fetchConstellations() async {
    final res = await http.get(Uri.parse(_apiUrl));
    if (res.statusCode != 200) {
      throw Exception('Failed to load constellations (${res.statusCode})');
    }
    final decoded = jsonDecode(res.body);

    // Handle multiple API shapes:
    // 1) { data: { constellations: [...] } }
    // 2) { constellations: [...] }
    // 3) [ ... ] directly
    List<dynamic> rawList;
    if (decoded is List) {
      rawList = decoded;
    } else if (decoded is Map<String, dynamic>) {
      if (decoded['data'] is Map &&
          (decoded['data'] as Map)['constellations'] is List) {
        rawList = (decoded['data'] as Map)['constellations'] as List<dynamic>;
      } else if (decoded['constellations'] is List) {
        rawList = decoded['constellations'] as List<dynamic>;
      } else {
        throw Exception('Unexpected response shape');
      }
    } else {
      throw Exception('Unexpected response shape');
    }

    return rawList
        .whereType<Map<String, dynamic>>()
        .map((item) => _Constellation.fromJson(item))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Browse Constellations',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
        backgroundColor: const Color(0xFF0a0e27),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      backgroundColor: const Color(0xFF0a0e27),
      body: FutureBuilder<List<_Constellation>>(
        future: _futureConstellations,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Could not load constellations.\n${snapshot.error}',
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          final constellations = snapshot.data ?? [];
          if (constellations.isEmpty) {
            return const Center(child: Text('No constellations found.'));
          }

          return Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: [0.0, 1.0],
                colors: [
                  Color(0xFF0a0e27),
                  Color(0xFF1a1f3a),
                ],
              ),
            ),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                final c = constellations[index];
                final displayHemisphere =
                    (c.hemisphere.isEmpty || c.hemisphere == 'Unknown')
                        ? (c.season.isNotEmpty ? c.season : 'Season')
                        : c.hemisphere;
                return Card(
                  color: const Color(0xFF161b3a),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: ListTile(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => ConstellationObservationsPage(
                            constellationId: c.id,
                            constellationName: c.name,
                            authToken: widget.authToken,
                          ),
                        ),
                      );
                    },
                    title: Text(
                      c.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(
                          '${c.abbreviation.isNotEmpty ? '${c.abbreviation} · ' : ''}$displayHemisphere',
                          style: const TextStyle(color: Colors.white70),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          c.description,
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white70),
                        ),
                        if (c.brightestStar.isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Text(
                            'Brightest star: ${c.brightestStar}',
                            style: const TextStyle(color: Colors.white70),
                          ),
                        ],
                      ],
                    ),
                    trailing:
                        const Icon(Icons.chevron_right, color: Colors.white70),
                  ),
                );
              },
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemCount: constellations.length,
            ),
          );
        },
      ),
    );
  }
}

// -----------------------------------------
// LOG OBSERVATION PAGE (in-app version of the web form)
// -----------------------------------------

class LogObservationPage extends StatefulWidget {
  final String? authToken;
  const LogObservationPage({super.key, this.authToken});

  @override
  State<LogObservationPage> createState() => _LogObservationPageState();
}

class _LogObservationPageState extends State<LogObservationPage> {
  // Point to local backend (Android emulator uses 10.0.2.2 to reach host machine).
  static const String _constellationsUrl =
      'http://10.0.2.2:3000/api/constellations';
  static const String _observationsUrl =
      'http://10.0.2.2:3000/api/observations';
  static const String _cloudinaryCloud = 'dmmntinwr';
  static const String _cloudinaryUploadPreset = 'ml_default';

  final _formKey = GlobalKey<FormState>();
  List<_Constellation> _constellations = [];
  _Constellation? _selectedConstellation;
  String _location = '';
  DateTime _observationDate = DateTime.now();
  String _notes = '';
  PlatformFile? _selectedFile;
  bool _isSubmitting = false;
  String? _submitError;

  @override
  void initState() {
    super.initState();
    _loadConstellations();
  }

  Future<void> _loadConstellations() async {
    try {
      final res = await http.get(Uri.parse(_constellationsUrl));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body);
        List<dynamic> rawList;
        if (decoded is List) {
          rawList = decoded;
        } else if (decoded is Map<String, dynamic>) {
          if (decoded['data'] is Map &&
              (decoded['data'] as Map)['constellations'] is List) {
            rawList =
                (decoded['data'] as Map)['constellations'] as List<dynamic>;
          } else if (decoded['constellations'] is List) {
            rawList = decoded['constellations'] as List<dynamic>;
          } else {
            rawList = [];
          }
        } else {
          rawList = [];
        }

        setState(() {
          _constellations = rawList
              .whereType<Map<String, dynamic>>()
              .map((item) => _Constellation.fromJson(item))
              .toList()
            ..sort((a, b) => a.name.compareTo(b.name));
        });
      } else {
        setState(() => _submitError =
            'Failed to load constellations (${res.statusCode})');
      }
    } catch (e) {
      setState(() => _submitError = 'Failed to load constellations: $e');
    }
  }

  Future<void> _pickImage() async {
    final picked = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true,
    );
    if (picked != null && picked.files.isNotEmpty) {
      setState(() {
        _selectedFile = picked.files.first;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedConstellation == null) {
      setState(() => _submitError = 'Please select a constellation.');
      return;
    }
    if (_selectedFile == null) {
      setState(() => _submitError = 'A photo is required to log your observation.');
      return;
    }

    _formKey.currentState!.save();
    setState(() {
      _isSubmitting = true;
      _submitError = null;
    });

    try {
      // 1) Upload to Cloudinary to get photoUrl + publicId
      final uploadResult = await _uploadToCloudinary(_selectedFile!);
      final photoUrl = uploadResult['secure_url'] ?? '';
      final publicId = uploadResult['public_id'] ?? '';
      if (photoUrl.isEmpty) {
        setState(() => _submitError = 'Image upload failed.');
        return;
      }

      // 2) Send observation to API with auth token
      final payload = {
        'constellationId': _selectedConstellation!.id,
        'photoUrl': photoUrl,
        'cloudinaryPublicId': publicId,
        'location': {'name': _location},
        'observationDate': _observationDate.toIso8601String(),
      };
      if (_notes.isNotEmpty) {
        payload['notes'] = _notes;
      }

      final res = await http.post(
        Uri.parse(_observationsUrl),
        headers: {
          'Content-Type': 'application/json',
          if (widget.authToken != null && widget.authToken!.isNotEmpty)
            'Authorization': 'Bearer ${widget.authToken}',
        },
        body: jsonEncode(payload),
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Observation logged successfully!')),
        );
        Navigator.of(context).pop();
      } else {
        setState(() => _submitError =
            'Failed to log observation (${res.statusCode}). ${res.body}');
      }
    } catch (e) {
      setState(() => _submitError = 'Failed to log observation: $e');
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Log New Observation',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
        ),
        centerTitle: true,
        backgroundColor: const Color(0xFF0a0e27),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      backgroundColor: const Color(0xFF0a0e27),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF161b3a),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Record your celestial discovery',
                  style: TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 16),

                // Constellation dropdown
                DropdownButtonFormField<_Constellation>(
                  dropdownColor: const Color(0xFF161b3a),
                  decoration: _inputDecoration('Constellation *'),
                  items: _constellations
                      .map(
                        (c) => DropdownMenuItem(
                          value: c,
                          child: Text(
                            c.name,
                            style: const TextStyle(color: Colors.white),
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (val) => setState(() => _selectedConstellation = val),
                  validator: (val) =>
                      val == null ? 'Please select a constellation' : null,
                  value: _selectedConstellation,
                ),
                const SizedBox(height: 16),

                // Photo picker
                InkWell(
                  onTap: _pickImage,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.04),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.photo_camera, color: Colors.white70),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _selectedFile?.name ?? 'Upload Photo (required)',
                            style: const TextStyle(color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Location
                TextFormField(
                  style: const TextStyle(color: Colors.white),
                  decoration: _inputDecoration('Location *')
                      .copyWith(hintText: 'e.g., Orlando, FL'),
                  validator: (val) =>
                      (val == null || val.isEmpty) ? 'Location is required' : null,
                  onSaved: (val) => _location = val ?? '',
                ),
                const SizedBox(height: 16),

                // Date picker
                GestureDetector(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _observationDate,
                      firstDate: DateTime(2000),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                      builder: (context, child) {
                        return Theme(
                          data: Theme.of(context).copyWith(
                            colorScheme: const ColorScheme.dark(
                              primary: Color(0xFF4158d0),
                              surface: Color(0xFF161b3a),
                            ),
                          ),
                          child: child!,
                        );
                      },
                    );
                    if (picked != null) {
                      setState(() => _observationDate = picked);
                    }
                  },
                  child: AbsorbPointer(
                    child: TextFormField(
                      style: const TextStyle(color: Colors.white),
                      decoration: _inputDecoration('Observation Date *'),
                      controller: TextEditingController(
                        text:
                            '${_observationDate.year}-${_observationDate.month.toString().padLeft(2, '0')}-${_observationDate.day.toString().padLeft(2, '0')}',
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Notes
                TextFormField(
                  style: const TextStyle(color: Colors.white),
                  decoration: _inputDecoration('Notes').copyWith(
                    hintText:
                        'Add any notes about your observation (conditions, equipment, etc.)',
                  ),
                  maxLines: 3,
                  onSaved: (val) => _notes = val ?? '',
                ),
                const SizedBox(height: 16),

                if (_submitError != null) ...[
                  Text(
                    _submitError!,
                    style: const TextStyle(color: Colors.redAccent),
                  ),
                  const SizedBox(height: 12),
                ],

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4158d0),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                              strokeWidth: 2,
                            ),
                          )
                        : const Text('Submit Observation'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.white70),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.2)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFF4158d0)),
      ),
      filled: true,
      fillColor: Colors.white.withOpacity(0.04),
    );
  }

  Future<Map<String, dynamic>> _uploadToCloudinary(PlatformFile file) async {
    if (_cloudinaryUploadPreset.isEmpty) {
      throw Exception('Cloudinary upload preset is not set.');
    }

    final uri = Uri.parse(
        'https://api.cloudinary.com/v1_1/$_cloudinaryCloud/image/upload');

    final req = http.MultipartRequest('POST', uri)
      ..fields['upload_preset'] = _cloudinaryUploadPreset
      ..files.add(
        http.MultipartFile.fromBytes(
          'file',
          file.bytes!,
          filename: file.name,
          contentType: MediaType('image', 'jpeg'),
        ),
      );

    final res = await req.send();
    final body = await res.stream.bytesToString();
    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(body) as Map<String, dynamic>;
    }
    throw Exception('Cloudinary upload failed (${res.statusCode}): $body');
  }
}

// -----------------------------------------
// OBSERVATIONS LIST PAGE
// -----------------------------------------

class _Observation {
  final String id;
  final String photoUrl;
  final String notes;
  final String locationName;
  final DateTime? observationDate;
  final String constellationName;
  final String constellationAbbr;

  _Observation({
    required this.id,
    required this.photoUrl,
    required this.notes,
    required this.locationName,
    required this.observationDate,
    required this.constellationName,
    required this.constellationAbbr,
  });

  factory _Observation.fromJson(Map<String, dynamic> json) {
    final constel = json['constellationId'];
    return _Observation(
      id: json['_id']?.toString() ?? '',
      photoUrl: json['photoUrl']?.toString() ?? '',
      notes: json['notes']?.toString() ?? '',
      locationName: json['location'] is Map<String, dynamic>
          ? (json['location']['name']?.toString() ?? '')
          : json['location']?.toString() ?? '',
      observationDate: json['observationDate'] != null
          ? DateTime.tryParse(json['observationDate'])
          : null,
      constellationName: constel is Map<String, dynamic>
          ? (constel['name']?.toString() ?? '')
          : '',
      constellationAbbr: constel is Map<String, dynamic>
          ? (constel['abbreviation']?.toString() ?? '')
          : '',
    );
  }
}

class ObservationsPage extends StatefulWidget {
  final String? authToken;
  const ObservationsPage({super.key, this.authToken});

  @override
  State<ObservationsPage> createState() => _ObservationsPageState();
}

// Shows images for a single constellation
class ConstellationObservationsPage extends StatefulWidget {
  final String constellationId;
  final String constellationName;
  final String? authToken;
  const ConstellationObservationsPage({
    super.key,
    required this.constellationId,
    required this.constellationName,
    this.authToken,
  });

  @override
  State<ConstellationObservationsPage> createState() =>
      _ConstellationObservationsPageState();
}

class _ConstellationObservationsPageState
    extends State<ConstellationObservationsPage> {
  static const String _observationsUrl =
      'http://10.0.2.2:3000/api/observations';
  late Future<List<_Observation>> _futureObs;

  @override
  void initState() {
    super.initState();
    _futureObs = _fetchObservations();
  }

  Future<List<_Observation>> _fetchObservations() async {
    final uri = Uri.parse(
        '$_observationsUrl?constellationId=${Uri.encodeComponent(widget.constellationId)}');
    final res = await http.get(
      uri,
      headers: {
        if (widget.authToken != null && widget.authToken!.isNotEmpty)
          'Authorization': 'Bearer ${widget.authToken}',
      },
    );
    if (res.statusCode != 200) {
      throw Exception('Failed to load observations (${res.statusCode})');
    }
    final decoded = jsonDecode(res.body);
    final list = decoded['observations'] as List<dynamic>? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map((j) => _Observation.fromJson(j))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.constellationName,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
        ),
        backgroundColor: const Color(0xFF0a0e27),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      backgroundColor: const Color(0xFF0a0e27),
      body: FutureBuilder<List<_Observation>>(
        future: _futureObs,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Could not load observations.\n${snapshot.error}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            );
          }
          final obs = snapshot.data ?? [];
          if (obs.isEmpty) {
            return const Center(
              child: Text(
                'No photos for this constellation yet.',
                style: TextStyle(color: Colors.white70),
              ),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(12),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 3 / 4,
            ),
            itemCount: obs.length,
            itemBuilder: (context, index) {
              final o = obs[index];
              return Card(
                color: const Color(0xFF161b3a),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: o.photoUrl.isNotEmpty
                          ? Image.network(
                              o.photoUrl,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              errorBuilder: (_, __, ___) => Container(
                                color: Colors.black26,
                                child: const Center(
                                  child: Icon(Icons.broken_image,
                                      color: Colors.white54),
                                ),
                              ),
                            )
                          : Container(
                              color: Colors.black26,
                              child: const Center(
                                child: Icon(Icons.image_not_supported,
                                    color: Colors.white54),
                              ),
                            ),
                    ),
                    Padding(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (o.locationName.isNotEmpty)
                            Text(
                              o.locationName,
                              style: const TextStyle(
                                  color: Colors.white70, fontSize: 12),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          if (o.observationDate != null)
                            Text(
                              o.observationDate!
                                  .toLocal()
                                  .toIso8601String()
                                  .split('T')
                                  .first,
                              style: const TextStyle(
                                  color: Colors.white70, fontSize: 12),
                            ),
                          if (o.notes.isNotEmpty)
                            Text(
                              o.notes,
                              style: const TextStyle(
                                  color: Colors.white70, fontSize: 12),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _ObservationsPageState extends State<ObservationsPage> {
  static const String _observationsUrl =
      'http://10.0.2.2:3000/api/observations';
  late Future<List<_Observation>> _futureObs;

  @override
  void initState() {
    super.initState();
    _futureObs = _fetchObservations();
  }

  Future<List<_Observation>> _fetchObservations() async {
    final res = await http.get(
      Uri.parse(_observationsUrl),
      headers: {
        if (widget.authToken != null && widget.authToken!.isNotEmpty)
          'Authorization': 'Bearer ${widget.authToken}',
      },
    );
    if (res.statusCode != 200) {
      throw Exception('Failed to load observations (${res.statusCode})');
    }
    final decoded = jsonDecode(res.body);
    final list = decoded['observations'] as List<dynamic>? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map((j) => _Observation.fromJson(j))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'My Observations',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
        ),
        backgroundColor: const Color(0xFF0a0e27),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      backgroundColor: const Color(0xFF0a0e27),
      body: FutureBuilder<List<_Observation>>(
        future: _futureObs,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Could not load observations.\n${snapshot.error}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            );
          }
          final obs = snapshot.data ?? [];
          if (obs.isEmpty) {
            return const Center(
              child: Text(
                'No observations yet.',
                style: TextStyle(color: Colors.white70),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: obs.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final o = obs[index];
              return Card(
                color: const Color(0xFF161b3a),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(12),
                        topRight: Radius.circular(12),
                      ),
                      child: o.photoUrl.isNotEmpty
                          ? Image.network(
                              o.photoUrl,
                              fit: BoxFit.cover,
                              height: 180,
                              width: double.infinity,
                              errorBuilder: (_, __, ___) => Container(
                                color: Colors.black26,
                                height: 180,
                                child: const Center(
                                  child: Icon(Icons.broken_image,
                                      color: Colors.white54),
                                ),
                              ),
                            )
                          : Container(
                              color: Colors.black26,
                              height: 180,
                              child: const Center(
                                child:
                                    Icon(Icons.image_not_supported, color: Colors.white54),
                              ),
                            ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            o.constellationName.isNotEmpty
                                ? o.constellationName
                                : 'Unknown Constellation',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (o.constellationAbbr.isNotEmpty)
                            Text(
                              o.constellationAbbr,
                              style: const TextStyle(color: Colors.white70),
                            ),
                          const SizedBox(height: 6),
                          if (o.locationName.isNotEmpty)
                            Text(
                              'Location: ${o.locationName}',
                              style: const TextStyle(color: Colors.white70),
                            ),
                          if (o.observationDate != null)
                            Text(
                              'Date: ${o.observationDate!.toLocal().toIso8601String().split('T').first}',
                              style: const TextStyle(color: Colors.white70),
                            ),
                          if (o.notes.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(
                              o.notes,
                              style: const TextStyle(color: Colors.white70),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}

// -----------------------------------------
// CUSTOM PAINTERS (Copied from main.dart to make this file self-contained)
// -----------------------------------------

/// Generates the animated starfield background.
class StarPainter extends CustomPainter {
  final double animationValue;
  final int count;
  final double speedScale;
  final double starSize;
  final double opacity;
  final List<Offset> starPositions;

  StarPainter({
    required this.animationValue,
    required this.count,
    this.speedScale = 1.0,
    this.starSize = 2.0,
    this.opacity = 1.0,
  }) : starPositions = List.generate(count, (index) {
         final random = math.Random(index);
         return Offset(random.nextDouble(), random.nextDouble());
       });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(opacity)
      ..style = PaintingStyle.fill;

    for (var basePos in starPositions) {
      // Diagonal movement logic (simulating background-position: 10000px 10000px)
      double move = animationValue * speedScale;

      double xMove =
          (move * 0.2) + basePos.dx; // Slower X movement for diagonal look
      double yMove = move + basePos.dy;

      xMove = xMove % 1.0;
      yMove = yMove % 1.0;

      final x = xMove * size.width;
      final y = yMove * size.height;

      // Wrap-around logic for stars that move off-screen
      if (x >= 0 && x <= size.width && y >= 0 && y <= size.height) {
        canvas.drawCircle(Offset(x, y), starSize, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant StarPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue;
  }
}
