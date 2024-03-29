# StoPlay Chrome Extension

Google Chrome extension to stop/play music playing in your web-browser via
popular streaming services.

[![Chrome WebStore](https://stoplay.github.io/images/ChromeWebStore_Badge_v2_206x58.png)](http://bit.ly/stoplay)

**These are source files, for actual working extension please visit
[Chrome webstore](http://bit.ly/stoplay).**

At the moment we fully support (stop and play)

- Bandcamp
- Classicalradio.com
- DailyMotion.com
- Deezer.com
- Facebook
- Kickstarter
- Last.fm (web-version)
- Mixcloud
- Netflix
- Prometheus.com.ua
- PromoDJ
- Radiotunes.com
- Rockradio.com
- Soundcloud
- Spotify
- TED.com
- TuneIn.com
- YouTube
- Youtube Music
- armyfm.com.ua
- coursera.org
- di.fm
- hearthis.at
- jazzradio.com
- livestream.com
- megogo.net
- musicforprogramming.net
- radiolist.com.ua
- slipstreamradio.com
- udemy.com
- vimeo
- zenradio.com
- beatport.com
- anchor.fm
- qub.ca
- cikava-ideya.top
- freemusicarchive.org

## How it works

It just works!

The extension automatically pauses your previous playing media when you open
a new one (in case if supported, of course).

Also you can click the pause bar button to stop it.
![Click the pause bar button to stop it](https://i.imgur.com/tEoV7qF.png)

![Alt text]()

## Debugging

Q: New version seems to have the player support I need, but can't see it in the options. What can I do?

A: Try hitting 'Enable StoPlay' checkbox to turn it off an on. If this doesn't help try resetting settings (button at the bottom).

## Purpose

We just needed this feature in the browser.
When you listen to music online with different services, at times it can be
difficult to find the needed tab and then the **pause** button there.
It also very cool when you open another video and music stops automatically for
you to watch the video.

## Contributing

We understand that there are tons of other streaming services, that's why we are
eager to share the stuff with everybody to enable this feature for the
service of your choice.

So fork it right over, add your service support, make pull request and we will
try to include it in the extension as soon as possible. Check the [existing issues](https://github.com/StoPlay/stoplay-ext/issues).

To prepare your dev version, see
[Chrome Dev Getting Started](http://developer.chrome.com/extensions/getstarted.html#unpacked).
There are also lots of useful info there.

To run the extension unpacked you need to compile javascript - run `grunt rollup`.

Git flow is simple:

- all features/bugfixes in separate branches
- then push the branch and create a pull-request
- assign someone from the team to the pull-request
- after reviewing, it will be merged to master and eventually released

Remote branches after merge to master should be killed.

[More on Contribution](https://github.com/StoPlay/stoplay-ext/wiki/Contribution).

# [Contributors](https://github.com/StoPlay/stoplay-ext/graphs/contributors)

- Alex Karpov ([@endway](https://github.com/endway))
- Alex Buznik ([@beshur](https://github.com/beshur))
- Sergey Lysenko ([@soul-wish](https://github.com/soul-wish))
- Lorans Chirko ([@nffs](https://github.com/nffs))
