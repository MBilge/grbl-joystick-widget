/* global requirejs cprequire cpdefine chilipeppr THREE */
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
        url: "(auto fill by runme.js)",       // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)",   // The standalone working widget so can view it working by itself

        publish: {
              
        },
        subscribe: {
          
        },
        foreignPublish: {
            "/com-chilipeppr-widget-serialport/send" : "We send to the serial port certain commands like the initial configuration commands for the GRBL to be in the correct mode and to get initial statuses like planner buffers and XYZ coords. We also send the Emergency Stop and Resume of ! and ~"
        },
        foreignSubscribe: {
            "/com-chilipeppr-interface-cnccontroller/status" : "status check before send commands",
            "/com-chilipeppr-widget-serialport/recvline" : "When we get a dataline from serialport, process it and fire off generic CNC controller signals to the /com-chilipeppr-interface-cnccontroller channel.",
            "/com-chilipeppr-widget-serialport/send" : "Subscribe to serial send and override so no other subscriptions receive command."
        },
       
        /**
         * All widgets should have an init method. It should be run by the
         * instantiating code like a workspace or a different widget.
         */
        
        status : '',
         
        init: function() {
           

            this.setupUiFromLocalStorage();
            this.btnSetup();
            this.forkSetup();
            
            
            // chilipeppr.subscribe('/com-chilipeppr-widget-serialport/onBroadcast', this, this.onBroadcast);
            
            // chilipeppr.subscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.checkRecvLine);
                
            
            // chilipeppr.subscribe('/com-chilipeppr-interface-cnccontroller/status', this, function(status){
            //    this.status = status;
            //    });
            
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvline", this, this.checkResponse);
            
         //  $('#' + this.id + ' .panel-body').html("");
        },

        unSubscribeReceive : function(){
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.checkRecvLine);
        },
        subscribeReceive : function(){
         
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.checkRecvLine);   
            
        },
        
        checkResponse : function(recvline){
          
            if (!(recvline.dataline) || recvline.dataline == '\n') {
                return true;
            }
            
            var reg = new RegExp("\\|Bf:([0-9]+),([0-9]+)\\|","i");
            var result = reg.exec(recvline.dataline);
            if (result){
                // Bf:15,128 // planner buffer - serial rx buffer
                this.availableBuffer = parseInt(result[2]);
                console.log("JOG: buffer size: ", this.availableBuffer);
            }
            if(recvline.dataline.substring(0,2) == "ok"){
                this.doQueue();
            }
        },
        doQueue: function(){
            if(this.jogQueue.length > 0){
                if(this.availableBuffer > this.jogQueue[0].length + 1){
                    var cmd = this.jogQueue.shift();
                    this.sendCode(cmd);
                    this.availableBuffer -= cmd.length;
                    console.log("JOG: send code: ",cmd, cmd.length,  this.availableBuffer );
                }
            }
        },
        availableBuffer: 0,
        
        jogQueue : [],
        
        jogCancel : false,
        
        checkRecvLine: function(recvline){
            
            var status = new RegExp("{x: ([0-9]+), y: ([0-9]+)}", "i");
            var result = status.exec(recvline); 
            
            if (!result) return;
                        
            var moves = "";
            var range = [470,530]; 
            var x = result[1];
            var y = result[2];
            var invertX =  $("#invertX").is(':checked') ;
            var invertY =  $("#invertY").is(':checked') ;
            
            
            var m = $("#joystick-m").val();
            var feedrate = $("#feedrate-m").val();
        
             
            if (x < range[0]){
                moves += 'X'+( invertX ? '' : '-' ) + m;
            } 
            else if (x > range[1]){
                moves += 'X' +( invertX ? '-' : '' ) + m;
            }
            
            if (y < range[0]){
                moves += 'Y'+ ( invertY ? '-' : '') + m;
            }
            else if ( y > range[1]){
                moves += 'Y'+ ( invertY ? '' : '-') +m;
            }
        
            // jog is in stand-by position
            if ( x >= range[0] && x <= range[1] && y >= range[0] && y <= range[1]){
                // send only one jog cancel command
              //  if (!jogCancel){
                    this.cancelJog();
                //    jogCancel = true;
            //    }
            }
            
            
            if (moves != ''){ //  && this.status == 'Idle'){
                var cmd = '$J=G91'+moves+'F'+feedrate+'\n';
                this.jogQueue.push(cmd);
                this.doQueue();
                // this.sendCode(cmd);
                // jogCancel = false;
            }
            
        },
        cancelJog: function(){
            this.sendCode('\x85'+'\n');
            // we should send also the % command?
            // chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", this.name,"Jog Cancel Sent" + that.id, 1000);
        },
        sendCode: function(code){
            
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", code);
            
        },
        
        btnSetup: function() {

            var that = this;
            $('#' + this.id + ' .hidebody').click(function(evt) {
                console.log("hide/unhide body");
                if ($('#' + that.id + ' .panel-body').hasClass('hidden')) {
                    // it's hidden, unhide
                    that.showBody(evt);
                }
                else {
                    // hide
                    that.hideBody(evt);
                }
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

            $('#' + this.id + ' .btn-cancel-jog').click(function() {
               this.cancelJog();
            });

            $('#' + this.id + ' .joystick-activate').click(function() {
               
               if ($(this).hasClass("active") ){
                   $(this).removeClass("active");
                   that.unSubscribeReceive();
               }
               else{
                   $(this).addClass("active");
                   that.subscribeReceive();
               }
                
            });
            // Init Hello World 2 button on Tab 1. Notice the use
            // of the slick .bind(this) technique to correctly set "this"
            // when the callback is called
            $('#' + this.id + ' .btn-helloworld2').click(this.onHelloBtnClick.bind(this));

        },
        /**
         * onHelloBtnClick is an example of a button click event callback
         */
        onHelloBtnClick: function(evt) {
            console.log("saying hello 2 from btn in tab 1");
            chilipeppr.publish(
                '/com-chilipeppr-elem-flashmsg/flashmsg',
                "Hello 2 Title",
                "Hello World 2 from Tab 1 from widget " + this.id,
                2000 /* show for 2 second */
            );
        },
        /**
         * User options are available in this property for reference by your
         * methods. If any change is made on these options, please call
         * saveOptionsLocalStorage()
         */
        options: null,
        /**
         * Call this method on init to setup the UI by reading the user's
         * stored settings from localStorage and then adjust the UI to reflect
         * what the user wants.
         */
        setupUiFromLocalStorage: function() {

            // Read vals from localStorage. Make sure to use a unique
            // key specific to this widget so as not to overwrite other
            // widgets' options. By using this.id as the prefix of the
            // key we're safe that this will be unique.

            // Feel free to add your own keys inside the options 
            // object for your own items

            var options = localStorage.getItem(this.id + '-options');

            if (options) {
                options = $.parseJSON(options);
                console.log("just evaled options: ", options);
            }
            else {
                options = {
                    showBody: true,
                    tabShowing: 1,
                    customParam1: null,
                    customParam2: 1.0
                };
            }

            this.options = options;
            console.log("options:", options);

            // show/hide body
            if (options.showBody) {
                this.showBody();
            }
            else {
                this.hideBody();
            }

        },
        /**
         * When a user changes a value that is stored as an option setting, you
         * should call this method immediately so that on next load the value
         * is correctly set.
         */
        saveOptionsLocalStorage: function() {
            // You can add your own values to this.options to store them
            // along with some of the normal stuff like showBody
            var options = this.options;

            var optionsStr = JSON.stringify(options);
            console.log("saving options:", options, "json.stringify:", optionsStr);
            // store settings to localStorage
            localStorage.setItem(this.id + '-options', optionsStr);
        },
        /**
         * Show the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        showBody: function(evt) {
            $('#' + this.id + ' .panel-body').removeClass('hidden');
            $('#' + this.id + ' .panel-footer').removeClass('hidden');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-down');
            if (!(evt == null)) {
                this.options.showBody = true;
                this.saveOptionsLocalStorage();
            }
            // this will send an artificial event letting other widgets know to resize
            // themselves since this widget is now taking up more room since it's showing
            $(window).trigger("resize");
        },
        /**
         * Hide the body of the panel.
         * @param {jquery_event} evt - If you pass the event parameter in, we 
         * know it was clicked by the user and thus we store it for the next 
         * load so we can reset the user's preference. If you don't pass this 
         * value in we don't store the preference because it was likely code 
         * that sent in the param.
         */
        hideBody: function(evt) {
            $('#' + this.id + ' .panel-body').addClass('hidden');
            $('#' + this.id + ' .panel-footer').addClass('hidden');
            $('#' + this.id + ' .hidebody span').removeClass('glyphicon-chevron-up');
            $('#' + this.id + ' .hidebody span').addClass('glyphicon-chevron-down');
            if (!(evt == null)) {
                this.options.showBody = false;
                this.saveOptionsLocalStorage();
            }
            // this will send an artificial event letting other widgets know to resize
            // themselves since this widget is now taking up less room since it's hiding
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

    }
});