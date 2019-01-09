/*
SimpleRoofControl
A roof lifting system for Roll20

On Github:	https://github.com/blawson69/PurseStrings
Contact me: https://app.roll20.net/users/1781274/ben-l
Like this script? Buy me a coffee: https://venmo.com/theBenLawson
*/

var SimpleRoofControl = SimpleRoofControl || (function () {
    'use strict';

    var version = '2.2',
    debugMode = false,
    RoofParts = {},
    anchorColor = '#CC0000',
    useAura2 = false,

    handleInput = function (msg) {
		if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
			return;
		}

		switch (msg.content.split(/\s+/).shift()) {
			case "!RoofLink":
				if (msg.selected.length > 2) {
					sendChat("SimpleRoofControl", "/w GM You have selected too many tokens, but I'll look for what I need.");
				} else if (msg.selected.length < 2) {
					sendChat("SimpleRoofControl", "/w GM You have not selected enough tokens! I give up.");
					break;
				}
				_.each(msg.selected, function (obj) {
					var o = getObj(obj._type, obj._id);
					if (o) {
						if (o.get("_type") === "graphic" && o.get("name") === "Roof" && !RoofParts.Roof) {
							RoofParts.Roof = o;
						} else if (o.get("type") === "graphic" && o.get("name") === "RoofAnchor" && !RoofParts.RoofAnchor) {
							RoofParts.RoofAnchor = o;
						}
					}
				});

				if (RoofParts.Roof && RoofParts.RoofAnchor) {
                    var roofParms = useAura2 ?
                        {name: RoofParts.Roof.id, aura2_radius: '0.1', aura2_color: anchorColor, showplayers_aura2: false} :
                        {name: RoofParts.Roof.id, aura1_radius: '0.1', aura1_color: anchorColor, showplayers_aura1: false};
                    RoofParts.Roof.set({
						name: RoofParts.RoofAnchor.id
					});
					RoofParts.RoofAnchor.set(roofParms);

                    RoofParts = {};
					sendChat("SimpleRoofControl", "/w GM Roof and anchor linked!");
				} else {
					sendChat("SimpleRoofControl", "/w GM Couldn't fine required piece:<ul>"
							+(RoofParts.Roof ? '' : '<li>Token named "Roof".</li>')
							+(RoofParts.RoofAnchor ? '' : '<li>Token named "RoofAnchor".</li>')
						+'</ul>'
					);
				}
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
                        sendChat('SimpleRoofControl','/w GM Missing Roof token!');
                    }
                }
				break;
		}

    },

    logReadiness = function (msg) {
        log('--> SimpleRoofControl v' + version + ' <-- Initialized. Let\'s raise the roof!');
        if (debugMode) sendChat('SimpleRoofControl','/w GM --> SimpleRoofControl loaded <--');
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
