/*
SimpleRoofControl
A roof lifting system for Roll20

On Github:	https://github.com/blawson69/PurseStrings
Contact me: https://app.roll20.net/users/1781274/ben-l
Like this script? Buy me a coffee: https://venmo.com/theBenLawson
*/

var SimpleRoofControl = SimpleRoofControl || (function () {
    'use strict';

    var version = '3.0',
    debugMode = false,
    RoofParts = {},
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -30px; margin-right: -30px;',
        title: 'padding: 0 0 10px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        colorBox: 'color: #fff; padding: 5px; display: block; margin:2px 30%; text-align: center;',
        code: 'font-family: "Courier New", Courier, monospace; background-color: #ddd; color: #000; padding: 2px 4px;',
        list: 'list-style: none;',
        float: {
            right: 'float: right;',
            left: 'float: left;'
        },
        overflow: 'overflow: hidden;',
        fullWidth: 'width: 100%;'
    },

    logReadiness = function (msg) {
        var firstTime = false;
        if (!_.has(state, 'SIMPLEROOFCONTROL')) {
            state['SIMPLEROOFCONTROL'] = state['SIMPLEROOFCONTROL'] || {};
            firstTime = true;
        }
        if (typeof state['SIMPLEROOFCONTROL'].anchorColor == 'undefined') state['SIMPLEROOFCONTROL'].anchorColor = '#CC0000';
        if (typeof state['SIMPLEROOFCONTROL'].useAura2 == 'undefined') state['SIMPLEROOFCONTROL'].useAura2 = false;

        log('--> SimpleRoofControl v' + version + ' <-- Initialized. Let\'s raise the roof!');
        if (debugMode) sendDialog('Initialized','SimpleRoofControl has loaded.');
        if (firstTime) sendDialog('Welcome', 'Thanks for using SimpleRoofControl!<br><br><div align="center"><a style="'
            + styles.button + '" href="!Roof help">&#8594; Get Started &#8592;</a></div>');
    },

    handleInput = function (msg) {
		if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
			return;
		}

		switch (msg.content.split(/\s+/).shift()) {
            case "!Roof":
                var parms = msg.content.split(/\s+/);
                if (parms[1]) {
                    switch (parms[1]) {
                        case "config":
                            showConfig('config');
                            break;
                        case "help":
                            showConfig('help');
                            break;
                        case "color":
                            setAuraColor(parms);
                            break;
                        case "aura-toggle":
                            toggleAura2();
                            break;
                    }
                }
                break;

            case "!RoofLink":
				if (msg.selected.length < 2) {
                    sendDialog('Link Error', 'You have not selected enough tokens! Please select a "Roof" and a "RoofAnchor" token.');
					break;
				}
				_.each(msg.selected, function (obj) {
					var o = getObj(obj._type, obj._id);
					if (o) {
						if (o.get("type") === "graphic" && o.get("name") === "Roof" && !RoofParts.Roof) {
							RoofParts.Roof = o;
						}
                        if (o.get("type") === "graphic" && o.get("name") === "RoofAnchor" && !RoofParts.RoofAnchor) {
							RoofParts.RoofAnchor = o;
						}
					}
				});

				if (RoofParts.Roof && RoofParts.RoofAnchor) {
                    var roofParms = state['SIMPLEROOFCONTROL'].useAura2 ?
                        {name: RoofParts.Roof.id, aura2_radius: '0.1', aura2_color: state['SIMPLEROOFCONTROL'].anchorColor, showplayers_aura2: false} :
                        {name: RoofParts.Roof.id, aura1_radius: '0.1', aura1_color: state['SIMPLEROOFCONTROL'].anchorColor, showplayers_aura1: false};
                    RoofParts.RoofAnchor.set(roofParms);
                    RoofParts.Roof.set({ name: RoofParts.RoofAnchor.id });

                    sendDialog('Success', 'Roof and Anchor linked!');
				} else {
                    var err = "Couldn't find required piece:<ul>"
    					+ (RoofParts.Roof ? '' : '<li>Token named "Roof".</li>')
    					+ (RoofParts.RoofAnchor ? '' : '<li>Token named "RoofAnchor".</li>')
    					+ '</ul>';
                    sendDialog('Link Error', err);
				}
                RoofParts = {};
				break;

			case "!ShowHideRoof":
                var anchor,
                    msgparts = msg.content.split(/\s+/),
                    regex = /on|off|toggle/i;

                if (!msg.selected) {
                    var anchorID = _.last(msgparts);
                    if (anchorID) anchor = getObj('graphic', anchorID);
                } else {
                    var tokens = msg.selected.map(s => getObj(s._type, s._id));
                    if (tokens[0]) anchor = tokens[0];
                }

                if (anchor) {
                    var roofID = anchor.get('name'),
                        oRoof = getObj('graphic', roofID);
                    if (oRoof) {
                        var dest = oRoof.get('bar1_value').toLowerCase();
                        if (dest !== 'map') dest = 'objects';
                        oRoof.set({
                            layer: ( (oRoof.get('layer') !== 'walls') ? 'walls' : dest)
                        });
                        if (oRoof.get('layer') === 'objects') toFront(oRoof);

                        if (msgparts[1]) {
                            msgparts[1] = msgparts[1].toLowerCase();
                            if (regex.test(msgparts[1])) {
                                var oPage = getObj("page", Campaign().get("playerpageid"));
                                if (msgparts[1] === 'toggle') {
                                    oPage.set({
                                        showlighting: (oPage.get('showlighting') === false ? true : false),
                                        adv_fow_enabled: (oPage.get('adv_fow_enabled') === false ? true : false)
                                    });
                                } else {
                                    oPage.set({
                                        showlighting: (msgparts[1] === 'on' ? true : false),
                                        adv_fow_enabled: (msgparts[1] === 'on' ? true : false)
                                    });
                                }
                            }
                        }
                    } else {
                        sendDialog('Error', 'Missing Roof token!');
                    }
                }
				break;
		}

    },

    showConfig = function (mode) {
        var message;
        if (mode == 'help') {
            message = 'To prepare a Roof for use with the script follow the directions below:<ul>'
            + '<li>Verify you\'re on the <i>Token/Object Layer</i>.</li>'
            + '<li>Place a graphic of a roof covering your room/building and size it to your needs. If your graphic is a floor trap or anything else you wish to send to the map layer, size and position it accordingly as well. Name this graphic <b>Roof</b> (capitalization counts!) regardless of the layer you wish to show it on.</li>'
            + '<li>If the "Roof" graphic is to be revealed on the map layer, enter "map" as the token\'s bar1 value.</li>'
            + '<li>Place a token somewhere near the roof/building. This can be a transparent graphic, a bush, whatever. Name that token <b>RoofAnchor</b> (all one word, and yes the R and A need to be capitalized).</li>'
            + '<li>With both tokens from above selected, type <span style=\'' + styles.code + '\'>!RoofLink</span> to connect the tokens. The RoofAnchor token will be given a GM-only aura to distinguish it as your roof anchor. The Roof and RoofAnchor tokens will also be renamed. This is how they are linked, so <b><i>don\'t rename them.</b></i></li>'
            + '</ul>Do this for each "roof" needed.';
            message += '<br><br><div align="center"><a style="' + styles.button + '" href="!Roof config">Show Config Menu</a></div><br>';
            sendDialog('Help Menu', message);
        } else {
            message = '<h4>Anchor Color</h4>Your current anchor color is <i>#' + state['SIMPLEROOFCONTROL'].anchorColor.substr(1)
            + '</i>. To change this color, enter a hexadecimal value without the beginning hash (#).<br>'
            + '<div style="' + styles.colorBox + ' background-color: ' + state['SIMPLEROOFCONTROL'].anchorColor + '">&nbsp;</div>'
            + '<div align="center"><a style="' + styles.textButton
            + '" href="!Roof color &#63;&#123;Color&#124;' + state['SIMPLEROOFCONTROL'].anchorColor.substr(1) + '&#125;">Change Color</a></div><br>'
            + '<h4>Aura</h4>The Anchor Color (above) is set as a GM-only aura on the Roof Anchor token, and the script can use either aura in case one is already in use. ';
            if (state['SIMPLEROOFCONTROL'].useAura2) {
                message += 'Your are currently configured to use aura2.<br><div align="center"><a style="' + styles.textButton
                + '" href="!Roof aura-toggle">Switch to aura1</a></div>';
            } else {
                message += 'Your are currently configured to use aura1.<br><div align="center"><a style="' + styles.textButton
                + '" href="!Roof aura-toggle">Switch to aura2</a></div>';
            }
            message += '<br><div align="center"><a style="' + styles.button + '" href="!Roof help">Show Help Menu</a></div><br>';
            sendDialog('Config Menu', message);
        }
    },

    setAuraColor = function (parms) {
        if (parms[2] && parms[2].match(/^([0-9a-fA-F]{3}){1,2}$/i) !== null) {
            state['SIMPLEROOFCONTROL'].anchorColor = '#' + parms[2];
            showConfig();
        } else {
            var err = 'You must enter a valid 3- or 6-digit hexadecimal color code. Try again.<br><div align="center"><a href="!Roof color &#63;&#123;Color&#124;'
            + state['SIMPLEROOFCONTROL'].anchorColor.substr(1) + '&#125;">Change Color</a></div>';
            sendDialog('Error', err);
        }
    },

    toggleAura2 = function () {
        state['SIMPLEROOFCONTROL'].useAura2 = (state['SIMPLEROOFCONTROL'].useAura2) ? false : true;
        showConfig();
    },

    sendDialog = function (title, content) {
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + styles.fullWidth + '\'>' + title + '<div>' + content + '</div></div>';
        sendChat('SimpleRoofControl','/w GM ' + body, null, {noarchive:true});
    },

    registerEventHandlers = function () {
        on('chat:message', handleInput);
    };

    return {
        logReadiness: logReadiness,
        RegisterEventHandlers: registerEventHandlers
    };

}());

on("ready",function(){
    'use strict';
    SimpleRoofControl.logReadiness();
    SimpleRoofControl.RegisterEventHandlers();
});
