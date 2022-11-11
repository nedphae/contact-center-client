import 'package:contact_mobile_client/common/config.dart';
import 'package:contact_mobile_client/common/globals.dart';
import 'package:contact_mobile_client/states/state.dart';
import 'package:contact_mobile_client/widgets/custombutton.dart';
import 'package:contact_mobile_client/widgets/customtextinput.dart';
import 'package:edge_alerts/edge_alerts.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:modal_progress_hud_nsn/modal_progress_hud_nsn.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import 'dart:convert';
import 'package:http/http.dart' as http;

import '../model/staff.dart';

Future<OauthToken?> attemptLogIn(
    {required int orgId,
    required String username,
    required String password}) async {
  String credentials = "Xsrr8fXfGJ:K&wroZ4M6z4@a!W62q\$*Dks";
  Codec<String, String> stringToBase64 = utf8.fuse(base64);
  String encoder = stringToBase64.encoder.convert(credentials);
  String url = "$serverIp/oauth/token?grant_type=password";
  var res = await http.post(Uri.parse(url),
      headers: <String, String>{
        'Authorization': "Basic $encoder",
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: "org_id=$orgId&username=$username&password=$password");
  if (res.statusCode == 200) {
    return compute((message) {
      final parsed = jsonDecode(message) as Map<String, dynamic>;
      return OauthToken.fromJson(parsed);
    }, res.body);
  }
  return null;
}

class XBCSLogin extends StatefulHookConsumerWidget {
  // const ChatterLogin({super.key});
  const XBCSLogin({Key? key}) : super(key: key);

  @override
  XBCSLoginState createState() => XBCSLoginState();
}

class XBCSLoginState extends ConsumerState<XBCSLogin> {
  int? orgId;
  String? username;
  String? password;
  bool login = false;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 1), () {
      ref.refresh(staffProvider);
      ref.refresh(chatStateProvider);
    });
  }

  void _saveJwt({required OauthToken oauth}) async {
    Globals.prefs.setString(Globals.prefsOauthToken, jsonEncode(oauth));
    Globals.prefs.setString(Globals.prefsAccessToken, oauth.accessToken);
  }

  @override
  Widget build(BuildContext context) {
    return ModalProgressHUD(
      inAsyncCall: login,
      child: Scaffold(
        // backgroundColor: Colors.transparent,
        body: SingleChildScrollView(
          child: SizedBox(
            height: MediaQuery.of(context).size.height,
            // margin: EdgeInsets.only(top:MediaQuery.of(context).size.height*0.2),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: <Widget>[
                  Hero(
                    tag: 'heroicon',
                    child: Icon(
                      Icons.textsms,
                      size: 120,
                      color: Colors.deepPurple[900],
                    ),
                  ),
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.02,
                  ),
                  Hero(
                    tag: 'HeroTitle',
                    child: Text(
                      '小白客服',
                      style: TextStyle(
                          color: Colors.deepPurple[900],
                          fontFamily: 'Poppins',
                          fontSize: 26,
                          fontWeight: FontWeight.w700),
                    ),
                  ),
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.01,
                  ),
                  // Text(
                  //   "World's most private chatting app".toUpperCase(),
                  //   style: TextStyle(
                  //       fontFamily: 'Poppins',
                  //       fontSize: 12,
                  //       color: Colors.deepPurple),
                  // ),
                  CustomTextInput(
                    hintText: AppLocalizations.of(context)!.orgId,
                    leading: Icons.numbers,
                    obscure: false,
                    keyboard: TextInputType.number,
                    userTyped: (val) {
                      orgId = int.parse(val);
                    },
                  ),
                  const SizedBox(
                    height: 0,
                  ),
                  CustomTextInput(
                    hintText: AppLocalizations.of(context)!.username,
                    leading: Icons.person,
                    obscure: false,
                    keyboard: TextInputType.text,
                    userTyped: (val) {
                      username = val;
                    },
                  ),
                  const SizedBox(
                    height: 0,
                  ),
                  CustomTextInput(
                    hintText: AppLocalizations.of(context)!.password,
                    leading: Icons.lock,
                    obscure: true,
                    userTyped: (val) {
                      password = val;
                    },
                  ),
                  const SizedBox(
                    height: 30,
                  ),
                  Hero(
                    tag: 'login-button',
                    child: CustomButton(
                      text: AppLocalizations.of(context)!.login,
                      accentColor: Colors.white,
                      mainColor: Colors.deepPurple,
                      onpress: () async {
                        if (password != null &&
                            username != null &&
                            orgId != null) {
                          setState(() {
                            login = true;
                          });
                          try {
                            final loggedUser = await attemptLogIn(
                                orgId: orgId!,
                                username: username!,
                                password: password!);
                            if (loggedUser != null) {
                              // 添加 JWT 到 状态容器
                              _saveJwt(oauth: loggedUser);

                              setState(() {
                                login = false;
                              });

                              if (!mounted) return;
                              Navigator.of(context).pushNamedAndRemoveUntil(
                                  '/home', ModalRoute.withName('/'));
                            } else {
                              setState(() {
                                login = false;
                              });
                              if (!mounted) return;
                              edgeAlert(context,
                                  title:
                                      AppLocalizations.of(context)!.loginFailed,
                                  description: AppLocalizations.of(context)!
                                      .pleaseCheckYourUsernameAndPassword,
                                  gravity: Gravity.bottom,
                                  icon: Icons.error,
                                  duration: 5,
                                  backgroundColor: Colors.redAccent);
                            }
                          } catch (e) {
                            setState(() {
                              login = false;
                            });
                            edgeAlert(context,
                                title:
                                    AppLocalizations.of(context)!.loginFailed,
                                description: e.toString(),
                                gravity: Gravity.bottom,
                                icon: Icons.error,
                                duration: 5,
                                backgroundColor: Colors.redAccent);
                          }
                        } else {
                          edgeAlert(context,
                              title: AppLocalizations.of(context)!.error,
                              description: AppLocalizations.of(context)!
                                  .pleaseEnterTheUsernameAndPassword,
                              gravity: Gravity.bottom,
                              icon: Icons.error,
                              duration: 5,
                              backgroundColor: Colors.redAccent);
                        }
                        // Navigator.pushReplacementNamed(context, '/chat');
                      },
                    ),
                  ),
                  const SizedBox(
                    height: 5,
                  ),
                  // GestureDetector(
                  //     onTap: () {
                  //       Navigator.pushReplacementNamed(context, '/signup');
                  //     },
                  //     child: const Text(
                  //       'or create an account',
                  //       style: TextStyle(
                  //           fontFamily: 'Poppins',
                  //           fontSize: 12,
                  //           color: Colors.deepPurple),
                  //     )),
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.1,
                  ),
                  const Hero(
                    tag: 'footer',
                    child: Text(
                      '小白客服',
                      style: TextStyle(fontFamily: 'Poppins'),
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
