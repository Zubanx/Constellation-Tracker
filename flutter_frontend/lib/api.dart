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
