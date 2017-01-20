/* global requirejs $ cprequire cprequire_test cpdefine chilipeppr THREE */
// Defining the globals above helps Cloud9 not show warnings for those variables

// ChiliPeppr Widget/Element Javascript

requirejs.config({

    paths: {
        // Example of how to define the key (you make up the key) and the URL
        // Make sure you DO NOT put the .js at the end of the URL
        // SmoothieCharts: '//smoothiecharts.org/smoothie',
    },
    shim: {
        // See require.js docs for how to define dependencies that
        // should be loaded before your script/widget.
    }
});

cprequire_test(["inline:com-chilipeppr-grbl-joystick"], function(myWidget) {

    // Test this element. This code is auto-removed by the chilipeppr.load()
    // when using this widget in production. So use the cpquire_test to do things
    // you only want to have happen during testing, like loading other widgets or
    // doing unit tests. Don't remove end_test at the end or auto-remove will fail.

    // Please note that if you are working on multiple widgets at the same time
    // you may need to use the ?forcerefresh=true technique in the URL of
    // your test widget to force the underlying chilipeppr.load() statements
    // to referesh the cache. For example, if you are working on an Add-On
    // widget to the Eagle BRD widget, but also working on the Eagle BRD widget
    // at the same time you will have to make ample use of this technique to
    // get changes to load correctly. If you keep wondering why you're not seeing
    // your changes, try ?forcerefresh=true as a get parameter in your URL.

    console.log("test running of " + myWidget.id);

    $('body').prepend('<div id="testDivForFlashMessageWidget"></div>');

    chilipeppr.load(
        "#testDivForFlashMessageWidget",
        "http://fiddle.jshell.net/chilipeppr/90698kax/show/light/",
        function() {
            console.log("mycallback got called after loading flash msg module");
            cprequire(["inline:com-chilipeppr-elem-flashmsg"], function(fm) {
                //console.log("inside require of " + fm.id);
                fm.init();
            });
        }
    );

    // init my widget
    myWidget.init();
    $('#' + myWidget.id).css('margin', '20px');
    $('title').html(myWidget.name);

} /*end_test*/ );

// This is the main definition of your widget. Give it a unique name.
cpdefine("inline:com-chilipeppr-grbl-joystick", ["chilipeppr_ready", /* other dependencies here */ ], function() {
    return {

        id: "com-chilipeppr-grbl-joystick", // Make the id the same as the cpdefine id
        name: "GRBL Joystick", // The descriptive name of your widget.
        desc: "It's a Joystick... :-)", // A description of what your widget does
        url: "(auto fill by runme.js)", // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)", // The standalone working widget so can view it working by itself

        publish: {

        },
        subscribe: {

        },
        foreignPublish: {
            "/com-chilipeppr-widget-serialport/send": "We send to the serial port certain commands like the initial configuration commands for the GRBL to be in the correct mode and to get initial statuses like planner buffers and XYZ coords. We also send the Emergency Stop and Resume of ! and ~"
        },
        foreignSubscribe: {
            "/com-chilipeppr-interface-cnccontroller/status": "status check before send commands",
            "/com-chilipeppr-widget-serialport/recvline": "When we get a dataline from serialport, process it and fire off generic CNC controller signals to the /com-chilipeppr-interface-cnccontroller channel.",
            "/com-chilipeppr-widget-serialport/send": "Subscribe to serial send and override so no other subscriptions receive command."
        },

        /**
         * All widgets should have an init method. It should be run by the
         * instantiating code like a workspace or a different widget.
         */


        active: false,

        init: function() {


            // this.setupUiFromLocalStorage();
            this.btnSetup();
            this.forkSetup();


            // chilipeppr.subscribe('/com-chilipeppr-widget-serialport/onBroadcast', this, this.onBroadcast);

            // chilipeppr.subscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.checkRecvLine);


            chilipeppr.subscribe('/com-chilipeppr-interface-cnccontroller/status', this, function(status) {


                this.status = status;
                if (status == 'Jog' && this.counter == 0) {
                    // machine is moving and it's wrong. Send cancel jog command
                    this.cancelJog();

                }
                if (status == 'Run') {

                    this.active = false;
                }
                else {
                    this.active = true;
                }

            });

            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvline", this, this.checkResponse);
            this.hideBody();

        },

        unSubscribeReceive: function() {
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.checkRecvLine);
            this.active = false;
        },
        subscribeReceive: function() {

            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.checkRecvLine);
            this.active = true;

        },

        checkResponse: function(recvline) {


            if (!(recvline.dataline) || recvline.dataline == '\n' || !this.active) {
                return true;
            }
            
            var reg = new RegExp("\\|Bf:([0-9]+),([0-9]+)\\|","i");   // Bf:15,128 // planner buffer - serial rx buffer
            var result = reg.exec(recvline.dataline);
            if (result){
                this.plannerBuffer = parseInt(result[1],10);
            }
            if (recvline.dataline.substring(0, 2) == "ok") {
                this.doQueue();
            }
        },
        doQueue: function() {
            if (this.jogQueue.length > 0) {
                if(this.plannerBuffer > 1){
                    var cmd = this.jogQueue.shift();
                    this.sendCode(cmd);
                }
            }
        },
        availableBuffer: 0,
        plannerBuffer : 15, // Setting this as empty : 15 free blocks 
        jogQueue: [],

        gCodeMove : 'G91',
        
        jogCancel: false,

        cmdCounter: 0,

        calcDistance : function(v){  // f = current value from joystick
            
         
            // dt : estimated execution time of a single jog command in seconds. min > 10ms
            var dt = 0.04;      // 40 ms
            
            // calculate dt 
            // var dt =  (v * v) / 2 * 10 * 14;
            
            // s : incremental distance of jog command in mm
            var s = (v/60) * dt;
            
            
            return  s.toFixed(3);
        },
        
        regexLine: new RegExp("jog:([0-9-]+):([0-9-]+)", "i"),
         
        coords : {
                "x": {
                    "dir": 0,
                    "invert": false,
                    "increment": 0.000,
                    "feedrate" : 0
                },
                "y": {
                    "dir": 0,
                    "invert": false,
                    "increment": 0.000,
                    "feedrate" : 0
                },
                "z": {
                    "dir": 0,
                    "invert": false,
                    "increment": 0.000,
                    "feedrate" : 0
                },
        },

        incX : 0.000,
        incY : 0.000,
        
        checkRecvLine: function(recvline) {

            var result = this.regexLine.exec(recvline);
            if (!result) return;
            this.coords.x.dir = parseInt(result[1],10);
            this.coords.y.dir = parseInt(result[2],10);
            this.coords.z.dir = parseInt(result[2],10);
           
            if (this.coords.x.dir == 0 && this.coords.y.dir == 0) {
                this.cancelJog();
                return;
            }
            var jx = result[1];
            var jy = result[2];
            var jz = result[3];

            var moves = "";
            var maxFeedRate = 1000;
            
            var zPlane = $('#' + this.id + ' .z-plane').hasClass('active');

            if (jx != 0){
                
                var fx = parseInt( (Math.abs(jx) * maxFeedRate) / 255 , 10);
                this.incX += parseFloat(this.calcDistance( fx / 60));
                
                moves += 'X'+ ( jx < 0 ? '-' : '') + this.incX;
            }
            
            
            if (jy != 0){
                
                var fy = parseInt( (Math.abs(jy) * maxFeedRate / 255), 10);
                this.incY += parseFloat(this.calcDistance( fy / 60));
                moves +=  'Y' + ( jx < 0 ? '-' : '') + this.incY;
            }
            
        
        
            /*
            var feedrate = '';
            var that = this;


            $.each(that.coords, function(i, c) {

                var axis = zPlane ? 'Z' : i.toUpperCase();

                if (zPlane) {
                    if (i == 'x' || i == 'y') return true;
                    
                }
                else {
                    // exit if we are moving xy
                    if (i == 'z') return true;
                }

                var barWidth = (100 * Math.abs(c.dir) / 255);
                var barClass = 'progress-bar-info';


                /*
                switch (true) {
                    case (barWidth > 33 && barWidth <= 66):
                        c.increment = '0.1';
                        c.feedrate = '90';
                        barClass = 'progress-bar-success';

                        break;
                    case (barWidth > 66 && barWidth < 95):
                        c.increment = '1';
                        c.feedrate = '190';
                        barClass = 'progress-bar-warning';

                        break;
                    case (barWidth >= 95):
                        c.increment = '3';
                        c.feedrate = '650';
                        
                        barClass = 'progress-bar-danger';
                        
                        if (that.cmdCounter >= 5) {

                            c.increment = '5';
                            c.feedrate = '1000';
                        }
                        
                        if (that.cmdCounter >= 15) {

                            c.increment = '10';
                            c.feedrate = '1500';
                        }
                    break;
                    default:
                        c.increment = '0.05';
                        c.feedrate = '50';
                }
                
                */
                
               /* c.feedrate =  ((Math.abs(c.dir) * maxFeedRate) / 255).toFixed(3);
                c.increment += parseFloat(that.calcDistance(c.feedrate).toFixed(3));

                
                if (c.dir < 0) {
                    moves += axis + (c.invert ? '' : '-') + c.increment;
                    $('.' + i + '-bar-container .bar-neg').width(barWidth + '%').removeClass().addClass('progress-bar bar-neg ' + barClass).html(c.increment +' F'+c.feedrate);
                }
                else if (c.dir > 0) {

                    moves += axis + (c.invert ? '-' : '') + c.increment;
                    $('.' + i + '-bar-container .bar-pos').width(barWidth + '%').removeClass().addClass('progress-bar bar-pos ' + barClass).html(c.increment +' F'+c.feedrate);
                }
            });

            // Whit two different feedrates for axis send command with the greater value
            feedrate = (Math.abs(this.coords.x.dir) >= Math.abs(this.coords.y.dir)) ? this.coords.x.feedrate : this.coords.y.feedrate;
            
            */
             // maxFeedRate : mm/min value for the max jog feed rate
           // var maxFeedRate = 1000; 

            // v : current jog feed rate in mm/sec, not mm/min. Less than or equal to max jog rate.
        //     feedrate =  (Math.abs(feedrate) * maxFeedRate) / 255;
            // var v =  f / 60;
            
            var feedrate = Math.abs(jx) >= Math.abs(jx) ? fx : fy;
            

            if (moves != '') {

                this.cmdCounter++;
                var cmd = '$J='+ this.gCodeMove + moves + 'F' + feedrate + '\n';
                
                if (this.plannerBuffer > 1){
                    // direct send only if planner has free spaces
                    this.sendCode(cmd);
                }
                else{
                    this.jogQueue.push(cmd);
                    this.doQueue();
                }
            }
            // }
        },
        cancelJog: function() {

            this.jogQueue = [];
            this.sendCode('\x85');
            this.incX = 0;
            this.incY = 0;
            // we should send also the % command?
            // this.sendCode('%'+'\n');
            // chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", this.name,"Jog Cancel Sent" + that.id, 1000);
            
            $(".bar-pos").width(0).removeClass().addClass('progress-bar bar-pos').html('');
            $(".bar-neg").width(0).removeClass().addClass('progress-bar bar-neg').html('');

            this.cmdCounter = 0;
        },
        sendCode: function(code) {

            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", code);

        },
        invert: {
            "xaxis-class": {
                "normal": "glyphicon glyphicon-circle-arrow-right",
                "invert": "glyphicon glyphicon-circle-arrow-left"
            },
            "yaxis-class": {
                "normal": "glyphicon glyphicon-circle-arrow-up",
                "invert": "glyphicon glyphicon-circle-arrow-down"
            },
            "xaxis": false,
            "yaxis": false,
            "zaxis": false
        },

        btnSetup: function() {
            var that = this;
            $('#' + this.id + ' .hidebody').click(function(evt) {
                console.log("hide/unhide body");
                if ($('#' + that.id + ' .panel-body').hasClass('hidden')) {
                    // it's hidden, unhide
                    that.showBody(evt);
                    that.subscribeReceive();
                }
                else {
                    // hide
                    that.hideBody(evt);
                    that.unSubscribeReceive();
                }
            });
            $('#' + this.id + ' .invert-chk').click(function() {
                var axis = $(this).data("axis");
                that.invert[axis + 'axis'] = $(this).is(":checked");

            });
            $('#' + this.id + ' .z-plane').click(function() {

                if (!$(this).hasClass('active')) {
                    $(this).addClass('active');
                    $('.xy-plane').removeClass('active');
                    $('.y-bar-container .axis').html('Z');
                    $('.x-bar-container').hide();
                }
                else {
                    $(this).removeClass('active');
                    $('.x-bar-container').show();
                    $('.y-bar-container .axis').html('Y');
                }

            });

            $('#' + this.id + ' .xy-plane').click(function() {

                if (!$(this).hasClass('active')) {
                    $(this).addClass('active');
                    $('.z-plane').removeClass('active');
                    $('.x-bar-container').show();
                    $('.y-bar-container .axis').html('Y');
                }
                else {
                    $(this).removeClass('active');
                    $('.y-bar-container .axis').html('Z');
                    $('.x-bar-container').hide();
                }
            });

            $('#' + this.id + ' .show-settings').click(function() {
                $('.settings').toggle();
            });
            // Ask bootstrap to scan all the buttons in the widget to turn
            // on popover menus
            $('#' + this.id + ' .btn').popover({
                delay: 1000,
                animation: true,
                placement: "auto",
                trigger: "hover",
                container: 'body'
            });
        },

        showBody: function(evt) {
            $('#' + this.id + ' .panel-body').removeClass('hidden');
            $('#' + this.id + ' .panel-footer').removeClass('hidden');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-down');
            $('#' + this.id + ' .btn-to-hide' ).removeClass('hidden');
            $(window).trigger("resize");
        },

        hideBody: function(evt) {
            $('#' + this.id + ' .panel-body').addClass('hidden');
            $('#' + this.id + ' .panel-footer').addClass('hidden');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-down');
            $('#' + this.id + ' .btn-to-hide' ).addClass('hidden');
            $(window).trigger("resize");
        },
        /**
         * This method loads the pubsubviewer widget which attaches to our 
         * upper right corner triangle menu and generates 3 menu items like
         * Pubsub Viewer, View Standalone, and Fork Widget. It also enables
         * the modal dialog that shows the documentation for this widget.
         * 
         * By using chilipeppr.load() we can ensure that the pubsubviewer widget
         * is only loaded and inlined once into the final ChiliPeppr workspace.
         * We are given back a reference to the instantiated singleton so its
         * not instantiated more than once. Then we call it's attachTo method
         * which creates the full pulldown menu for us and attaches the click
         * events.
         */
        forkSetup: function() {
            var topCssSelector = '#' + this.id;

            $(topCssSelector + ' .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 1000,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });

            var that = this;
            chilipeppr.load("http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/", function() {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {
                    pubsubviewer.attachTo($(topCssSelector + ' .panel-heading .dropdown-menu'), that);
                });
            });

        },

    };
});
