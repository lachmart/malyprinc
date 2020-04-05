/*
    @author: David Pokorny david.pokorny@olc.cz
    @description: main class for handling space and area
 */

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
    lp_space._area = new Konva.Rect({
        x:0,
        y:0,
        width: lp_space.stage.width(),
        height: lp_space.stage.height(),
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1
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
                lp_planet.create_standard_planet(plannets.planet[pos]);
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
                                {"id":1, "name":"Země", "x":null, "y":null, "picture":null, "size":null, "color": "blue", "type":"earth"},
                                {"id":2, "name":null, "x":300, "y":100, "picture":null, "size":null,"color": "white", "type":"standard_planet"},
                                {"id":3, "name":"Tutu", "x":600, "y":600, "picture":null, "size":null,"color": "white", "type":"standard_planet"},
                                {"id":4, "name":"Jupiter", "x":1200, "y":600, "picture":null, "size":null,"color": "white", "type":"standard_planet"},
                                {"id":5, "name":"Merkur", "x":1100, "y":200, "picture":null, "size":null,"color": "white", "type":"standard_planet"},
                            ]
                            };
    return json_from_server;
};
