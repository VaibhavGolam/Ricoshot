# Ricoshot

A balls-vs-bricks shooter for Android. Aim once, fire the whole volley, and break every brick before you run out of shots.

- 2,000 levels (15 hand-built, the rest generated from a fixed seed, so every phone gets the same levels) with 1 to 3 stars each
- 12 level layouts (pyramids, stripes, frames, pillars and more) and a boss level every 10 levels
- Fills the whole screen on any phone shape, no black bars
- Endless Challenge mode where bricks drop a row every turn
- Pickups: +1 ball rings, row and column lasers, scatter stars, coins
- Power-ups: Bomb, x2 Damage, Row Clear
- 12 ball skins in the shop
- Ads through Google AdMob, plus a one-time Remove Ads purchase
- Plays fully offline (ads just don't load without internet)

App ID: `com.golamlab.ricoshot`

## How the project is laid out

```
www/                 the game itself (one index.html + bundled fonts)
www/vendor/          Capacitor's bridge script, copied in by npm install
android/             the Android app that wraps the game (Capacitor)
assets/              icon and splash source images
tools/level-bot.js   plays levels with a bot to check the shot limits are fair
tools/measure-shots.js  re-measures shot limits after you change the level generator
tools/copy-vendor.js copies the bridge script after npm install
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

## Ads and Remove Ads

Right now the game uses Google's **test** ad IDs, so the APK shows sample ads labelled "Test Ad". They never pay, and you can tap them safely. In a desktop browser you get a pretend "TEST AD" screen instead, so you can try every placement without a phone.

### Where ads appear

| Placement | Type | When |
|---|---|---|
| +5 shots | Rewarded (player chooses) | Out of shots on a level, once per attempt |
| Skip level | Rewarded | After failing the same level 3 times |
| Double coins | Rewarded | On the level clear screen |
| Free power-up | Rewarded | Tapping a power-up you have 0 of |
| Second continue | Rewarded | Challenge game over, after the free continue is used |
| Between games | Full-screen | After every 5 levels cleared, and every 3rd Challenge game over. Never two within 3 minutes. |
| Banner | Banner | Level map and shop only, never during play |

All of these numbers are in the `MONEY` block near the top of the script in `www/index.html`.

**Remove Ads** turns off the full-screen and banner ads for good. The optional rewarded ads stay, because players choose those. The purchase is tied to the player's Google account, so it comes back after a reinstall or on a new phone (there's also a **Restore purchases** button in Settings).

### Switching to real ads (AdMob)

1. Create an account at admob.google.com, add an Android app, and create three ad units: **Interstitial**, **Rewarded** and **Banner** (adaptive).
2. Put the **App ID** (`ca-app-pub-XXXX~YYYY`, with a `~`) in `android/app/src/main/res/values/strings.xml` as `admob_app_id`.
3. Put the three **ad unit IDs** (`ca-app-pub-XXXX/ZZZZ`, with a `/`) in `MONEY.ADMOB` in `www/index.html`.
4. Set `MONEY.TEST_MODE` to `false`.
5. Never tap your own real ads. AdMob bans accounts for it. To keep testing on your phone after switching, add your phone as a test device in AdMob (Settings > Test devices).

In Play Console you also need to declare that the app contains ads, fill in the Data safety form (AdMob collects device IDs for advertising), and set the target age to 13+ unless you want Google's Families ad rules.

### Turning on Remove Ads (Google Play + RevenueCat)

1. Upload a signed build to the Internal testing track in Play Console first. Play only lets you create products for an app it has seen.
2. In Play Console > Monetize > Products > In-app products, create a product with ID `remove_ads` and set its price.
3. Create a free account at revenuecat.com, add a Google Play app with package `com.golamlab.ricoshot`, and connect it to Play Console (RevenueCat walks you through the service account step).
4. In RevenueCat, import the `remove_ads` product and attach it to an **entitlement** named `no_ads`.
5. Copy RevenueCat's public Google API key (starts with `goog_`) into `MONEY.REVENUECAT_API_KEY` in `www/index.html`.

To test a purchase without paying, add your Google account as a licence tester in Play Console (Settings > License testing) and install the app from the Internal testing link.

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

All the numbers are in the `CONFIG` block at the top of the script in `www/index.html`: ball speed, fire delay, star thresholds, prices, challenge difficulty, `LEVEL_COUNT`.

### How the levels work

- Levels 1 to 15 are written by hand in `HAND_LEVELS`.
- Levels 16 to 2,000 come from `genLevel()`. It picks one of 12 layouts per level, scales ball count (up to about 80) and brick HP with the level number, and makes every 10th level from 20 on a boss level.
- Each generated level's shot limit is stored in `GEN_SHOTS`. These were measured by playing every level 12 times with an aiming bot and allowing about 15 to 25% more shots than the bot needed.

If you change the generator, ball speed or brick sizes, re-measure the shot limits. The full run takes about 25 minutes:

```
node tools/measure-shots.js 16 2000 12 > shots.json
```

Then paste the array from `shots.json` into `GEN_SHOTS`. To spot-check a few levels: `node tools/level-bot.js 500 520`.

### Screen fit

The game is always 720 units wide. Its height follows the phone's shape, from 1280 (a 9:16 screen) up to 1760 (very tall phones), so it fills the screen. The brick grid never changes size; the extra height becomes launch space under the bricks and a little room above them. Tablets and desktop browsers show the game at 9:16 with plain margins at the sides.

## Fonts

Bungee and Rubik are bundled in `www/fonts` under the SIL Open Font License (licence files included).
