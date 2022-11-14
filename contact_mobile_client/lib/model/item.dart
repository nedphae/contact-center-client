import 'package:flutter/cupertino.dart';

class ItemModel {
  String title;
  IconData icon;
  void Function()? onTap;

  ItemModel({required this.title, required this.icon, this.onTap});
}
