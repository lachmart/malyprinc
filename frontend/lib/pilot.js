/*
    @author: David Pokorny david.pokorny@olc.cz
    @description: factory and functions for pilots
 */
var lp_pilot = function () {};

var lp_img_lp = new Image();
lp_img_lp.src = 'assets/lp.png';


lp_pilot.data = undefined;
lp_pilot.avatar = undefined;

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
                                    "actual_position": 5987,
                                    "actual_flight": null
                                };

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
lp_pilot._add_avatar = function(avatar_type, id) {
    switch (avatar_type) {
        case 1:
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
             lp_space.draw();
             break;
        case 2:
            // id is flight
            // TODO avatar on flight
            break
    }
    console.log("Avatar of pilot added");
};

/**
 * start flight
 */
lp_pilot.start_flight = function() {
    if (lp_pilot.is_on_planet() && lp_planet.measure_target_id !== undefined) {
        result = lp_planet.get_distance_from_measure();

        // Time to end
        var actual_time = new Date();
        var time_to_end = new Date();
        time_to_end.setTime(actual_time.getTime()+(result["time_to_fligh"]*60*60*1000));

        lp_planet.get_planet_name(lp_planet.measure_target_id);
        if (confirm("Opravdu si přejete zahájit let na planetu: "+lp_planet.get_planet_name(lp_planet.measure_target_id)+"? Let bude trvat "+result["time_to_fligh"]+" hodin. Čas příletu "+time_to_end)) {
            console.log("Flight was started.");
            // TODO send to server;
        }
    } else {
        alert("Nelze zahájit let. Je třeba zadat vzdálenost a úhel letu.");
    }
};