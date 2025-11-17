import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;

Future<void> uploadImage(String apiBase, String? token) async {
  final picked = await FilePicker.platform.pickFiles(
    type: FileType.image,
    withData: true,
  );
  if (picked == null || picked.files.isEmpty) return;
  final f = picked.files.first;

  final req = http.MultipartRequest(
    'POST',
    Uri.parse('$apiBase/api/constellations'),
  );
  req.files.add(
    http.MultipartFile.fromBytes('image', f.bytes!, filename: f.name),
  );
  if (token != null) req.headers['Authorization'] = 'Bearer $token';

  final res = await req.send();
  if (res.statusCode != 200 && res.statusCode != 201) {
    throw Exception('Upload failed: ${res.statusCode}');
  }
}
