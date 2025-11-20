// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_frontend/main.dart';

void main() {
  testWidgets('Login screen renders', (WidgetTester tester) async {
    // Build the actual app entry point.
    await tester.pumpWidget(const StargazerApp());

    // Verify the sign-in button is present on first frame.
    expect(find.text('Sign In'), findsOneWidget);
  });
}
