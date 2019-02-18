# SimpleRoofControl

This [Roll20](http://roll20.net/) script is a roof "lifting" system to show/hide rooms or houses. It also gives the option to turn the Advanced Fog of War and Dynamic Lighting on or off so you can have those features enabled only inside the building.

You can also designate a graphic to be placed on the map layer to broaden the functionality of the script. For instance, you can now hide a pit trap that gets revealed (moved to the map layer) which allows the player tokens to remain visible. (By default, Roofs - tokens revealed on the token layer - are automatically sent to the top to hide all graphics below it.)

## Commands
* **!RoofLink**
* **!ShowHideRoof** <_dynamic_lighting_control_> <_anchor_token_id_>

## Setup

To prepare a roof for use with the script follow the directions below:
1. Verify you're on the *Token/Object Layer*.
2. Place a graphic of a roof covering your room/building and size it to your needs. Make sure it is above all tokens you may have "inside" your room/building. If your graphic is a floor trap or anything else you wish to send to the map layer, size and position it accordingly as well. Name this graphic **Roof** (capitalization counts!) regardless of the layer you wish to show it on.
3. If the "Roof" graphic is to be revealed on the map layer, enter "map" as the token's bar1 value.
4. Place a token somewhere near the roof/building. This can be a transparent graphic, a bush, whatever. Try to place it somewhere it will remain unobstructed by other tokens. Name that token **RoofAnchor** (all one word, and yes the R and A need to be capitalized).
5. With both tokens from above selected, type `!RoofLink` to connect the tokens. The RoofAnchor token will be given a GM-only aura to distinguish it as your roof anchor (see [Configuration](#configuration) below). The Roof and RoofAnchor tokens will also be renamed. This is how they are linked, so ***don't rename them.***

Do this for each "roof" needed.

## How to Use

Once you have your Roof(s) setup, you select the RoofAnchor token and use the following command:

```
!ShowHideRoof
```

By default, this command will only toggle the Roof visibility. If you want to control whether to have Advanced Fog of War and Dynamic Lighting on or off, you can send a second parameter. There are three, all case insensitive, which are pretty self-explanatory. `ON` turns on (or leaves on) the Advanced Fog of War and Dynamic Lighting, `OFF` turns or leaves them off, and `TOGGLE` flips them on if they're off and vice versa.

```
!ShowHideRoof ON
!ShowHideRoof OFF
!ShowHideRoof TOGGLE
```

In some instances you may be using macros with multiple API script calls and one of them uses target tokens, causing your RoofAnchor token to be de-selected. In these cases, you can send the ID of the RoofAnchor token as the last parameter to the command.

```
!ShowHideRoof -LVo7yDRijRbyShF5OeO
!ShowHideRoof @{selected|token_id}
!ShowHideRoof ON @{target|RoofAnchor|token_id}
```

This will ignore any selected tokens in favor of the token ID passed in this way.

## Configuration

You can enter the Config Menu by sending `!Roof config` in the chat. This dialog gives access to changing the available options. There are two variables at the top of the script that you can modify to better integrate SimpleRoofControl into your campaign:
* **Anchor Color** is the hexadecimal value of the aura applied to the RoofAnchor token. If you are using red auras for another purpose, you may change this color to any valid hexadecimal color you wish using the link provided.
* **Aura** is the aura field to be used on the RoofAnchor token. If you are using your tokens' Aura 1 for a different purpose or another script is using them, you may change the Aura setting to use Aura 1 instead. To do this, just click the link provided.

## In-Chat Help
You may have the [Setup](#setup) instructions given to you at any time by sending `!Roof help` in chat.
