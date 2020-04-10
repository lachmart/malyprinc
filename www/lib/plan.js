/*
    @author: David Pokorny david.pokorny@olc.cz
    @description: main class for handling space and area
 */

/* images fro planet.js */
var lp_img_space = new Image();
lp_img_space.src = 'assets/space.jpg';

var lp_logo = new Image();
lp_logo.src = 'assets/logo.png';

var lp_worm_hole = new Image();
lp_worm_hole.src = 'assets/worm_hole.png';

var lp_activity_dialog = new Image();
lp_activity_dialog.src = 'assets/dialog.png';

var lp_messagebox = new Image();
lp_messagebox.src = 'assets/dialog2.png';

var lp_close = new Image();
lp_close.src = 'assets/close.png';


var lp_space = function () {};

// Global array
lp_space.stage = undefined;
lp_space._layer = undefined;
lp_space._dialog_layer = undefined;
lp_space._area = undefined;
lp_space._earth = undefined;
lp_space._activity_dialog = undefined;
lp_space._messagebox = undefined;
lp_space._cover = undefined;

lp_space.div_space_id = "lp_space";

// dimensions
lp_space.basic_width = undefined;
lp_space.basic_height = undefined;
lp_space.screen_width = undefined;
lp_space.screen_height = undefined;
lp_space.scale_width = undefined;
lp_space.scale_height = undefined;

lp_space.header_font = 20;
lp_space.basic_font = 16;

/* initialization of space for little prince */
lp_space.init = function()
{
    lp_space.create_space();
    lp_pilot.init();
};

/**
 * Add button effect
 * @param button obj to add
 * @param direction true enable, false disable
 * @param color
 * @param layer to render
 */
lp_space.add_button_effect = function(button, direction, color, layer) {
    if (direction) {
        button.shadowColor(color);
        button.shadowBlur(25);
        button.shadowOffset({ x: 0, y: 0 });
        lp_space.stage.container().style.cursor = 'pointer';
    } else {
        button.shadowBlur(0);
        lp_space.stage.container().style.cursor = 'default';
    }
    layer.draw();
};

/**
 * Basic calculation of dimensions
 */
lp_space.create_space = function() {
    lp_space.basic_width = 1440;
    lp_space.basic_height = 810;
    lp_space.screen_width = window.innerWidth;

    // preserve 16:9 format
    lp_space.screen_height = 9/16*lp_space.screen_width;

    lp_space.scale_width = lp_space.screen_width/lp_space.basic_width;
    lp_space.scale_height = lp_space.screen_height/lp_space.basic_height;

    // init stage
    lp_space._createStage();
};

/**
 *  Initialization of konva stage
 * @private
 */
lp_space._createStage = function() {
    console.log("Creating Little prince environment.");
    lp_space.stage = new Konva.Stage({
        container: lp_space.div_space_id,
        width: lp_space.basic_width*lp_space.scale_width,
        height: lp_space.basic_height*lp_space.scale_height
    });

    // main layer for objects
    lp_space._layer = new Konva.Layer();

    // create space for events
    lp_space._area = new Konva.Image({
        x:0,
        y:0,
        image: lp_img_space,
        width: lp_space.stage.width(),
        height: lp_space.stage.height(),
    });

    lp_space._area.on("click", lp_action.openFullscreen);
    lp_space._area.on("tap", lp_action.openFullscreen);

    var logo = new Konva.Image({
        x:5*lp_space.scale_width,
        y:5*lp_space.scale_width,
        opacity: 1,
        image: lp_logo,

        width: 70*lp_space.scale_width,
        height: 70*lp_space.scale_width,
    });

    logo.on("mouseenter", function() {lp_space.add_button_effect(logo,true, "#B3C6C6",lp_space._layer)});
    logo.on("mouseleave", function() {lp_space.add_button_effect(logo,false, null, lp_space._layer)});
    logo.on("click", function() {lp_action.go_to_deck_logbook()});
    logo.on("tap", function() {lp_action.go_to_deck_logbook()});

    lp_space.stage.add(lp_space._layer);
    lp_space.add_to_space(lp_space._area);
    lp_space.add_to_space(logo);
    lp_space._add_plannets();
    lp_space.draw();
};

/**
 * redraw main layer of space
 */
lp_space.draw = function() {
    console.log("Rendering space.");
    lp_space._layer.draw();
};

/**
 * Add object to space without render
 * @param object
 */
lp_space.add_to_space = function(object) {
    lp_space._layer.add(object);
};


/**
 * Add planets from server
 * @private
 */
lp_space._add_plannets = function() {
    console.log("Adding planets.");
    var plannets = lp_space._server_load_space_object();
    for (var pos in plannets.planet) {
        switch(plannets.planet[pos].type.toLowerCase()) {
            case "earth":
                lp_planet.create_earth(plannets.planet[pos]);
                break;
            case "standard_planet":
                lp_planet.create_planet(plannets.planet[pos], lp_img_planet);
                break;
            case "special_planet":
                lp_planet.create_planet(plannets.planet[pos], lp_img_planet2);
                break;
            case "chair_planet":
                lp_planet.create_planet(plannets.planet[pos], lp_img_planet3);
                break;
            case "worm_hole":
                lp_planet.create_planet(plannets.planet[pos], lp_worm_hole);
                break;
            default:
                // other objects
                break
        }
    }
};


/**
 * Load space object from server in json
 * @private
 */
lp_space._server_load_space_object = function() {
    // TODO backend loading
    var json_from_server = {
                            "planet":[
                                {"id":1, "name":"Země", "size":150, "type":"earth"},
                                {"id":2346, "name":null, "custom_name": "Šamanova", "x":300, "y":100, "size":70, "type":"standard_planet"},
                                {"id":3245, "name":"Tutu", "x":600, "y":600, "size":40, "type":"standard_planet"},
                                {"id":4125, "name":"Dejmalova", "x":1100, "y":610, "size":60, "type":"chair_planet", "shadow_color":"orange", "aspect_ration":1.23},
                                {"id":5987, "name":"Vojačkova", "x":1150, "y":200, "size":80, "type":"standard_planet"},
                                {"id":5917, "name":"Hernova", "x":900, "y":520, "size":60, "type":"standard_planet"},
                                {"id":8765, "name":null, "custom_name":null, "x":1110, "y":250, "size":20, "type":"standard_planet"},
                                {"id":7865, "name":"Proxima", "x":424, "y":500, "size":60, "type":"special_planet"},
                                {"id":1456, "name":"Royova", "x":700, "y":160, "size":90, "type":"special_planet"},
                                {"id":2456, "x":550, "y":356, "type":"worm_hole", "end": 2457},
                                {"id":2457, "x":1220, "y":543, "type":"worm_hole", "end": 2456},
                            ]
                            };
    return json_from_server;
};

/**
 * Planet activity
 * @param planet_id
 */
lp_space.display_activity = function(planet_id) {

    lp_pilot.hide_flight_planer();

    if (lp_space._dialog_layer===undefined) {
        lp_space._dialog_layer = new Konva.Layer();
        lp_space.stage.add(lp_space._dialog_layer);
    }

    // Main dialog group
    lp_space._activity_dialog = new Konva.Group({
        x: (lp_space.screen_width/2)-((600*lp_space.scale_width)/2),
        y: (lp_space.screen_height/2)-((625*lp_space.scale_width)/2),
        width: 600*lp_space.scale_width,
        height: 625*lp_space.scale_width,
    });

    var dialog_box = new Konva.Image({
        x: 0,
        y: 0,
        width: lp_space._activity_dialog.width(),
        height: lp_space._activity_dialog.height(),
        image: lp_activity_dialog,
        shadowColor: 'black',
        shadowBlur: 20,
        shadowOffset: { x: 10, y: 10 },
    });

    var close_button = new Konva.Image({
        x: lp_space._activity_dialog.width()-(110*lp_space.scale_width),
        y: 40,
        width: 60*lp_space.scale_width,
        height: 60*lp_space.scale_width,
        image: lp_close,
    });

    close_button.on("mouseenter", function() {lp_space.add_button_effect(close_button,true, "white",lp_space._dialog_layer)});
    close_button.on("mouseleave", function() {lp_space.add_button_effect(close_button,false, null, lp_space._dialog_layer)});

    close_button.on("click", function() {lp_space.hide_displayed_activity()});
    close_button.on("tap", function() {lp_space.hide_displayed_activity()});

    lp_space._activity_dialog.add(dialog_box);
    lp_space._activity_dialog.add(close_button);

    lp_space._dialog_layer.add(lp_space._activity_dialog);
    lp_space._dialog_layer.draw();
};

/**
 *
 * @returns {boolean}
 */
lp_space.is_displayed_activity = function() {
    return lp_space._activity_dialog !== undefined;
};

/**
 *
 * @returns {boolean}
 */
lp_space.hide_displayed_activity = function() {
    if (lp_space.is_displayed_activity()) {
        lp_space._activity_dialog.destroy();
        lp_space._activity_dialog = undefined;
        lp_space._dialog_layer.draw();
    }
};

/**
 * Display messagebox
 *
 * @param message
 * @param action_to_click
 */

lp_space.messagebox = function(message, action_to_click) {

    if (lp_space._dialog_layer===undefined) {
        lp_space._dialog_layer = new Konva.Layer();
        lp_space.stage.add(lp_space._dialog_layer);
    }

    // Main dialog group
    lp_space._cover = new Konva.Rect({
        x: 0,
        y: 0,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1,
        opacity: 0.5,
        width: lp_space.screen_width,
        height: lp_space.screen_height,
    });

    // Main dialog group
    lp_space._messagebox = new Konva.Group({
        x: (lp_space.screen_width/2)-((550*lp_space.scale_width)/2),
        y: (lp_space.screen_height/2)-((199*lp_space.scale_width)/2),
        width: 550*lp_space.scale_width,
        height: 199*lp_space.scale_width,
    });

    var dialog_box = new Konva.Image({
        x: 0,
        y: 0,
        width: lp_space._messagebox.width(),
        height: lp_space._messagebox.height(),
        image: lp_messagebox,
        shadowColor: 'black',
        shadowBlur: 20,
        shadowOffset: { x: 10, y: 10 },
    });

    var close_button = new Konva.Image({
        x: lp_space._messagebox.width()-(85*lp_space.scale_width),
        y: 25*lp_space.scale_width,
        width: 60*lp_space.scale_width,
        height: 60*lp_space.scale_width,
        image: lp_close,
    });

    close_button.on("mouseenter", function() {lp_space.add_button_effect(close_button,true, "white",lp_space._dialog_layer)});
    close_button.on("mouseleave", function() {lp_space.add_button_effect(close_button,false, null, lp_space._dialog_layer)});

    close_button.on("click", function() {lp_space.hide_messagebox()});
    close_button.on("tap", function() {lp_space.hide_messagebox()});

    lp_space._messagebox.add(dialog_box);
    lp_space._messagebox.add(close_button);

    var text_message = new Konva.Text({
        x: 180*lp_space.scale_width,
        y: 50*lp_space.scale_height,
        width: 280*lp_space.scale_width,
        text: message,
        fontSize: Math.round(25*lp_space.scale_width),
        fontFamily: 'Calibri',
        fill: 'white'
    });

    if (action_to_click !== undefined) {
        text_message.on("mouseenter", function() {lp_space.add_button_effect(text_message,true, "black",lp_space._dialog_layer)});
        text_message.on("mouseleave", function() {lp_space.add_button_effect(text_message,false, null, lp_space._dialog_layer)});

        text_message.on("click", action_to_click);
        text_message.on("tap", action_to_click);
    }

    lp_space._messagebox.add(text_message);

    lp_space._dialog_layer.add(lp_space._cover);
    lp_space._dialog_layer.add(lp_space._messagebox);
    lp_space._dialog_layer.draw();
};

/**
 * Hide messagebox
 */
lp_space.hide_messagebox = function() {
    if (lp_space._messagebox !== undefined) {
        lp_space._cover.destroy();
        lp_space._cover = undefined;
        lp_space._messagebox.destroy();
        lp_space._messagebox = undefined;
        lp_space._dialog_layer.draw();
    }
};