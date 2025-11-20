import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() {
  runApp(const StargazerApp());
}

class StargazerApp extends StatelessWidget {
  const StargazerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Stargazer Login',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Archivo', // Assuming you add the font to pubspec, otherwise falls back to default
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4158d0)),
      ),
      home: const LoginPage(),
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> with TickerProviderStateMixin {
  // Controllers for animations
  late final AnimationController _floatController;
  late final AnimationController _starController;

  // Form State
  final _formKey = GlobalKey<FormState>();
  bool _isPasswordVisible = false;
  bool _rememberMe = false;
  bool _isLoading = false;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    
    // Floating animation for the icon (CSS @keyframes float)
    _floatController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    // Continuous loop for stars (CSS @keyframes animateStars)
    _starController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 100),
    )..repeat();
  }

  @override
  void dispose() {
    _floatController.dispose();
    _starController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));
      
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Welcome, Stargazer!"),
            backgroundColor: Color(0xFF4158d0),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // ResizeToAvoidBottomInset ensures the keyboard doesn't cover the UI badly,
      // but we also use SingleChildScrollView below.
      resizeToAvoidBottomInset: true, 
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
                  Color(0xFF0a0e27),
                  Color(0xFF1a1f3a),
                  Color(0xFF2d1b4e),
                ],
              ),
            ),
          ),

          // 2. Animated Star Layers (Custom Painted for performance)
          AnimatedBuilder(
            animation: _starController,
            builder: (context, child) {
              return Stack(
                children: [
                  // Layer 1: Small, bright, slow
                  CustomPaint(
                    painter: StarPainter(
                      animationValue: _starController.value,
                      count: 50,
                      speedScale: 1.0,
                      starSize: 2.0,
                      opacity: 0.9,
                    ),
                    size: Size.infinite,
                  ),
                  // Layer 2: Medium, dimmer, faster
                  CustomPaint(
                    painter: StarPainter(
                      animationValue: _starController.value,
                      count: 30,
                      speedScale: 1.5,
                      starSize: 1.5,
                      opacity: 0.6,
                    ),
                    size: Size.infinite,
                  ),
                  // Layer 3: Large, faint
                  CustomPaint(
                    painter: StarPainter(
                      animationValue: _starController.value,
                      count: 15,
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

          // 3. Main Content
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 400),
                  child: _buildGlassCard(context),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassCard(BuildContext context) {
    // The Glassmorphism Card
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.95),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: Colors.white.withOpacity(0.2),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF4158d0).withOpacity(0.2),
                blurRadius: 40,
                spreadRadius: 10,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Animated Icon
                AnimatedBuilder(
                  animation: _floatController,
                  builder: (context, child) {
                    return Transform.translate(
                      offset: Offset(0, -10 * math.sin(_floatController.value * 2 * math.pi)),
                      child: child,
                    );
                  },
                  child: const ConstellationIcon(size: 60, color: Color(0xFFff9900)),
                ),
                const SizedBox(height: 16),
                
                // Title
                const Text(
                  "Stargazer",
                  style: TextStyle(
                    color: Color(0xFF1a1f3a),
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  "Chart your celestial journey!",
                  style: TextStyle(
                    color: Color(0xFF08197a),
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 32),

                // Form
                Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel("Email"),
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        autofillHints: const [AutofillHints.email],
                        style: const TextStyle(
                            color: Color(0xFF1a1f3a), fontWeight: FontWeight.w500),
                        decoration: _inputDecoration("Enter your email"),
                        validator: (value) {
                          if (value == null || value.isEmpty) return 'Please enter your email';
                          if (!value.contains('@')) return 'Please enter a valid email';
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),

                      _buildLabel("Password"),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: !_isPasswordVisible,
                        autofillHints: const [AutofillHints.password],
                        style: const TextStyle(
                            color: Color(0xFF1a1f3a), fontWeight: FontWeight.w500),
                        decoration: _inputDecoration("Enter your password").copyWith(
                          suffixIcon: IconButton(
                            icon: Icon(
                              _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
                              color: Colors.grey,
                            ),
                            onPressed: () =>
                                setState(() => _isPasswordVisible = !_isPasswordVisible),
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) return 'Please enter your password';
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),

                      // Remember Me
                      Row(
                        children: [
                          SizedBox(
                            height: 24,
                            width: 24,
                            child: Checkbox(
                              value: _rememberMe,
                              activeColor: const Color(0xFF4158d0),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                              onChanged: (val) => setState(() => _rememberMe = val!),
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            "Remember me",
                            style: TextStyle(
                              color: Color(0xFF08197a),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Gradient Button
                      Container(
                        width: double.infinity,
                        height: 50,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          gradient: const LinearGradient(
                            colors: [Color(0xFF4158d0), Color(0xFFc850c0)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF4158d0).withOpacity(0.4),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Text(
                                  "Sign In",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      Center(
                        child: GestureDetector(
                          onTap: () {
                            // Navigate to forgot password
                          },
                          child: const Text(
                            "Forgot password?",
                            style: TextStyle(
                              color: Color(0xFF08197a),
                              fontWeight: FontWeight.w500,
                              decoration: TextDecoration.none, // Removed underline by default
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),
                const Divider(height: 1, color: Color(0x1A000000)),
                const SizedBox(height: 24),

                Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Don't have an account? ",
                        style: TextStyle(
                          color: Color(0xFF08197a),
                          fontWeight: FontWeight.w600,
                          fontSize: 15, 
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                           // Navigate to register
                        },
                        child: const Text(
                          "Sign up",
                          style: TextStyle(
                            color: Color(0xFFc850c0),
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Helper for Input Labels
  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(
        text,
        style: const TextStyle(
          color: Color(0xFF1a1f3a),
          fontWeight: FontWeight.w600,
          fontSize: 16,
        ),
      ),
    );
  }

  // Helper for Input Decoration
  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.grey),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFFE0E0E0), width: 2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFF4158d0), width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Colors.red, width: 2),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Colors.red, width: 2),
      ),
    );
  }
}

// -----------------------------------------
// CUSTOM PAINTERS
// -----------------------------------------

// 1. The Constellation Icon from SVG
class ConstellationIcon extends StatelessWidget {
  final double size;
  final Color color;

  const ConstellationIcon({
    super.key,
    this.size = 60,
    this.color = const Color(0xFFff9900),
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: ConstellationPainter(color: color),
    );
  }
}

class ConstellationPainter extends CustomPainter {
  final Color color;
  ConstellationPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill; // For dots

    final linePaint = Paint()
      ..color = color
      ..strokeWidth = size.width * 0.025
      ..style = PaintingStyle.stroke;

    // Scaling factor based on the original SVG viewbox (0 0 60 60)
    final double scaleX = size.width / 60;
    final double scaleY = size.height / 60;

    // Points from SVG
    final p1 = Offset(10 * scaleX, 15 * scaleY);
    final p2 = Offset(25 * scaleX, 10 * scaleY);
    final p3 = Offset(40 * scaleX, 20 * scaleY);
    final p4 = Offset(50 * scaleX, 35 * scaleY);
    final p5 = Offset(35 * scaleX, 45 * scaleY);
    final p6 = Offset(15 * scaleX, 40 * scaleY);

    // Draw Lines
    canvas.drawLine(p1, p2, linePaint);
    canvas.drawLine(p2, p3, linePaint);
    canvas.drawLine(p3, p4, linePaint);
    canvas.drawLine(p4, p5, linePaint);
    canvas.drawLine(p5, p6, linePaint);
    canvas.drawLine(p6, p1, linePaint);

    // Draw Dots (Circles)
    canvas.drawCircle(p1, 3 * scaleX, paint);
    canvas.drawCircle(p2, 2.5 * scaleX, paint);
    canvas.drawCircle(p3, 3 * scaleX, paint);
    canvas.drawCircle(p4, 2.5 * scaleX, paint);
    canvas.drawCircle(p5, 2.5 * scaleX, paint);
    canvas.drawCircle(p6, 2.5 * scaleX, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

// 2. Star Field Background
class StarPainter extends CustomPainter {
  final double animationValue; // 0.0 to 1.0
  final int count;
  final double speedScale;
  final double starSize;
  final double opacity;
  final List<Offset> starPositions;

  // Generate random fixed positions
  StarPainter({
    required this.animationValue,
    required this.count,
    this.speedScale = 1.0,
    this.starSize = 2.0,
    this.opacity = 1.0,
  }) : starPositions = List.generate(count, (index) {
          // Seed random so stars stay in same X place but move Y
          final random = math.Random(index); 
          return Offset(random.nextDouble(), random.nextDouble());
        });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(opacity)
      ..style = PaintingStyle.fill;

    for (var basePos in starPositions) {
      // Calculate Y movement
      // We want them to move diagonally/down like the CSS animation
      // CSS: background-position: 10000px 10000px;
      
      double yMove = (animationValue * speedScale) + basePos.dy;
      // Wrap around logic: modulo 1.0
      yMove = yMove % 1.0;

      // Optionally add X movement if you want diagonal
      // double xMove = (animationValue * speedScale * 0.5) + basePos.dx;
      // xMove = xMove % 1.0;
      
      final x = basePos.dx * size.width;
      final y = yMove * size.height;

      canvas.drawCircle(Offset(x, y), starSize, paint);
    }
  }

  @override
  bool shouldRepaint(covariant StarPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue;
  }
}