/*
    @author: David Pokorny david.pokorny@olc.cz
    @description: main class for handling space and area
 */

/* images fro planet.js */
var lp_img_space = new Image();
lp_img_space.src = 'assets/space.jpg';


var lp_space = function () {};

// Global array
lp_space.stage = undefined;
lp_space._layer = undefined;
lp_space._area = undefined;
lp_space._earth = undefined;

lp_space.div_space_id = "lp_space";

// dimensions
lp_space.basic_width = undefined;
lp_space.basic_height = undefined;
lp_space.screen_width = undefined;
lp_space.screen_height = undefined;
lp_space.scale_width = undefined;
lp_space.scale_height = undefined;

/* initialization of space for little prince */
lp_space.init = function()
{
    lp_space.recalculate_space();
    lp_pilot.init();
};

/**
 * Basic calculation of dimensions
 */
lp_space.recalculate_space = function() {
    lp_space.basic_width = 1440;
    lp_space.basic_height = 810;
    lp_space.screen_width = window.innerWidth;

    // preserve 16:9 format
    lp_space.screen_height = 8/16*lp_space.screen_width;

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

    lp_space.stage.add(lp_space._layer);
    lp_space.add_to_space(lp_space._area);
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
            case "warm_hole":
                // code block
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
                                {"id":1, "name":"Země", "custom_name":null,"x":null, "y":null, "size":150, "type":"earth"},
                                {"id":2346, "name":null, "custom_name": null, "x":300, "y":100, "size":70, "type":"standard_planet"},
                                {"id":3245, "name":"Tutu", "custom_name":null, "x":600, "y":600, "size":40, "type":"standard_planet"},
                                {"id":4125, "name":"Dejmalova", "custom_name":null, "x":1300, "y":700, "size":40, "type":"special_planet"},
                                {"id":5987, "name":"Vojačkova", "custom_name":null, "x":1100, "y":200, "size":80, "type":"standard_planet"},
                                {"id":7865, "name":"Proxima", "custom_name":null, "x":324, "y":500, "size":60, "type":"special_planet"},
                            ]
                            };
    return json_from_server;
};
