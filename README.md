# Ricoshot

A balls-vs-bricks shooter for Android. Aim once, fire the whole volley, and break every brick before you run out of shots.

- 60 levels (15 hand-built, 45 generated from a fixed seed) with 1 to 3 stars each
- Endless Challenge mode where bricks drop a row every turn
- Pickups: +1 ball rings, row and column lasers, scatter stars, coins
- Power-ups: Bomb, x2 Damage, Row Clear
- 12 ball skins in the shop
- Fully offline, no ads, no tracking

App ID: `com.golamlab.ricoshot`

## How the project is laid out

```
www/                 the game itself (one index.html + bundled fonts)
android/             the Android app that wraps the game (Capacitor)
assets/              icon and splash source images
tools/level-bot.js   plays every level to check the shot limits are fair
.github/workflows/   builds the APK on GitHub
```

The whole game lives in `www/index.html`. To change anything in the game, edit that file, then push.

## Getting an APK (no Android Studio needed)

1. Create a new empty repo on GitHub, for example `Ricoshot`.
2. Push this folder to it:
   ```
   git remote add origin https://github.com/<you>/Ricoshot.git
   git branch -M main
   git push -u origin main
   ```
3. Open the repo on GitHub and go to the **Actions** tab. The **Build Android** run starts on its own. It takes about 5 minutes.
4. When it shows a green tick, open the run and scroll to **Artifacts**. Download **ricoshot-debug-apk**, unzip it, and install `app-debug.apk` on your phone.

Every push to `main` builds a fresh APK. You can also start a build by hand from Actions > Build Android > Run workflow.

## Signed release for the Play Store

The debug APK is for testing on your own phone. Google Play needs a signed `.aab`. The workflow builds one automatically once you add a signing key.

1. Make a keystore once and keep it safe. If you lose it you can't update the app on Play.
   ```
   keytool -genkey -v -keystore ricoshot.jks -alias ricoshot -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Turn it into text:
   - Mac/Linux: `base64 -i ricoshot.jks | tr -d '\n' > ricoshot.b64`
   - Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("ricoshot.jks")) > ricoshot.b64`
3. In the GitHub repo, go to Settings > Secrets and variables > Actions and add four repository secrets:

   | Secret | Value |
   |---|---|
   | `RICOSHOT_KEYSTORE_BASE64` | the contents of `ricoshot.b64` |
   | `RICOSHOT_KEYSTORE_PASSWORD` | the keystore password |
   | `RICOSHOT_KEY_ALIAS` | `ricoshot` (or whatever alias you used) |
   | `RICOSHOT_KEY_PASSWORD` | the key password |

4. Push again. The run now also produces a **ricoshot-release** artifact containing `app-release.aab` (upload this to Play Console) and `app-release.apk`.

Version numbers are set automatically: each GitHub build uses its run number as the `versionCode`, so every upload to Play is higher than the last.

Never commit the `.jks` file. `.gitignore` already blocks it.

## Building on your own computer (optional)

Needs Node 22+, JDK 21 and Android Studio.

```
npm install
npx cap sync android
npx cap open android      # opens Android Studio, press Run
```

## Changing the icon or splash

Replace the images in `assets/` (`icon-only.png` 1024x1024, `icon-foreground.png` with the art inside the middle 66%, `splash.png` 2732x2732), then run:

```
npx capacitor-assets generate --android --iconBackgroundColor '#0A0D28' --splashBackgroundColor '#04050F'
```

## Tuning the game

All the numbers are in the `CONFIG` block at the top of the script in `www/index.html`: ball speed, fire delay, star thresholds, prices, challenge difficulty.

If you change levels, ball counts or physics, run `node tools/level-bot.js` and check that every level still shows at least 75% bot win rate. Adjust the `shots` values (levels 1 to 15) or the `GEN_SHOTS` list (levels 16 to 60) if not.

## Fonts

Bungee and Rubik are bundled in `www/fonts` under the SIL Open Font License (licence files included).
