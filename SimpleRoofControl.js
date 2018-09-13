/*
SimpleRoofControl
A roof lifting system for Roll20

On Github:	https://github.com/blawson69/PurseStrings
Contact me: https://app.roll20.net/users/1781274/ben-l
Like this script? Buy me a coffee: https://venmo.com/theBenLawson
*/

var SimpleRoofControl = SimpleRoofControl || (function() {
    'use strict';

    var version = '2.0',
    RoofParts = {},
    anchorColor = '#CC0000',
    useAura2 = false,

    handleInput = function(msg) {
		if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
			return;
		}

		switch(msg.content.split(/\s+/).shift()) {
			case "!RoofLink":
				if (msg.selected.length > 2) {
					sendChat("Roofs", "/w gm You have selected too many things, but I'll look for what I need.");
				} else if (msg.selected.length < 2) {
					sendChat("Roofs", "/w gm You have not selected enough things. I give up.");
					break;
				}
				_.each(msg.selected, function(obj) {
					var o = getObj(obj._type, obj._id);
					if(o) {
						if (o.get("_type") === "graphic" && o.get("name") === "Roof" && !RoofParts.Roof) {
							RoofParts.Roof=o;
						} else if (o.get("type") === "graphic" && o.get("name") === "RoofAnchor" && !RoofParts.RoofAnchor) {
							RoofParts.RoofAnchor = o;
						}
					}
				});

				if(RoofParts.Roof && RoofParts.RoofAnchor) {
                    var roofParms = useAura2 ?
                        {name: RoofParts.Roof.id, aura2_radius: '0.1', aura2_color: anchorColor, showplayers_aura2: false} :
                        {name: RoofParts.Roof.id, aura1_radius: '0.1', aura1_color: anchorColor, showplayers_aura1: false};
                    RoofParts.Roof.set({
						name: RoofParts.RoofAnchor.id
					});
					RoofParts.RoofAnchor.set(roofParms);
					sendChat("Roofs", "/w GM Roof and anchor linked!");
				} else {
					sendChat("Roofs", "/w GM Couldn't fine required piece:<ul>"
							+(RoofParts.Roof ? '' : '<li>Token named "Roof".</li>')
							+(RoofParts.RoofAnchor ? '' : '<li>Token named "RoofAnchor".</li>')
						+'</ul>'
					);
				}
				break;

			case "!ShowHideRoof":
				_.chain(msg.selected)
					.map(function(o){
						return getObj('graphic', o._id);
					})
					.reject(_.isUndefined)
					.filter(function(o){
						return 'objects' === o.get('layer');
					})
					.each(function(o){
						var params=o.get('name'),
							oRoof = getObj('graphic',params);
						if(oRoof) {
							oRoof.set({
								layer: ( 'objects' === oRoof.get('layer') ? 'walls' : 'objects')
							});
							if (oRoof.get('layer') === 'objects') toFront(oRoof);

							var msgparts = msg.content.split(/\s+/);
							if(msgparts[1]) {
								msgparts[1] = msgparts[1].toLowerCase();
								if(msgparts[1] === 'on' || msgparts[1] === 'off' || msgparts[1] === 'toggle') {
									var oPage = getObj("page", Campaign().get("playerpageid"));
									if(msgparts[1] === 'toggle') {
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
							sendChat('Roofs','/w gm Missing Roof token');
						}
					});
				break;
		}

    },

	logReadiness = function (msg) {
		log('--> SimpleRoofControl v' + version + ' <-- Initialized. Let\'s raise the roof!');
	},

    registerEventHandlers = function() {
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
