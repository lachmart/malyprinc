var lp_action = function () {};

lp_action.url = "https://malyprincolomouc.cz";
/*
    Main action to open logbook
 */
lp_action.go_to_deck_logbook = function() {
    if (!lp_space.is_displayed_activity()) {
        if (typeof(Storage) !== "undefined") {
            if  ((localStorage.getItem(lp_pilot.data.id+"help") === null) &&
                (lp_pilot.is_on_planet() && lp_planet.planet_data[lp_pilot.get_pilot_position()].type === "earth") ) {

                lp_space.messagebox("Než koukneš do deníku. Klikni na pilota a prozkoumej aktivitu (složka) na planetě. Jinde ji nenajdeš!");
                localStorage.setItem(lp_pilot.data.id+"help", "1");
                return;
            }
        }
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

    lp_space.stage.destroy();

    lp_space.vars();
    lp_pilot.vars();
    lp_planet.vars();

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