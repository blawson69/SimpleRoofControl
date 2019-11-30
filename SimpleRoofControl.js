/*
SimpleRoofControl
A roof lifting system for Roll20

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script? Become a patron:
    https://www.patreon.com/benscripts
*/

var SimpleRoofControl = SimpleRoofControl || (function () {
    'use strict';

    var version = '4.0',
    debugMode = false,
    RoofParts = {},
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 10px 0; color: #591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        subtitle: 'margin-top: -4px; padding-bottom: 4px; color: #666; font-size: 1.125em; font-variant: small-caps;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        buttonAlt: 'background-color: #7a2016; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        infoLink: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: none; font-family: Webdings;',
        imgLink: 'background-color: transparent; border: none; padding: 0; text-decoration: none;',
        fullWidth: 'width: 100%; display: block; padding: 12px 0; text-align: center;',
        code: 'font-family: "Courier New", Courier, monospace; padding-bottom: 6px;',
        colorBox: 'color: #fff; padding: 5px; display: block; margin:2px 30%; text-align: center;',
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
        if (typeof state['SIMPLEROOFCONTROL'].useFoW == 'undefined') state['SIMPLEROOFCONTROL'].useFoW = true;
        if (typeof state['SIMPLEROOFCONTROL'].allowLabels == 'undefined') state['SIMPLEROOFCONTROL'].allowLabels = false;
        if (typeof state['SIMPLEROOFCONTROL'].lockPos == 'undefined') state['SIMPLEROOFCONTROL'].lockPos = true;
        if (typeof state['SIMPLEROOFCONTROL'].lockedTokens == 'undefined') state['SIMPLEROOFCONTROL'].lockedTokens = [];
        _.each(state['SIMPLEROOFCONTROL'].lockedTokens, function (id) {
            var token = getObj('graphic', id);
            if (!token) state['SIMPLEROOFCONTROL'].lockedTokens = _.reject(state['SIMPLEROOFCONTROL'].lockedTokens, function (x) { return x == id; });
        });

        if (firstTime) {
            sendDialog('Welcome', 'Thanks for using SimpleRoofControl!<br><div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '" href="!Roof help">&#8594; Get Started &#8592;</a></div>');
        }

        log('--> SimpleRoofControl v' + version + ' <-- Initialized. Let\'s raise the roof!');

        if (debugMode) {
            var d = new Date();
            sendDialog('Debug Mode', 'SimpleRoofControl v' + version + ' loaded at ' + d.toLocaleTimeString() + '<br><div style=\'' + styles.buttonWrapper + '\'><a style=\'' + styles.button + '\' href="!Roof config">Show Config</a></div>');
        }
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
                            showConfig(msg.content);
                            break;
                        case "help":
                            showHelp();
                            break;
                        case "unlock":
                            unlockRoof(msg.selected);
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
                        var nameVal = state['SIMPLEROOFCONTROL'].allowLabels ? o.get("bar1_value") : o.get("name");
						if (o.get("type") === "graphic" && nameVal === "Roof" && !RoofParts.Roof) {
							RoofParts.Roof = o;
						}
                        if (o.get("type") === "graphic" && nameVal === "RoofAnchor" && !RoofParts.RoofAnchor) {
							RoofParts.RoofAnchor = o;
						}
					}
				});

				if (RoofParts.Roof && RoofParts.RoofAnchor) {
                    var roofAnchorParms = state['SIMPLEROOFCONTROL'].useAura2 ?
                        {aura2_radius: '0.1', aura2_color: state['SIMPLEROOFCONTROL'].anchorColor, showplayers_aura2: false} :
                        {aura1_radius: '0.1', aura1_color: state['SIMPLEROOFCONTROL'].anchorColor, showplayers_aura1: false};
                    if (state['SIMPLEROOFCONTROL'].allowLabels) roofAnchorParms.bar1_value = RoofParts.Roof.id;
                    else roofAnchorParms.name = RoofParts.Roof.id;
                    RoofParts.RoofAnchor.set(roofAnchorParms);

                    var roofParms = state['SIMPLEROOFCONTROL'].allowLabels ? { bar1_value: RoofParts.RoofAnchor.id } : { name: RoofParts.RoofAnchor.id };
                    RoofParts.Roof.set(roofParms);

                    if (state['SIMPLEROOFCONTROL'].lockPos) {
                        state['SIMPLEROOFCONTROL'].lockedTokens.push(RoofParts.Roof.id);
                        state['SIMPLEROOFCONTROL'].lockedTokens = _.uniq(state['SIMPLEROOFCONTROL'].lockedTokens);
                    }

                    sendDialog('Success', 'Roof and Anchor linked!');
				} else {
                    var err = "Couldn't find required piece:<ul>"
    					+ (RoofParts.Roof ? '' : '<li>A token ' + (state['SIMPLEROOFCONTROL'].allowLabels ? 'with "Roof" in the first Bar 1 box' : 'named "Roof"') + '.</li>')
    					+ (RoofParts.RoofAnchor ? '' : '<li>A token ' + (state['SIMPLEROOFCONTROL'].allowLabels ? 'with "RoofAnchor" in the first Bar 1 box' : 'named "RoofAnchor"') + '.</li>')
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
                    var roofID = (state['SIMPLEROOFCONTROL'].allowLabels) ? anchor.get('bar1_value') : anchor.get('name'),
                        oRoof = getObj('graphic', roofID);
                    if (oRoof) {
                        var dest = (state['SIMPLEROOFCONTROL'].allowLabels) ? oRoof.get('bar1_max').toLowerCase() : oRoof.get('bar1_value').toLowerCase();
                        if (dest !== 'map') dest = 'objects';
                        oRoof.set({
                            layer: ( (oRoof.get('layer') !== 'walls') ? 'walls' : dest)
                        });
                        if (oRoof.get('layer') === 'objects') toFront(oRoof);

                        if (msgparts[1]) {
                            msgparts[1] = msgparts[1].toLowerCase();
                            if (regex.test(msgparts[1])) {
                                var oPage = getObj("page", anchor.get('pageid'));
                                if (msgparts[1] === 'toggle') {
                                    oPage.set({showlighting: (oPage.get('showlighting') === false ? true : false) });
                                    if (state['SIMPLEROOFCONTROL'].useFoW) oPage.set({showdarkness: (oPage.get('adv_fow_enabled') === false ? true : false) });
                                } else {
                                    oPage.set({showlighting: (msgparts[1] === 'on' ? true : false) });
                                    if (state['SIMPLEROOFCONTROL'].useFoW) oPage.set({showdarkness: (msgparts[1] === 'on' ? true : false) });
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

    showConfig = function (msg) {
        var message = '', parms = msg.replace('!Roof config ', '').split(/\s*\-\-/i), color_err = false;
        _.each(parms, function (x) {
            var parts = x.trim().split(/\s*\|\s*/i);
            if (parts[0] == 'aura-toggle') state['SIMPLEROOFCONTROL'].useAura2 = !state['SIMPLEROOFCONTROL'].useAura2;
            if (parts[0] == 'labels-toggle') state['SIMPLEROOFCONTROL'].allowLabels = !state['SIMPLEROOFCONTROL'].allowLabels;
            if (parts[0] == 'pos-toggle') state['SIMPLEROOFCONTROL'].lockPos = !state['SIMPLEROOFCONTROL'].lockPos;
            if (parts[0] == 'fow-toggle') state['SIMPLEROOFCONTROL'].useFoW = !state['SIMPLEROOFCONTROL'].useFoW;
            if (parts[0] == 'color' && parts[1] != '') {
                if (parts[1].match(/^([0-9a-fA-F]{3}){1,2}$/i) !== null) state['SIMPLEROOFCONTROL'].anchorColor = '#' + parts[1];
                else color_err = true;
            }
        });

        message += '<h4>Anchor Color</h4>The button below is your Roof Anchor color: <i>#' + state['SIMPLEROOFCONTROL'].anchorColor.substr(1)
        + '</i>. To change, use the button to enter a hexadecimal color value without the hash (#).<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.buttonAlt + '; background-color: ' + state['SIMPLEROOFCONTROL'].anchorColor + '" href="!Roof config --color|&#63;&#123;New Color&#124;' + state['SIMPLEROOFCONTROL'].anchorColor.substr(1) + '&#125;" title="Change the aura color">Change 🎨</a></div>';
        if (color_err) {
            message += '<div align="center" style="align: center; color: #C00; font-weight: bold; margin: 0 4px;">You must enter a valid 3- or 6-digit hexadecimal color code. Try again.</div>';
        }

        message += '<br><h4>Use Aura: ' + (state['SIMPLEROOFCONTROL'].useAura2 ? '2' : '1') + ' <a style="' + styles.imgLink + '" href="!Roof config --aura-toggle" title="Toggle the aura use setting">🔄</a></h4>';
        message += 'The Anchor Color (above) is indicator the Roof Anchor token, and the script can use either aura in case one is already in use.<br><br>';

        message += '<h4>labels: ' + (state['SIMPLEROOFCONTROL'].allowLabels ? 'On' : 'Off') + ' <a style="' + styles.imgLink + '" href="!Roof config --labels-toggle" title="Toggle the labels setting">🔄</a></h4>';
        message += 'Allow backward compatability with previous versions by turning labels off. To use token names as labels for your roofs and anchors, turn labels on.<br><br>';

        message += '<h4>Position Locking: ' + (state['SIMPLEROOFCONTROL'].lockPos ? 'On' : 'Off') + ' <a style="' + styles.imgLink + '" href="!Roof config --pos-toggle" title="Toggle position locking">🔄</a></h4>';
        message += 'You can lock your roof tokens to prevent repositioning or resizing. If you change this, it <b>does not</b> affect previously locked tokens.<br><br>';

        message += '<h4>Use Fog of War: ' + (state['SIMPLEROOFCONTROL'].useFoW ? 'On' : 'Off') + ' <a style="' + styles.imgLink + '" href="!Roof config --fow-toggle" title="Toggle Fog of War use">🔄</a></h4>';
        message += 'If you don\'t use Advanced Fog of War or don\'t wish the script to change it, turn this setting off.';

        message += '<hr>See the <a style="' + styles.textButton + '" href="https://github.com/blawson69/SimpleRoofControl">documentation</a> for complete instructions.<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '" href="!Roof help">Help Menu</a></div>';
        sendDialog('Config Menu', message);
    },

    showHelp = function () {
        var message;
        message = 'To prepare a Roof for use with the script follow the directions below:<ol>';
        message += '<li>Verify you\'re on the <i>Token/Object Layer</i>.</li>';
        message += '<li>Place a graphic of your roof, floor trap, etc. and size and position it to your needs.' + (state['SIMPLEROOFCONTROL'].lockPos ? ' Once linked, your Roof token will be locked to prevent accidental repositioning or resizing.' : ' If you wish to lock your Roof token\'s position, you must enable it in the config menu <i>before</i> linking your tokens.') + '</li>';
        message += '<li>' + (state['SIMPLEROOFCONTROL'].allowLabels ? 'Type <b>Roof</b> into the first <span style="color: #48a057;">Bar 1</span> field' : 'Name this graphic <b>Roof</b>') + '</li>';
        message += '<li>If the "Roof" graphic should be revealed on the map layer, enter "map" as the token\'s <span style="color: #579662;">Bar ' + (state['SIMPLEROOFCONTROL'].allowLabels ? '2' : '1') + '</span> value.</li>';
        message += '<li>Place a token near the Roof token. ' + (state['SIMPLEROOFCONTROL'].allowLabels ? 'Enter <b>RoofAnchor</b> into the token\'s first <span style="color: #579662;">Bar 1</span> field.' : 'Name that token <b>RoofAnchor</b>).') + '</li>';
        message += '<li>With both tokens selected, type <span style=\'' + styles.code + '\'>!RoofLink</span> in chat to link the tokens. The RoofAnchor token will get a GM-only aura to distinguish it as a Roof Anchor.';
        message += '<li>' + (state['SIMPLEROOFCONTROL'].allowLabels ? 'Name your Roof and RoofAnchor tokens however you wish.' : 'The Roof and RoofAnchor tokens will be renamed. This is how they are linked, so <b><i>do not rename them.</b></i>.') + '</li>';
        message += '</ol>Do this for each "roof" needed.<br><br>Send <span style=\'' + styles.code + '\'>!RoofLink</span> in chat with the RoofAnchor selected to show/hide the Roof token.<br><br>';
        message += 'Use <span style=\'' + styles.code + '\'>!RoofLink [ON|OFF|TOGGLE]</span> to affect Dynamic Lighting' + (state['SIMPLEROOFCONTROL'].useFoW ? ' and Advanced Fog of War' : '') + '.';
        message += '<hr>See the <a style="' + styles.textButton + '" href="https://github.com/blawson69/SimpleRoofControl">documentation</a> for complete instructions.<br>';
        message += '<div style=\'' + styles.buttonWrapper + '\'><a style="' + styles.button + '" href="!Roof config">Config Menu</a></div>';
        sendDialog('Help Menu', message);
    },

    sendDialog = function (title, content) {
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + styles.fullWidth + '\'>' + title + '<div>' + content + '</div></div>';
        sendChat('SimpleRoofControl','/w GM ' + body, null, {noarchive:true});
    },

    unlockRoof = function (selected) {
        if (selected && _.size(selected) > 0) {
            var roof = getObj('graphic', selected[0]._id);
            if (roof) {
                var name = (state['SIMPLEROOFCONTROL'].allowLabels && roof.get('name') != '') ? ' "' + roof.get('name') + '"' : '';
                state['SIMPLEROOFCONTROL'].lockedTokens = _.reject(state['SIMPLEROOFCONTROL'].lockedTokens, function (x) { return x == roof.get('id'); });
                sendDialog('Roof Unlocked', 'Roof token' + name + ' is now unlocked.');
            } else {
                sendDialog('Unlock Error', 'Not a valid token.');
            }
        } else {
            sendDialog('Unlock Error', 'No tokens were selected.');
        }
    },

    handleMove = function(obj, prev) {
        // Enforces locks on roof tokens
        if (_.find(state['SIMPLEROOFCONTROL'].lockedTokens, function (id) { return id == obj.get('id'); })) {
            obj.set({left: prev.left, top: prev.top, rotation: prev.rotation, width: prev.width, height: prev.height});
        }
    },

    registerEventHandlers = function () {
        on('chat:message', handleInput);
        on('change:graphic', handleMove);
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
