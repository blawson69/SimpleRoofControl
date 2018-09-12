﻿var SimpleRoofControl = SimpleRoofControl || (function() {
    'use strict';

    var version = '1.0',
    RoofParts = {},
    anchorColor = '#CC0000',

    handleInput = function(msg) {
		if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
			return;
		}

		switch(msg.content.split(/\s+/).shift()) {
			case "!RoofLink":
				//make sure two items are selected
				if (msg.selected.length > 2) {
					sendChat("Roofs", "/w gm You have selected too many things, looking among them for what I need.");
				} else if (msg.selected.length < 2) {
					sendChat("Roofs", "/w gm You have not selected enough things. I give up.");
					break;
				}
				//identify and get the ID for each each type of selected item
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
					RoofParts.Roof.set({
						name: RoofParts.RoofAnchor.id
					});
					RoofParts.RoofAnchor.set({
						name: RoofParts.Roof.id,
						aura1_radius: '0.1',
						aura1_color: anchorColor,
						showplayers_aura1: false
					});
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
							// Toggle the roof layer
							oRoof.set({
								layer: ( 'objects' === oRoof.get('layer') ? 'walls' : 'objects')
							});
							// Make sure the roof is on top of all tokens on the Token layer
							if (oRoof.get('layer') === 'objects') toFront(oRoof);

							// Enable/Disable Adv Fog of War and Dynamic Lighting if requested
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

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        RegisterEventHandlers: registerEventHandlers
    };

}());

on("ready",function(){
    'use strict';
    SimpleRoofControl.RegisterEventHandlers();
});