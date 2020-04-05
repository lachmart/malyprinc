/*
    @author: David Pokorny david.pokorny@olc.cz
    @description: factory and functions for planet manipulation
 */
var lp_planet = function () {};
lp_planet.earth = undefined;
lp_planet.planets = {};
lp_planet.planet_data = {};
lp_planet.measure = undefined;
lp_planet.measure_source_id = undefined;
lp_planet.measure_target_id = undefined;

lp_planet.create_standard_planet = function (planet_data) {
    // create earth in the middle
    if ((planet_data.x > lp_space.stage.width()) || (planet_data.y > lp_space.stage.height())) {
        console.log("Planet "+planet_data.id+" is out of space.");
        return;
    }

    var planet_key = lp_planet.add_planet_prefix(planet_data.id);
    lp_planet.planets[planet_key] = new Konva.Circle({
         x: planet_data.x*lp_space.scale_width,
         y: planet_data.y*lp_space.scale_height,
         radius: 20*lp_space.scale_width,
         fill: planet_data.color,
         stroke: planet_data.color,
         strokeWidth: 1
    });

    lp_planet.planet_data[planet_key] = planet_data;
    lp_planet.planet_data[planet_key].object = lp_planet.planets[planet_key];
    lp_planet.planet_data[planet_key].actual_x = lp_planet.planets[planet_key].x();
    lp_planet.planet_data[planet_key].actual_y = lp_planet.planets[planet_key].y();

    // register events
    lp_planet.planets[planet_key].on('click', function () {lp_planet.click(planet_key);});
    lp_planet.planets[planet_key].on('tap', function () {lp_planet.click(planet_key);});

    lp_space._layer.add(lp_planet.planets[planet_key]);
};

/**
 * Add earth to stage
 * @param earth_data json
 * @private
 */
lp_planet.create_earth = function (earth_data) {
    // create earth in the middle
    if (lp_planet.earth !== undefined) {
        console.log("Earth is only one allowed.");
        return;
    }

    lp_planet.earth = new Konva.Circle({
      x: lp_space.stage.width()/2,
      y: lp_space.stage.height()/2,
      radius: 70*lp_space.scale_width,
      fill: earth_data.color,
      stroke: earth_data.color,
      strokeWidth: 1
    });

    var planet_key = lp_planet.add_planet_prefix(earth_data.id);
    lp_planet.planet_data[planet_key] = earth_data;
    lp_planet.planet_data[planet_key].object = lp_planet.earth;
    lp_planet.planet_data[planet_key].x = lp_space.basic_width/2;
    lp_planet.planet_data[planet_key].y = lp_space.basic_height/2;
    lp_planet.planet_data[planet_key].actual_x = lp_planet.earth.x();
    lp_planet.planet_data[planet_key].actual_y = lp_planet.earth.y();

    lp_planet.earth.on('click', lp_planet.remove_measure);

    lp_space.add_to_space(lp_planet.earth);
};

/**
 * What happens when planet is clicked/touched
 * @param planet_id
 */
lp_planet.click = function(planet_id) {
    if (lp_planet.planets[planet_id] === undefined) {
        console.log("Invalid planet "+planet_id+".");
        return false;
    }
    planet_data = lp_planet.planet_data[planet_id];

    if (lp_pilot.get_pilot_position() === planet_id) {
        console.log("Navigation on same planet is not allowed.");
        return;
    }

    if (planet_data.name === null) {
        plane_name = "nepojmenovaná";
    } else {
        plane_name = planet_data.name;
    }

    // check if pilot is on planet.
    if (lp_pilot.is_on_planet()) {
        if (confirm("Přejete si letět na planetu: "+plane_name+" ?")) {
            lp_planet.add_measure(lp_pilot.get_pilot_position(), planet_id)
        }
    } else {
        console.log("Pilot cannot navigate, because is on the way.");
    }
};

/**
 * Return id prefixed to name in array
 * @param id
 * @returns {string}
 */
lp_planet.add_planet_prefix = function(id) {
    return "pl_"+id;
};

/**
 * Add measure between objects
 * @param source_id
 * @param target_id
 */
lp_planet.add_measure = function(source_id, target_id) {
    var source = lp_planet.planet_data[source_id].object;
    var target = lp_planet.planet_data[target_id].object;

    lp_planet.measure_source_id = source_id;
    lp_planet.measure_target_id = target_id;

    if (lp_planet.measure === undefined) {
        lp_planet.measure = new Konva.Line({
            points: [source.x(), source.y(), target.x(), target.y()],
            stroke: 'white',
            tension: 1,
            dash: [4, 5]
        });
        lp_space.add_to_space(lp_planet.measure);
    } else {
        lp_planet.measure.points([source.x(), source.y(), target.x(), target.y()]);
    }
    lp_space.draw();
    alert(lp_planet.get_distance_from_measure());
};

/**
 * Get distance by measure
 * @returns {null}
 */
lp_planet.get_distance_from_measure = function() {
    if (lp_planet.measure !== undefined) {
        var source_x = lp_planet.planet_data[lp_planet.measure_source_id].x;
        var source_y = lp_planet.planet_data[lp_planet.measure_source_id].y;
        var target_x = lp_planet.planet_data[lp_planet.measure_target_id].x;
        var target_y = lp_planet.planet_data[lp_planet.measure_target_id].y;

        var a = (source_x)-(target_x);
        var b = (source_y)-(target_y);;
        return Math.round(Math.sqrt(Math.pow(a,2)+Math.pow(b,2)));
    }
    return null;
};

/**
 * Remove measure from space
 */
lp_planet.remove_measure = function() {

    if (lp_planet.measure !== undefined) {
        lp_planet.measure.destroy();
        lp_planet.measure = undefined;
        lp_planet.measure_source_id = undefined;
        lp_planet.measure_target_id = undefined;
    }
    lp_space.draw();
};