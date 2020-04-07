/*
    @author: David Pokorny david.pokorny@olc.cz
    @description: factory and functions for pilots
 */

var lp_img_lp = new Image();
lp_img_lp.src = 'assets/lp.png';

var lp_img_tooltip = new Image();
lp_img_tooltip.src = 'assets/tooltip.png';

var lp_img_rocket = new Image();
lp_img_rocket.src = 'assets/rocket.png';

var lp_pilot = function () {};

lp_pilot.data = undefined;
lp_pilot.avatar = undefined;
lp_pilot.tooltip = undefined;
lp_pilot._flight = false;
lp_pilot.flight_tooltip = undefined;

/**
 * Loading pilot data to main plan
 */
lp_pilot.init = function() {
    lp_pilot.data = lp_pilot._server_load_pilot_data();
    if (!lp_pilot._add_pilot_position()) {
        return false;
    }

    // TODO continue
};

/**
 *
 * @private
 */
lp_pilot._server_load_pilot_data = function() {
    // TODO backend loading
    var json_from_server =      {   "id":1,
                                    "name":"David Pokorný",
                                    "email":"david.pokorny@olc.cz",
                                    "rank_id":"1",
                                    "rank_name":"unknown",
                                    "category_id":1,
                                    "category_name":"skauti/skautky od 6 do 9 třídy",
                                    "actual_position": null,
                                    "actual_flight": {
                                        "source_id": 1,
                                        "target_id": 4125,
                                        "start_at": new Date().toISOString(),
                                    },
                                    "photo": "absolutepath"
                                };


    // add prefixes to source and target id, because server cannot know
    json_from_server.actual_flight.source_id = lp_planet.add_planet_prefix(json_from_server.actual_flight.source_id);
    json_from_server.actual_flight.target_id = lp_planet.add_planet_prefix(json_from_server.actual_flight.target_id);


    console.log("Pilot data loaded.");
    return json_from_server;
};

/**
 * return if pilot is on planet or not
 * @returns {boolean}
 */
lp_pilot.is_on_planet = function () {
    if (lp_pilot.data === undefined) {
        console.log("Pilot data are not loaded.");
        return false;
    }

    return lp_pilot.data.actual_position !== null;
};

/**
 * return if pilot is on planet or not
 * @returns {boolean}
 */
lp_pilot.get_pilot_position = function () {
    if (lp_pilot.data === undefined) {
        console.log("Pilot data are not loaded.");
        return false;
    }

    return lp_planet.add_planet_prefix(lp_pilot.data.actual_position);
};

/**
 * Render pilot position to space
 *
 * @returns {boolean}
 * @private
 */
lp_pilot._add_pilot_position = function() {

    if (lp_pilot.data === undefined) {
        console.log("Invalid pilot data.");
        return false;
    }

    if (lp_pilot.data.actual_position !== null) {
        // Pilot is on any space object
        if (lp_planet.planet_data[lp_planet.add_planet_prefix(lp_pilot.data.actual_position)] === undefined) {
            console.log("Unknown actual position on planet.");
            return false;
        }

        console.log("Pilot is on planet: "+lp_planet.planet_data[lp_planet.add_planet_prefix(lp_pilot.data.actual_position)].name);
        lp_pilot._add_avatar(1, lp_planet.add_planet_prefix(lp_pilot.data.actual_position));
        return true;
    } else
    {
        if (lp_pilot.data.actual_flight !== null) {
            // Pilot is on the way

            lp_pilot._add_avatar(2, null, lp_pilot.data.actual_flight);
            console.log("Pilot is on the way.");
            return true;
        }  else {
            console.log("Unknown position of pilot.");
        }
    }
    return false;
};

/**
 * Render avatar on planet
 * @param avatar_type 1 = on planet, 2 = on way
 * @param id
 * @private
 */
lp_pilot._add_avatar = function(avatar_type, id, json_flight) {

    // Remove existing avatar
    if (lp_pilot.avatar !== undefined) {
        lp_pilot.avatar.destroy();
        lp_pilot.avatar = undefined;
    }

    if (lp_pilot.tooltip!==undefined) {
        lp_pilot._add_tooltip();
    }

    if (lp_pilot.flight_tooltip!==undefined) {
        lp_pilot.flight_tooltip.destroy();
        lp_pilot.flight_tooltip = undefined;
    }

    switch (avatar_type) {
        case 1: // on planet
             var planet = lp_planet.planet_data[id];
            // id is planet
             lp_pilot.avatar = new Konva.Image({
                  x: planet.actual_x-(30*lp_space.scale_height),
                  y: planet.actual_y-(68*lp_space.scale_width),
                  height: 68*lp_space.scale_width,
                  width: 30*lp_space.scale_height,
                  image: lp_img_lp,
                  shadowColor: 'black',
                  shadowBlur: 15,
                  shadowOffset: { x: 4, y: 4 },
             });

             lp_space.add_to_space(lp_pilot.avatar);
             lp_pilot.avatar.on('click', lp_pilot._add_tooltip);
             lp_pilot.avatar.on('tap', lp_pilot._add_tooltip);

             break;
        case 2: // on the way
            if (lp_planet.measure === undefined) {
                // display measure
                lp_planet.add_measure(json_flight.source_id, json_flight.target_id)
            }
            // Measure is already displayed, now rocket is display
            var result = lp_planet.get_distance_from_measure();
            var position = lp_pilot.get_flight_position(result["real_distance"], json_flight.start_at, result["time_to_fligh"]);
            var rotation = (position.m2*90)+(position.m1*result["angle"]); // m1 and m2 are multiplier by segment

            lp_pilot.avatar  = new Konva.Image({
                 x: position.x,
                 y: position.y,
                 image: lp_img_rocket,
                 rotation: rotation,
                 shadowColor: 'red',
                 shadowBlur: 20,
                 shadowOffset: { x: 0, y: 0 },
                 width: 30*lp_space.scale_width,
                 height: 96*lp_space.scale_height,
            });

            // TODO pokračovat tooltipem
            /*lp_pilot.flight_tooltip  = new Konva.Rect({
                 x: lp_planet.planet_data[lp_planet.measure_target_id].object.x(),
                 y: lp_planet.planet_data[lp_planet.measure_target_id].object.y(),
                 width: 100*lp_space.scale_width,
                 height: 100*lp_space.scale_height,
                 opacity:0.2,
                 fill: 'white',
                 stroke: 'black',
                 strokeWidth: 2
            });

            lp_space.add_to_space(lp_pilot.flight_tooltip);*/
            lp_space.add_to_space(lp_pilot.avatar);
            break
    }

    lp_space.draw();
};

/**
 * calculate point on flight line
 * @param distance
 * @param start_at
 * @param time_to_flight
 */

lp_pilot.get_flight_position = function(distance, start_at, time_to_flight) {

    if (lp_planet.measure === undefined) {
        console.log("Invalid flight line.");
        return null;
    }

    var x_start = lp_planet.planet_data[lp_planet.measure_source_id].actual_x;
    var y_start = lp_planet.planet_data[lp_planet.measure_source_id].actual_y;
    var x_target = lp_planet.planet_data[lp_planet.measure_target_id].actual_x;
    var y_target = lp_planet.planet_data[lp_planet.measure_target_id].actual_y;

    var delta_x = x_target - x_start;
    var delta_y = y_target - y_start;

    var actual_date = new Date();
    var minutes_difference = 600; // Math.round((actual_date.getTime()-Date.parse(start_at)) / 60000);
    var from_start = 1/(time_to_flight*60)* minutes_difference;

    // Linear interpolation
    var new_x_pos = x_start + (x_target - x_start) * from_start;
    var new_y_pos = y_start + (y_target - y_start) * from_start;

    var multiplier;
    var multiplier2;
    if (x_start>x_target && y_start<y_target) {
        multiplier = -1;
        multiplier2 = -1;
    }
    if (x_start>x_target && y_start>y_target) {
        multiplier = 1;
        multiplier2 = -1;
    }
    if (x_start<x_target && y_start<y_target) {
        multiplier = 1;
        multiplier2 = 1;
    }
    if (x_start<x_target && y_start>y_target) {
        multiplier = -1;
        multiplier2 = 1;
    }

    return {"x":new_x_pos ,"y":new_y_pos, "m1":multiplier, "m2":multiplier2};
};

/**
 * add small tooltip
 * @private
 */
lp_pilot._add_tooltip = function() {
     if (lp_pilot.tooltip===undefined) {

         // protection
         var x;
         var scaleX;
         if ((lp_pilot.avatar.x()+lp_pilot.avatar.width()+300) > lp_space.screen_width) {
             x = lp_pilot.avatar.x();
             scaleX = -1;
         } else {
             x = lp_pilot.avatar.x()+lp_pilot.avatar.width();
             scaleX = 1;
         }

         lp_pilot.tooltip = new Konva.Image({
              x: x,
              y: lp_pilot.avatar.y()-20,
              height: 155,
              width: 300,
              image: lp_img_tooltip,
              shadowColor: 'black',
              opacity: 0.4,
              scaleX: scaleX,
              shadowBlur: 15,
              shadowOffset: { x: 4, y: 4 },
         });

         // TODO picture

         lp_space.add_to_space(lp_pilot.tooltip);
         console.log("Tooltip of pilot loaded");
     } else {
         lp_pilot.tooltip.destroy();
         lp_pilot.tooltip = undefined;
     }
     lp_space.draw();
};

/**
 * start flight
 */
lp_pilot.start_flight = function() {
    if (lp_pilot.is_on_planet() && lp_planet.measure_target_id !== undefined) {
        result = lp_planet.get_distance_from_measure();


        lp_planet.get_planet_name(lp_planet.measure_target_id);
        if (confirm("Opravdu si přeješ zahájit let na planetu: "+lp_planet.get_planet_name(lp_planet.measure_target_id)+"? Let bude trvat "+result["time_to_fligh"]+" hodin.")) {
            console.log("Flight was started.");
            var json_to_server = lp_pilot.get_flight_json();

            // TODO send to server json_to_server

            lp_pilot._add_avatar(2, null, json_to_server);
            lp_pilot._flight = true;
        }
    } else {
        alert("Nelze zahájit let. Je třeba zadat vzdálenost a úhel letu.");
    }
};

/**
 * return json with flight information. Only source and target are important.
 * @returns {*}
 */
lp_pilot.get_flight_json = function() {
        result = lp_planet.get_distance_from_measure();

        if (result === null) {
            console.log("Invalid distance.");
            return null;
        }

        var source_id = lp_planet.measure_source_id;
        var target_id = lp_planet.measure_target_id;

        // Time to end
        var actual_time = new Date();
        var time_to_end = new Date();
        time_to_end.setTime(actual_time.getTime()+(result["time_to_fligh"]*60*60*1000));

        var returned_json = {
            "source_id": source_id,
            "target_id": target_id,
            "start_at": actual_time.toISOString(),
            "finish_at": time_to_end.toISOString()
        };

        return returned_json;
};