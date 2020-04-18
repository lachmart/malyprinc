/*
    @author: David Pokorny david.pokorny@olc.cz
    @description: factory and functions for planet manipulation
 */

/* images fro planet.js */
var lp_img_earth = new Image();
lp_img_earth.src = 'assets/earth.png';

var lp_img_planet = new Image();
lp_img_planet.src = 'assets/planet2.png';

var lp_img_planet2 = new Image();
lp_img_planet2.src = 'assets/planet.png';

var lp_img_planet3 = new Image();
lp_img_planet3.src = 'assets/planet4.png';


var lp_planet = function () {};

lp_planet.vars = function() {

    lp_planet.earth = undefined;
    lp_planet.planets = {};
    lp_planet.planet_data = {};
    lp_planet.measure = undefined;
    lp_planet.measure_title = undefined;
    lp_planet.measure_source_id = undefined;
    lp_planet.measure_target_id = undefined;
    lp_planet.flight_counter = undefined;

};

/**
 * Create standard planet based data
 *
 * @param planet_data json
 * @param picture_obj img
 */
lp_planet.create_planet = function (planet_data, picture_obj) {
    // create earth in the middle
    if ((planet_data.actual_x > lp_space.stage.width()) || (planet_data.actual_y > lp_space.stage.height())) {
        console.log("Planet "+planet_data.id+" is out of space.");
        return;
    }

    var planet_key = lp_planet.add_planet_prefix(planet_data.id);

    if (planet_data.type === "worm_hole") {
        planet_data.size = 40;
    }

    var aspect_ratio;
    if (planet_data.aspect_ration===undefined) {
        aspect_ratio = 1;
    } else {
        aspect_ratio = planet_data.aspect_ration;
    }

    var opacity;
    if (planet_data.visited) {
        opacity = 0.3;
    } else {
        opacity = 1;
    }

    lp_planet.planets[planet_key] = new Konva.Image({
         x: (planet_data.x*lp_space.scale_width)-((planet_data.size*lp_space.scale_width)/2),
         y: (planet_data.y*lp_space.scale_height)-((planet_data.size*lp_space.scale_width)/2),
         image: picture_obj,
         opacity:opacity,
         width: planet_data.size*lp_space.scale_width,
         height: planet_data.size*lp_space.scale_width*aspect_ratio,
    });

    if (planet_data.type === "worm_hole") {
        lp_planet.planets[planet_key].opacity(0.3);
        lp_planet.planets[planet_key].shadowColor("orange");
        lp_planet.planets[planet_key].shadowBlur(20);
        lp_planet.planets[planet_key].shadowOffset({ x: 0, y: 0 });
    }
    else {
         var shadow_color;
        if (planet_data.shadow_color===undefined) {
            shadow_color = 'black';
        } else {
            shadow_color = planet_data.shadow_color;
        }

        lp_planet.planets[planet_key].shadowColor(shadow_color);
        lp_planet.planets[planet_key].shadowBlur(15);
        lp_planet.planets[planet_key].shadowOffset({ x: 4, y: 4 });
    }

    lp_planet.planet_data[planet_key] = planet_data;
    lp_planet.planet_data[planet_key].object = lp_planet.planets[planet_key];
    lp_planet.planet_data[planet_key].actual_x = lp_planet.planets[planet_key].x()+((planet_data.size*lp_space.scale_width)/2);
    lp_planet.planet_data[planet_key].actual_y = lp_planet.planets[planet_key].y()+((planet_data.size*lp_space.scale_width)/2);

    // register events
    lp_planet.planets[planet_key].on('click', function () {lp_planet.click(planet_key);});
    lp_planet.planets[planet_key].on('tap', function () {lp_planet.click(planet_key);});

    lp_planet.planets[planet_key].on("mouseenter", function () {
        if (!lp_pilot.is_in_flight() && !lp_space.is_displayed_activity()) {
            lp_space.stage.container().style.cursor = 'pointer';}
        }

    );
    lp_planet.planets[planet_key].on("mouseleave", function () {lp_space.stage.container().style.cursor = 'default';});

    if (planet_data.type !== "worm_hole") {
        var planet_name = lp_planet.get_planet_name(planet_key);

        lp_planet.planet_data[planet_key].title = new Konva.Text({
            x: lp_planet.planet_data[planet_key].actual_x,
            y: lp_planet.planets[planet_key].y() + lp_planet.planets[planet_key].height() + 5, //5 is offset
            text: planet_name,
            fontSize: Math.round(13*lp_space.scale_width),
            opacity: opacity,
            fontFamily: 'Calibri',
            fill: 'white'
        });
        lp_space.add_to_space(lp_planet.planet_data[planet_key].title);
    }

    lp_space.add_to_space(lp_planet.planets[planet_key]);
};

/**
 * Rename planet if possible
 * @param planet_id
 * @private
 */
lp_planet._rename_planet = function(planet_id) {
    planet_data = lp_planet.planet_data[planet_id];
    if (planet_data.type ==="worm_hole") {
        return;
    }
    if (planet_data.name === null && planet_data.custom_name === null) {
        var parts = lp_space.messagebox("Jsi tady první a máš právo pojmenovat planetu.");

        var dialog_position = lp_space._messagebox.getAbsolutePosition();

        // add textbox
        lp_space._text_object = document.createElement('input');
        document.body.appendChild(lp_space._text_object);

        lp_space._text_object.classList.add("rename_planet");
        lp_space._text_object.style.position = 'absolute';
        lp_space._text_object.style.top = (dialog_position.y + parts.text_message.y()+ parts.text_message.height()+ (10*lp_space.scale_height)) + 'px';
        lp_space._text_object.style.left = (dialog_position.x + parts.text_message.x()) + 'px';
        lp_space._text_object.style.width = (parts.text_message.width()-(20*lp_space.scale_width))+"px";
        lp_space._text_object.style.height = (40*lp_space.scale_height)+"px";
        lp_space._text_object.maxLength = "15";
        lp_space._text_object.style.fontSize = Math.round(25*lp_space.scale_height)+"px";
        lp_space._text_object.focus();

        // Add button
        var button_to_send = new Konva.Rect({
            x: parts.text_message.x()+parts.text_message.width(),
            y: parts.text_message.y()+parts.text_message.height()+(10*lp_space.scale_height),
            fill: 'gray',
            stroke: 'gray',
            strokeWidth: 1,
            width: (40*lp_space.scale_width),
            height: (40*lp_space.scale_height),
        });

        // Text to button
        var ok_text = new Konva.Text({
            x: button_to_send.x()+(10*lp_space.scale_width),
            y: button_to_send.y()+(10*lp_space.scale_height),
            fontSize: Math.round(20*lp_space.scale_width),
            fontFamily: 'Calibri',
            fill: 'white',
            text: "ok",
        });

        button_to_send.on("mouseenter", function() {lp_space.add_button_effect(button_to_send,true, "white",lp_space._dialog_layer)});
        button_to_send.on("mouseleave", function() {lp_space.add_button_effect(button_to_send,false, null, lp_space._dialog_layer)});
        button_to_send.on("click",function() { lp_planet._send_rename(lp_space._text_object.value, planet_id); } );
        button_to_send.on("tap", function () {lp_planet._send_rename(lp_space._text_object.value, planet_id); } );
        ok_text.on("mouseenter", function() {lp_space.add_button_effect(ok_text,true, "white",lp_space._dialog_layer)});
        ok_text.on("mouseleave", function() {lp_space.add_button_effect(ok_text,false, null, lp_space._dialog_layer)});
        ok_text.on("click",function() { lp_planet._send_rename(lp_space._text_object.value, planet_id); } );
        ok_text.on("tap", function () {lp_planet._send_rename(lp_space._text_object.value, planet_id); } );

        lp_space._messagebox.add(button_to_send);
        lp_space._messagebox.add(ok_text);
        lp_space._dialog_layer.draw();
    }
};

/**
 * Sending rename to server
 * @private
 */
lp_planet._send_rename = function(new_name, planet_id) {

    if (new_name==="") {
        alert("Nový název planety nemůže být prázdný.");
        lp_space._text_object.focus();
        return;
    }

    var json_to_server = {
        "target_id": lp_planet.remove_planet_prefix(planet_id),
        "new_name": new_name,
    };

    var json_from_server =  $.ajax({
          url: 'map/setposition',
          async: true,
          data: json_to_server,
          dataType: 'json'
      }).responseJSON;

    console.log(new_name);

    // Set name to planet
    lp_planet.planet_data[planet_id].custom_name = new_name;
    lp_planet.planet_data[planet_id].title.text(lp_planet.get_planet_name(planet_id));
    lp_space.draw();

    lp_space.hide_messagebox();
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

    if (!lp_img_earth.complete) {
        console.log("Picture lp_img_earth is not loaded.");
        return;
    }

    lp_planet.earth = new Konva.Image({
          x: (lp_space.stage.width()/2)-((earth_data.size*lp_space.scale_width)/2),
          y: (lp_space.stage.height()/2)-((earth_data.size*lp_space.scale_width)/2),
          image: lp_img_earth,
          width: earth_data.size*lp_space.scale_width,
          height: earth_data.size*lp_space.scale_width,
          shadowColor: 'black',
          shadowBlur: 20,
          shadowOffset: { x: 4, y: 4 },
        });

    var planet_key = lp_planet.add_planet_prefix(earth_data.id);
    lp_planet.planet_data[planet_key] = earth_data;
    lp_planet.planet_data[planet_key].object = lp_planet.earth;
    lp_planet.planet_data[planet_key].x = lp_space.basic_width/2;
    lp_planet.planet_data[planet_key].y = lp_space.basic_height/2;
    lp_planet.planet_data[planet_key].actual_x = lp_planet.earth.x()+((earth_data.size*lp_space.scale_width)/2);
    lp_planet.planet_data[planet_key].actual_y = lp_planet.earth.y()+((earth_data.size*lp_space.scale_width)/2);

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

    var pilot_planet_position = lp_pilot.get_pilot_position();
    if (lp_planet.planet_data[pilot_planet_position].type==='earth' && !lp_planet.planet_data[pilot_planet_position].visited ){
        // cannot flight
        lp_space.messagebox("Nemůžeš opustit Zemi, dokud nesplníš startovní aktivitu. Klikni na pilota a na kulaté tlačítko pro více informací.");
        return;
    }

    var planet_data = lp_planet.planet_data[planet_id];

    if (lp_pilot.get_pilot_position() === planet_id && !lp_pilot.is_in_flight()) {
        lp_pilot.pilot_details();
        return;
    }

    if (!lp_pilot.is_in_flight()) {
        var planet_name = lp_planet.get_planet_name(planet_id);

        // check if pilot is on planet.
        if (lp_pilot.is_on_planet()) {

            // nof flight when open activity
            if (!lp_space.is_displayed_activity()) {
                 lp_planet.add_measure(lp_pilot.get_pilot_position(), planet_id);
                 lp_pilot.start_flight();
            }

        } else {
            console.log("Pilot cannot navigate, because is on the way.");
        }
    }
};

/**
 * Get planet name
 * @param planet_id
 * @returns {string|*}
 */
lp_planet.get_planet_name = function(planet_id) {
    var planet_data = lp_planet.planet_data[planet_id];

    if (planet_data.type === "worm_hole") {
        return "?";
    }

    var planet_name = planet_data.name;
    if (planet_name === null) {
        if (planet_data.custom_name === null) {
            planet_name = planet_data.id;
        } else {
            planet_name = planet_data.id+" - "+planet_data.custom_name;
        }
    }

    return planet_name;
};

/**
 * Return id prefixed to name in array
 * @param planet_id
 * @returns {string}
 */
lp_planet.add_planet_prefix = function(planet_id) {
    var id_string = planet_id.toString();
    if (id_string.substring(0,2) !== "pl") {
        return "pl_"+id_string;
    }
    else {
        return id_string;
    }
};

/**
 * Return id prefixed to name in array
 * @param planet_id
 * @returns {string}
 */
lp_planet.remove_planet_prefix = function(planet_id) {
     if (planet_id.substring(0,2) === "pl") {
         return parseInt(planet_id.substring(3));
     }
     return parseInt(planet_id);
};

/**
 * Add measure between objects
 * @param source_id
 * @param target_id
 */
lp_planet.add_measure = function(source_id, target_id) {
    var source = lp_planet.planet_data[source_id];
    var target = lp_planet.planet_data[target_id];

    lp_planet.measure_source_id = source_id;
    lp_planet.measure_target_id = target_id;

    if (lp_planet.measure === undefined) {
        // add line
        lp_planet.measure = new Konva.Line({
            points: [source.actual_x, source.actual_y, target.actual_x, target.actual_y],
            stroke: 'white',
            tension: 1,
            dash: [4, 5]
        });
        lp_space.add_to_space(lp_planet.measure);
        lp_planet._add_text_measure(source, target);

    } else {
        // update line
        lp_planet.measure.points([source.actual_x, source.actual_y, target.actual_x, target.actual_y]);
        // update text to line
        lp_planet.measure_title.destroy();
        lp_planet._add_text_measure(source, target);
    }
    lp_space.draw();
};

/**
 * Add text to line of measure
 * @param source object
 * @param target object
 * @private
 */
lp_planet._add_text_measure = function(source, target) {
    var measured_distance = lp_planet.get_distance_from_measure();

    x1 = ((source.actual_x+target.actual_x)/2);
    y1  = ((source.actual_y+target.actual_y)/2);

    var multiplier = 1;
    if (source.actual_y<target.actual_y && source.actual_x>target.actual_x) {
        multiplier = -1;
    }
    if (source.actual_y>target.actual_y && source.actual_x<target.actual_x) {
        multiplier = -1;
    }

    lp_planet.measure_title = new Konva.Text({
        x: x1,
        y: y1,
        text: measured_distance["distance"]+" MaPr",
        rotation: multiplier*(measured_distance["angle"]),
        fontSize: Math.round(14*lp_space.scale_width),
        fontFamily: 'Calibri',
        fill: 'white'
    });

    lp_space.add_to_space(lp_planet.measure_title);
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

        var source_x2 = lp_planet.planet_data[lp_planet.measure_source_id].actual_x;
        var source_y2 = lp_planet.planet_data[lp_planet.measure_source_id].actual_y;
        var target_x2 = lp_planet.planet_data[lp_planet.measure_target_id].actual_x;
        var target_y2 = lp_planet.planet_data[lp_planet.measure_target_id].actual_y;

        var a = Math.abs((source_x)-(target_x));
        var b = Math.abs((source_y)-(target_y));
        var c = Math.abs(Math.sqrt(Math.pow(a,2)+Math.pow(b,2)));

        // Because of ange it depend on size
        var a2 = Math.abs((source_x2)-(target_x2));
        var b2 = Math.abs((source_y2)-(target_y2));
        var c2 = Math.round(Math.abs(Math.sqrt(Math.pow(a2,2)+Math.pow(b2,2))));

        var angle = Math.round(180-90-(Math.asin(a2/c2)* (180/Math.PI)));

        var hour_constant = lp_space.basic_width/75; // 75 hour to all space
        var time_to_flight = Math.round(c/hour_constant); // time in hour
        return {"distance": Math.round(c)*100, "angle": angle, "time_to_fligh": time_to_flight, "real_distance": c};
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
        lp_planet.measure_title.destroy();
        lp_planet.measure_title = undefined;
        lp_planet.measure_source_id = undefined;
        lp_planet.measure_target_id = undefined;
    }
    lp_space.draw();
};

/**
 * Display flight counter
 * @param counter
 */
lp_planet.display_counter_time = function(counter) {

    var displayed_counter = "zbývá "+counter.toFixed(3)+" s";

    if (lp_planet.flight_counter!== undefined) {
        lp_planet.flight_counter.text(displayed_counter );
    } else {
        lp_planet.flight_counter = new Konva.Text({
            x: 0,
            y: 5*lp_space.scale_height,
            text: displayed_counter,
            fontSize: Math.round(40*lp_space.scale_width),
            width: lp_space.screen_width,
            fontFamily: 'Calibri',
            opacity: 0.5,
            fill: 'white',
            align: 'right'
        });

    lp_pilot._avatar_layer.add(lp_planet.flight_counter);
    }

    lp_pilot._avatar_layer.draw();
};

/**
 * Hide flight counter
 * @param counter
 */
lp_planet.hide_counter_time = function() {
    if (lp_planet.flight_counter!== undefined) {
        lp_planet.flight_counter.destroy();
        lp_planet.flight_counter = undefined;
        lp_pilot._avatar_layer.draw();
    }
};
