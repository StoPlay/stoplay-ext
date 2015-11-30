StoPlay Chrome Extension
===========

Google Chrome extension to stop/play music playing in your web-browser via
popular streaming services.
[![Pledgie Button](https://pledgie.com/campaigns/26208.png?skin_name=chrome)](https://pledgie.com/campaigns/26208 )

**These are source files, for actual working extension please visit
[Chrome webstore](http://bit.ly/stoplay).**


At the moment we fully support (stop and play)
* Spotify
* PromoDJ
* Bandcamp
* vkontakte
* Google Music
* vimeo
* YouTube
* Facebook
* Kickstarter
* hearthis.at
* Rutube
* TED.com
* FS.to (brb.to)
* Muzebra
* Pleer.com
* Last.fm (web-version)
* Soundcloud
* Mixcloud
* Seasonvar
* Yandex.Music
* TuneIn.com

## How it works
It just works!

The extension automatically pauses your previous playing media when you open
a new one (in case if supported, of course).

Also you can click the pause bar button to stop it.
![Click the pause bar button to stop it](http://monosnap.com/image/rv29Wlv8VZfVPlAldgHrhMr5J.png)

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

To compile production version run `npm install` and `grunt` and look into the __builds__ folder. Only run `grunt` on the `master` branch!

# Contributors
* Alex Karpov ([@endway](https://github.com/endway))
* Alex Buznik ([@beshur](https://github.com/beshur))
* Sergey Lysenko ([@soul-wish](https://github.com/soul-wish))
* Lorans Chirko ([@nffs](https://github.com/nffs))
