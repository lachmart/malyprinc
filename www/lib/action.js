var lp_action = function () {};

lp_action.url = "https://malyprincolomouc.cz";
/*
    Main action to open logbook
 */
lp_action.go_to_deck_logbook = function() {
    if (!lp_space.is_displayed_activity()) {
        location.href = lp_action.url+"/denik/";
    }
};

lp_action.go_to_live_support_system = function() {
    location.href = lp_action.url+"/denik/zivot";
};

/**
 * Reinit space based on resize event
 */
lp_action.on_resize = function() {

    // TODO refactor to functions
    lp_space.stage.destroy();

    lp_space.stage = undefined;
    lp_space._layer = undefined;
    lp_space._dialog_layer = undefined;
    lp_space._area = undefined;
    lp_space._earth = undefined;
    lp_space._activity_dialog = undefined;
    lp_space._messagebox = undefined;
    lp_space._cover = undefined;
    lp_space._text_object = undefined;

    lp_planet.earth = undefined;
    lp_planet.planets = {};
    lp_planet.planet_data = {};
    lp_planet.measure = undefined;
    lp_planet.measure_title = undefined;
    lp_planet.measure_source_id = undefined;
    lp_planet.measure_target_id = undefined;
    lp_planet.flight_counter = undefined;

    lp_pilot._avatar_layer = undefined;
    lp_pilot.data = undefined;
    lp_pilot.avatar = undefined;
    lp_pilot.tooltip = undefined;
    lp_pilot._flight = undefined;
    lp_pilot.flight_tooltip = undefined;
    lp_pilot.dialog = undefined;
    lp_pilot.counter = 10000;
    lp_pilot._start_button = undefined;
    lp_pilot._stop = false;
    lp_pilot.counter_title = undefined;
    lp_pilot._internal_blur = 5;

    lp_space.init();
};


// https://www.w3schools.com/howto/howto_js_fullscreen.asp
/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

/* View in fullscreen */
lp_action.openFullscreen = function() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
};

// Main onload initialization
window.addEventListener("load", function(){
    lp_space.init();
});

/*window.addEventListener("resize", function(){
    lp_action.on_resize();
});*/