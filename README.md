# SimpleRoofControl

This [Roll20](http://roll20.net/) script is a roof "lifting" system that shows/hides rooms or houses. It also gives the option to turn the Advanced Fog of War and Dynamic Lighting on or off so you can have those features enabled only inside the building.

### Commands
* **!RoofLink**
* **!ShowHideRoof** <_dynamic_lighting_control_>

---

To prepare a roof for use with the script follow the directions below:
1. Verify you're on the *Token/Object Layer*. Place a graphic of a roof covering your room/building and size it to your needs. Make sure it is above all tokens you may have "inside" your room/building. Name that token **Roof** (must be capitalized).
2. Place a token somewhere near the roof/building. This can be a transparent graphic, a bush, whatever. Try to place it somewhere it will remain unobstructed by other tokens. Name that token **RoofAnchor** (all one word, and yes the R and A need to be capitalized).
3. With both tokens from above selected, type `!RoofLink` to connect the tokens. The RoofAnchor token will be given a GM-only aura to distinguish it as your roof anchor (see [Customization](#customization) below), and the Roof and RoofAnchor tokens will be renamed. This is how they are linked, so ***don't rename them.***
Do this for each roof needed.

---

Once you have your roof(s) setup, you select the RoofAnchor token and use the following command:

```!ShowHideRoof```

By default, this will toggle the Advanced Fog of War and Dynamic Lighting for the current page on or off. If you want to specify whether to have Advanced Fog of War and Dynamic Lighting on or off, you can send a second parameter. There are three, all case insensitive, which are pretty self-explanatory. `ON` turns on (or leaves on) the Advanced Fog of War and Dynamic Lighting, `OFF` turns or leaves them off, and the default `TOGGLE` flips them on if they're off and vice versa.

```!ShowHideRoof ON```
```!ShowHideRoof OFF```
```!ShowHideRoof TOGGLE```

I suggest you use a macro with a query for the Advanced Fog of War and Dynamic Lighting parameter:

```!ShowHideRoof ?{Set Fog of War|Toggle,toggle|Turn/Leave On,on|Turn/Leave Off,off}```

---

### Customization

There are two variables at the top of the script that you can modify to better integrate SimpleRoofControl into your campaign.
* `anchorColor` This variable holds the hexidecimal value of the aura applied to the RoofAnchor token. If you are using red auras for another purpose, you may change this color to any valid hexidecimal color you wish.
* `useAura2` If you are using your tokens' Aura 1 for a different purpose or another script is using them, you may tell SimpleRoofControl to use Aura 1 instead. To do this, change the value of `useAura2` from ***false*** to ***true***.
