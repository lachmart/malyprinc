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

lp_pilot._avatar_layer = undefined;
lp_pilot.data = undefined;
lp_pilot.avatar = undefined;
lp_pilot.tooltip = undefined;
lp_pilot._flight = undefined;
lp_pilot.flight_tooltip = undefined;
lp_pilot.dialog = undefined;

/**
 * Loading pilot data to main plan
 */
lp_pilot.init = function() {
    lp_pilot.data = lp_pilot._server_load_pilot_data();
    if (!lp_pilot._add_pilot_position()) {
        return false;
    }
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
                                    "actual_position": 1,
                                    "actual_flight": null,
                                    "photo": "absolutepath"
                                };


    // add prefixes to source and target id, because server cannot know
    if (json_from_server.actual_flight !== null) {
        json_from_server.actual_flight.source_id = lp_planet.add_planet_prefix(json_from_server.actual_flight.source_id);
        json_from_server.actual_flight.target_id = lp_planet.add_planet_prefix(json_from_server.actual_flight.target_id);
    }

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
        lp_pilot.flight_progress();
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

    // create layer for avatar
    if (lp_pilot._avatar_layer === undefined) {
        lp_pilot._avatar_layer = new Konva.Layer();
        lp_space.stage.add(lp_pilot._avatar_layer);
    }

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
            var position = lp_pilot.get_flight_position(result.distance, json_flight.start_at, result.time_to_fligh);
            var rotation = (position.m2*90)+(position.m1*result["angle"]); // m1 and m2 are multiplier by segment

            var blur_size = 40;

            lp_pilot.avatar  = new Konva.Image({
                 x: position.x,
                 y: position.y,
                 image: lp_img_rocket,
                 rotation: rotation,
                 shadowColor: 'red',
                 shadowBlur: blur_size,
                 shadowOffset: { x: 0, y: 0 },
                 width: 30*lp_space.scale_width,
                 height: 96*lp_space.scale_height,
            });

            break
    }

    lp_pilot._avatar_layer.add(lp_pilot.avatar);
    lp_pilot._avatar_layer.draw();

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

    // seconds
    var second_difference = Math.round((actual_date.getTime()-Date.parse(start_at)));
    var from_start = 1/(time_to_flight*1000)* second_difference;

    var remain_distance = distance - (Math.round(distance*from_start));
    var remain_time = (time_to_flight*60) - ((time_to_flight*60)*from_start); // vrací v minutách

    // TODO set hours interval instead of seconds

    var finish = false;
    if (from_start >= 1) {
        new_x_pos = x_target;
        new_y_pos = y_target;
        finish = true;
    } else {
        // Linear interpolation
        var new_x_pos = x_start + ((x_target) - x_start) * from_start;
        var new_y_pos = y_start + ((y_target) - y_start) * from_start;
    }

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

    return {"x":new_x_pos ,"y":new_y_pos, "m1":multiplier, "m2":multiplier2, "finish": finish, "remain":remain_distance,
    "remain_time":remain_time};
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

         lp_pilot.tooltip = new Konva.Group({
             x: x,
             y: lp_pilot.avatar.y()-20,
             height: 155*lp_space.scale_width,
             width: 300*lp_space.scale_height,
         });

         var tooltip_picture = new Konva.Image({
              x: 0,
              y: 0,
              height: lp_pilot.tooltip.height(),
              width: lp_pilot.tooltip.width(),
              image: lp_img_tooltip,
              shadowColor: 'black',
              opacity: 0.4,
              scaleX: scaleX,
              shadowBlur: 15,
              shadowOffset: { x: 4, y: 4 },
         });

         var planet = new Konva.Text({
              x: 20,
              y: 10,
             text: lp_planet.get_planet_name(lp_pilot.get_pilot_position()),
             fontSize: 20*lp_space.scale_width,
             fontFamily: 'Calibri',
             fill: 'black'
         });

         var pilot_name = new Konva.Text({
              x: planet.x(),
              y: planet.y()+planet.height(),
             text: "Pilot : "+lp_pilot.data.name ,
             fontSize: 16*lp_space.scale_width,
             fontFamily: 'Calibri',
             fill: 'black'
         });

         var rank_name = new Konva.Text({
              x: planet.x(),
              y: pilot_name.y()+pilot_name.height(),
             text: "Hodnost : "+lp_pilot.data.rank_name,
             fontSize: 16*lp_space.scale_width,
             fontFamily: 'Calibri',
             fill: 'black'
         });

         lp_pilot.tooltip.add(tooltip_picture);
         lp_pilot.tooltip.add(pilot_name);
         lp_pilot.tooltip.add(rank_name);
         lp_pilot.tooltip.add(planet);

         // TODO picture and data to tooltip

         lp_space.add_to_space(lp_pilot.tooltip);
         console.log("Tooltip of pilot loaded");
     } else {
         lp_pilot.tooltip.destroy();
         lp_pilot.tooltip = undefined;
     }
     lp_space.draw();
};


/**
 * Start flight
 */
lp_pilot.start_flight = function() {

    lp_pilot.hide_dialog();
     // if (confirm("Opravdu si přeješ zahájit let na planetu: "+lp_planet.get_planet_name(lp_planet.measure_target_id)+"? Let bude trvat "+result["time_to_fligh"]+" hodin.")) {
    result = lp_planet.get_distance_from_measure();

    lp_pilot.dialog = new Konva.Group({
         x: (lp_space.screen_width)-(300*lp_space.scale_width),
        y: (lp_space.screen_height/2)-(100*lp_space.scale_height),
         width: 300*lp_space.scale_width,
        height: 200*lp_space.scale_height,
     });

    var dialog_box = new Konva.Rect({
        x: 0,
        y: 0,
        width: lp_pilot.dialog.width(),
        height: lp_pilot.dialog.height(),
        opacity: 0.4,
        fill: 'white',
        cornerRadius: 5
    });

    lp_pilot.dialog.add(dialog_box);

    var basic_size = 16;

     var flight = new Konva.Text({
          x: 10,
          y: 10,
         text: "Cíl "+lp_planet.get_planet_name(lp_planet.measure_target_id),
         fontSize: 20*lp_space.scale_width,
         fontFamily: 'Calibri',
         fill: 'black'
     });

     var parameters = new Konva.Text({
          x: flight.x(),
          y: flight.y()+flight.height(),
         text: "Parametry: "+result.distance+" au, letový úhel: "+result.angle,
         fontSize: basic_size *lp_space.scale_width,
         fontFamily: 'Calibri',
         fill: 'black'
     });

     var time = new Konva.Text({
          x: flight.x(),
          y: parameters.y()+parameters.height(),
         text: "Přílet na: "+lp_planet.get_planet_name(lp_planet.measure_target_id)+" za "+result["time_to_fligh"]+" hodin.",
         fontSize: basic_size*lp_space.scale_width,
         fontFamily: 'Calibri',
         fill: 'black'
     });

     // Time to end
     var actual_time = new Date();
     var time_to_end = new Date();
     time_to_end.setTime(actual_time.getTime()+(result["time_to_fligh"]*60*60*1000));

     var time2 = new Konva.Text({
          x: 10,
          y: time.y()+time.height(),
         text: "V čase "+time_to_end,
         fontSize: 16*lp_space.scale_width,
         fontFamily: 'Calibri',
         fill: 'black'
     });

     lp_pilot.dialog.add(flight);
     lp_pilot.dialog.add(parameters);
     lp_pilot.dialog.add(time);
     lp_pilot.dialog.add(time2);

    // Events
    lp_pilot.dialog.on('click', lp_pilot._activate_flight);
    lp_pilot.dialog.on('tap', lp_pilot._activate_flight);

    lp_space.add_to_space(lp_pilot.dialog);
    lp_space.add_to_space(lp_pilot.dialog);
    lp_space.draw();
};

/**
 * Hide dialog from screen
 */
lp_pilot.hide_dialog = function() {
    if (lp_pilot.dialog !== undefined) {
        lp_pilot.dialog.destroy();
        lp_pilot.dialog = undefined;
    };
};

/**
 * Activate flight
 */
lp_pilot._activate_flight = function() {
    if (lp_pilot.is_on_planet() && lp_planet.measure_target_id !== undefined) {
        if (lp_pilot.is_in_flight()) {
            return
        }

        lp_pilot.hide_dialog();
        lp_planet.get_planet_name(lp_planet.measure_target_id);

        var json_to_server = lp_pilot.create_flight_json();

        // TODO send to server json_to_server

        lp_pilot.data.actual_flight = json_to_server;
        lp_pilot.flight_progress();
    } else {
        console.log("Flight is not possible, because measure is missing.")
    }
};

/* Starting flight */
lp_pilot.flight_progress = function() {

    if (lp_pilot.is_in_flight()) {
        // cannot flight twice in one time
        return false;
    }

    if (lp_pilot.data.actual_flight === null) {
        console.log("Unknown position of pilot.");
        return false;
    }

    lp_pilot._add_avatar(2, null, lp_pilot.data.actual_flight);

    var result = lp_planet.get_distance_from_measure();
    lp_pilot.data.actual_flight["distance"] = result.distance;
    lp_pilot.data.actual_flight["time_to_fligh"] = result.time_to_fligh;

    console.log("Flight in progress.");

    lp_pilot._flight = new Konva.Animation(function(frame) {
        var position = lp_pilot.get_flight_position(lp_pilot.data.actual_flight.distance, lp_pilot.data.actual_flight.start_at, lp_pilot.data.actual_flight.time_to_fligh);

        /*var time = frame.time,
        timeDiff = frame.timeDiff,
        frameRate = frame.frameRate;*/

        // new position
        lp_pilot.avatar.x(position.x);
        lp_pilot.avatar.y(position.y);

        // Change title
        lp_planet.measure_title.text("Cíl:"+Math.round(position.remain_time)+" min.");
        lp_space.draw();

        if (position.finish) {
            console.log("Flight finished");
            this.stop();
            lp_pilot.set_planet_position(lp_planet.measure_target_id);
        }

    }, lp_pilot._avatar_layer);

    lp_pilot._flight.start();
};

/**
 * Set position to new planet
 * @param target_id
 */
lp_pilot.set_planet_position = function(target_id) {
    // Set new position
    lp_pilot.data.actual_position = target_id;

    // reset flight
    lp_pilot.data.actual_flight = null;
    lp_pilot._flight = undefined;

    // Remove measure
    lp_planet.remove_measure();

    // display avatar
    lp_pilot._add_pilot_position();

    // TODO json to server
};

/**
 * Return flight in progress.
 * @returns {boolean}
 */
lp_pilot.is_in_flight = function() {
    return lp_pilot._flight !== undefined;
};

/**
 * return json with flight information. Only source and target are important.
 * @returns {*}
 */
lp_pilot.create_flight_json = function() {
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