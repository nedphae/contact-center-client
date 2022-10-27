import 'dart:ui';

class ColorUtil {
  /// String is in the format "aabbcc" or "ffaabbcc" with an optional leading "#".
  static Color fromHex(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');

    buffer.write(hexString.replaceFirst('#', ''));
    final hexColor = int.parse(buffer.toString(), radix: 16);
    return Color(hexColor);
  }
}
