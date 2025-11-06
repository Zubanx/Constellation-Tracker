import 'dart:convert';
import 'package:http/http.dart' as http;

const apiBase = 'http://localhost:3000'; // your backend

class Api {
  String? token;

  Future<void> login(String username, String password) async {
    final r = await http.post(
      Uri.parse('$apiBase/user/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    if (r.statusCode != 200) {
      throw Exception('Login failed (${r.statusCode})');
    }
    final data = jsonDecode(r.body) as Map<String, dynamic>;
    token = data['token'] as String?;
    if (token == null) throw Exception('No token in response');
  }

  //Register
  Future<String> signup({
    required String username,
    required String email,
    required String password,
    required String passwordConfirm,
  }) async {
    final r = await http.post(
      Uri.parse('$apiBase/user/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'email': email,
        'password': password,
        'passwordConfirm': passwordConfirm,
      }),
    );

    final body = r.body.isNotEmpty ? jsonDecode(r.body) : {};
    if (r.statusCode != 201 && r.statusCode != 200) {
      final msg =
          body['message'] ??
          body['error']?.toString() ??
          'Signup failed (${r.statusCode})';
      throw Exception(msg);
    }
    // Backend returns a message like “Registration successful! Please check your email…”
    return (body['message'] ?? 'Registration successful. Check your email.')
        as String;
  }

  // Logout (client-side)
  void logout() {
    token = null;
  }

  Map<String, String> get _auth =>
      token == null ? {} : {'Authorization': 'Bearer $token'};

  Future<List<dynamic>> listPhotos({String? constellation}) async {
    final url = (constellation == null || constellation.isEmpty)
        ? '$apiBase/constellations'
        : '$apiBase/constellations?constellation=${Uri.encodeQueryComponent(constellation)}';
    final r = await http.get(Uri.parse(url), headers: _auth);
    if (r.statusCode != 200) throw Exception('Fetch failed');
    return jsonDecode(r.body) as List<dynamic>;
  }

  Future<void> deletePhoto(String id) async {
    final r = await http.delete(
      Uri.parse('$apiBase/constellations/$id'),
      headers: _auth,
    );
    if (r.statusCode != 200) throw Exception('Delete failed');
  }
}
