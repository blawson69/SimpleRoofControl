# SimpleRoofControl
> **New in version 5.0** You can now select/specify multiple roof anchors when using the `!ShowHideRoof` command.

This [Roll20](http://roll20.net/) script is a roof "lifting" system to show/hide rooms or houses. It also gives the option to turn the Advanced Fog of War and Dynamic Lighting on or off so you can have those features enabled only inside the building. You can also designate a graphic to be placed on the map layer to broaden the functionality of the script. For instance, you can now hide a pit trap that gets revealed (moved to the map layer) which allows the player tokens to remain visible. (By default, Roofs - tokens revealed on the token layer - are automatically sent to the top to hide all graphics below it.) You can optionally lock the position of the roof to prevent accidental moving or resizing.

## Commands
* **!RoofLink**
* **!ShowHideRoof** <_dynamic_lighting_control_> <_anchor_token_id_>

## Setup
To prepare a roof for use with the script follow the directions below:
1. Verify you're on the *Token/Object Layer*.
2. Place a graphic of a roof, floor trap, etc. and size/position it to your needs. If your graphic is a floor trap or anything else you wish to send to the map layer, size and position it accordingly as well.
3. Name this graphic **"Roof"** (capitalization counts!) regardless of the layer you wish to show it on. If you have [labels enabled](#configuration), "Roof" should be entered into the first Bar 1 field instead.
3. If the "Roof" graphic is to be revealed on the map layer, enter **"map"** as the token's bar1 value. If you have labels enabled, "map" should be entered into the second Bar 1 field.
4. Place a token somewhere near the roof/building. This can be a transparent graphic, a bush, whatever. Try to place it somewhere it will remain unobstructed by other tokens.
6. Name that token **"RoofAnchor"** (all one word, and yes the R and A need to be capitalized), or enter "RoofAnchor" into the first Bar 1 field if labels are enabled.
5. With both tokens from above selected, type `!RoofLink` in chat to link the tokens. The RoofAnchor token will be given a GM-only aura to distinguish it as your roof anchor (see [Configuration](#configuration) below).
7. If lables are not enabled, the Roof and RoofAnchor tokens will be renamed so the names ***should not be changed.***

Do this for each "roof" needed. To clarify the placement of required info:

|  | Labels On | Labels Off |
|:-------------:|:-------------:|:-------------:|
| "Roof" | 1st Bar 1 field | Name field |
| "RoofAnchor" | 1st Bar 1 field | Name field |
| "map" | 2nd Bar 1 field | 1st Bar 1 field |


## How to Use
Once you have your Roof(s) setup, you select one or more RoofAnchor tokens and use the following command:

```
!ShowHideRoof
```

By default, this command will only toggle the Roof visibility. If you want to control whether to have Dynamic Lighting (and Advanced Fog of War, if [enabled](#configuration)) on or off, you can send a second parameter. There are three, all case insensitive, which are pretty self-explanatory. `ON` turns on (or leaves on) Dynamic Lighting/Advanced Fog of War, `OFF` turns or leaves them off, and `TOGGLE` flips them on if they're off and vice versa.

```
!ShowHideRoof ON
!ShowHideRoof OFF
!ShowHideRoof TOGGLE
```

In some instances you may be using macros with multiple API script calls and one of them uses target tokens, causing your RoofAnchor token to be de-selected. Or the RoofAnchor tokens you want to affect all at once may be spread out. In these cases, you can send the ID of the RoofAnchor token as the last parameter to the command. To affect multiple anchors, send all roof anchor IDs as a comma-delimited list.

```
!ShowHideRoof @{selected|token_id}
!ShowHideRoof ON @{target|RoofAnchor|token_id}
!ShowHideRoof -LVo7yDRijRbyShF5OeO
!ShowHideRoof TOGGLE -LuplpqmFMHrVmmxeEtF,-Lv3wJInyuS8zzr-0NCj
```

Sending IDs will ignore any selected tokens in favor of token ID(s) passed in this way.

## Configuration
You can enter the Config Menu by sending `!Roof config` in the chat. This dialog gives access to changing the following options:
* **Anchor Color** is the hexadecimal value of the aura applied to the RoofAnchor token. You may change this color to any valid hexadecimal color you wish using the button provided.
* **Aura** is the aura field to be used on the RoofAnchor token. If you are using your tokens' Aura 1 for a different purpose or another script is using them, you may change the Aura setting to use Aura 1 instead. To do this, just click the button provided.
* **Lables** is the switch that lets you use the token's name field to label your roofs and anchors for identification. Labels are helpful with a map full of roofs and anchors, but this is disabled by default to allow backward compatibility with previous versions of SimpleRoofControl. To convert to using labels, simply follow the instructions above as if the two are not linked.
* **Position Locking** allows you to lock the position, size and rotation of a Roof token whenever you link it with its RoofAnchor. This can be helpful on a crowded map or if there is a tendency to drag the wrong tokens. Roofs linked with locking on will remain locked after position locking is disabled, so if you wish to unlock a roof, send `!Roof unlock` with the roof token selected.
* **Use Fog of War** allows you to turn off access to Advanced Fog of War and only affect Dynamic Lighting with the `ON|OFF|TOGGLE` parameter.
* **GM Only** allows you to give players access to the `!ShowHideRoof` command. This allows more flexibility and creativity with the script, like creating player macros to let them change their environment.

## In-Chat Help
You may have [Setup](#setup) instructions based on your configuration settings given to you at any time by sending `!Roof help` in chat.
