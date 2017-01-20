# com-chilipeppr-grbl-joystick
It's a Joystick... :-)

![alt text](screenshot.png "Screenshot")

## ChiliPeppr GRBL Joystick

All ChiliPeppr widgets/elements are defined using cpdefine() which is a method
that mimics require.js. Each defined object must have a unique ID so it does
not conflict with other ChiliPeppr widgets.

| Item                  | Value           |
| -------------         | ------------- | 
| ID                    | com-chilipeppr-grbl-joystick |
| Name                  | GRBL Joystick |
| Description           | It's a Joystick... :-) |
| chilipeppr.load() URL | http://raw.githubusercontent.com/lunix80/grbl-joystick-widget/master/auto-generated-widget.html |
| Edit URL              | http://ide.c9.io/lunix80/grbl-joystick-widget |
| Github URL            | http://github.com/lunix80/grbl-joystick-widget |
| Test URL              | https://preview.c9users.io/lunix80/grbl-joystick-widget/widget.html |

## Example Code for chilipeppr.load() Statement

You can use the code below as a starting point for instantiating this widget 
inside a workspace or from another widget. The key is that you need to load 
your widget inlined into a div so the DOM can parse your HTML, CSS, and 
Javascript. Then you use cprequire() to find your widget's Javascript and get 
back the instance of it.

```javascript
// Inject new div to contain widget or use an existing div with an ID
$("body").append('<' + 'div id="myDivGrblJoystick"><' + '/div>');

chilipeppr.load(
  "#myDivGrblJoystick",
  "http://raw.githubusercontent.com/lunix80/grbl-joystick-widget/master/auto-generated-widget.html",
  function() {
    // Callback after widget loaded into #myDivGrblJoystick
    // Now use require.js to get reference to instantiated widget
    cprequire(
      ["inline:com-chilipeppr-grbl-joystick"], // the id you gave your widget
      function(myObjGrblJoystick) {
        // Callback that is passed reference to the newly loaded widget
        console.log("GRBL Joystick just got loaded.", myObjGrblJoystick);
        myObjGrblJoystick.init();
      }
    );
  }
);

```

## Publish

This widget/element publishes the following signals. These signals are owned by this widget/element and are published to all objects inside the ChiliPeppr environment that listen to them via the 
chilipeppr.subscribe(signal, callback) method. 
To better understand how ChiliPeppr's subscribe() method works see amplify.js's documentation at http://amplifyjs.com/api/pubsub/

  <table id="com-chilipeppr-elem-pubsubviewer-pub" class="table table-bordered table-striped">
      <thead>
          <tr>
              <th style="">Signal</th>
              <th style="">Description</th>
          </tr>
      </thead>
      <tbody>
      <tr><td colspan="2">(No signals defined in this widget/element)</td></tr>    
      </tbody>
  </table>

## Subscribe

This widget/element subscribes to the following signals. These signals are owned by this widget/element. Other objects inside the ChiliPeppr environment can publish to these signals via the chilipeppr.publish(signal, data) method. 
To better understand how ChiliPeppr's publish() method works see amplify.js's documentation at http://amplifyjs.com/api/pubsub/

  <table id="com-chilipeppr-elem-pubsubviewer-sub" class="table table-bordered table-striped">
      <thead>
          <tr>
              <th style="">Signal</th>
              <th style="">Description</th>
          </tr>
      </thead>
      <tbody>
      <tr><td colspan="2">(No signals defined in this widget/element)</td></tr>    
      </tbody>
  </table>

## Foreign Publish

This widget/element publishes to the following signals that are owned by other objects. 
To better understand how ChiliPeppr's subscribe() method works see amplify.js's documentation at http://amplifyjs.com/api/pubsub/

  <table id="com-chilipeppr-elem-pubsubviewer-foreignpub" class="table table-bordered table-striped">
      <thead>
          <tr>
              <th style="">Signal</th>
              <th style="">Description</th>
          </tr>
      </thead>
      <tbody>
      <tr valign="top"><td>/com-chilipeppr-grbl-joystick/com-chilipeppr-widget-serialport/send</td><td>We send to the serial port certain commands like the initial configuration commands for the GRBL to be in the correct mode and to get initial statuses like planner buffers and XYZ coords. We also send the Emergency Stop and Resume of ! and ~</td></tr>    
      </tbody>
  </table>

## Foreign Subscribe

This widget/element publishes to the following signals that are owned by other objects.
To better understand how ChiliPeppr's publish() method works see amplify.js's documentation at http://amplifyjs.com/api/pubsub/

  <table id="com-chilipeppr-elem-pubsubviewer-foreignsub" class="table table-bordered table-striped">
      <thead>
          <tr>
              <th style="">Signal</th>
              <th style="">Description</th>
          </tr>
      </thead>
      <tbody>
      <tr valign="top"><td>/com-chilipeppr-grbl-joystick/com-chilipeppr-interface-cnccontroller/status</td><td>status check before send commands</td></tr><tr valign="top"><td>/com-chilipeppr-grbl-joystick/com-chilipeppr-widget-serialport/recvline</td><td>When we get a dataline from serialport, process it and fire off generic CNC controller signals to the /com-chilipeppr-interface-cnccontroller channel.</td></tr><tr valign="top"><td>/com-chilipeppr-grbl-joystick/com-chilipeppr-widget-serialport/send</td><td>Subscribe to serial send and override so no other subscriptions receive command.</td></tr>    
      </tbody>
  </table>

## Methods / Properties

The table below shows, in order, the methods and properties inside the widget/element.

  <table id="com-chilipeppr-elem-methodsprops" class="table table-bordered table-striped">
      <thead>
          <tr>
              <th style="">Method / Property</th>
              <th>Type</th>
              <th style="">Description</th>
          </tr>
      </thead>
      <tbody>
      <tr valign="top"><td>id</td><td>string</td><td>"com-chilipeppr-grbl-joystick"</td></tr><tr valign="top"><td>name</td><td>string</td><td>"GRBL Joystick"</td></tr><tr valign="top"><td>desc</td><td>string</td><td>"It's a Joystick... :-)"</td></tr><tr valign="top"><td>url</td><td>string</td><td>"http://raw.githubusercontent.com/lunix80/grbl-joystick-widget/master/auto-generated-widget.html"</td></tr><tr valign="top"><td>fiddleurl</td><td>string</td><td>"http://ide.c9.io/lunix80/grbl-joystick-widget"</td></tr><tr valign="top"><td>githuburl</td><td>string</td><td>"http://github.com/lunix80/grbl-joystick-widget"</td></tr><tr valign="top"><td>testurl</td><td>string</td><td>"http://grbl-joystick-widget-lunix80.c9users.io/widget.html"</td></tr><tr valign="top"><td>publish</td><td>object</td><td>Please see docs above.</td></tr><tr valign="top"><td>subscribe</td><td>object</td><td>Please see docs above.</td></tr><tr valign="top"><td>foreignPublish</td><td>object</td><td>Please see docs above.</td></tr><tr valign="top"><td>foreignSubscribe</td><td>object</td><td>Please see docs above.</td></tr><tr valign="top"><td>active</td><td>boolean</td><td>All widgets should have an init method. It should be run by the
instantiating code like a workspace or a different widget.</td></tr><tr valign="top"><td>init</td><td>function</td><td>function () </td></tr><tr valign="top"><td>unSubscribeReceive</td><td>function</td><td>function () </td></tr><tr valign="top"><td>subscribeReceive</td><td>function</td><td>function () </td></tr><tr valign="top"><td>checkResponse</td><td>function</td><td>function (recvline) </td></tr><tr valign="top"><td>doQueue</td><td>function</td><td>function () </td></tr><tr valign="top"><td>availableBuffer</td><td>number</td><td></td></tr><tr valign="top"><td>plannerBuffer</td><td>number</td><td></td></tr><tr valign="top"><td>jogQueue</td><td>object</td><td></td></tr><tr valign="top"><td>gCodeMove</td><td>string</td><td>"G91"</td></tr><tr valign="top"><td>jogCancel</td><td>boolean</td><td></td></tr><tr valign="top"><td>cmdCounter</td><td>number</td><td></td></tr><tr valign="top"><td>calcDistance</td><td>function</td><td>function (v)  // f = current value from joystick</td></tr><tr valign="top"><td>regexLine</td><td>object</td><td></td></tr><tr valign="top"><td>checkRecvLine</td><td>function</td><td>function (recvline) </td></tr><tr valign="top"><td>cancelJog</td><td>function</td><td>function () </td></tr><tr valign="top"><td>sendCode</td><td>function</td><td>function (code) </td></tr><tr valign="top"><td>invert</td><td>object</td><td></td></tr><tr valign="top"><td>btnSetup</td><td>function</td><td>function () </td></tr><tr valign="top"><td>showBody</td><td>function</td><td>function (evt) </td></tr><tr valign="top"><td>hideBody</td><td>function</td><td>function (evt) </td></tr><tr valign="top"><td>forkSetup</td><td>function</td><td>function () <br><br>This method loads the pubsubviewer widget which attaches to our 
upper right corner triangle menu and generates 3 menu items like
Pubsub Viewer, View Standalone, and Fork Widget. It also enables
the modal dialog that shows the documentation for this widget.<br><br>By using chilipeppr.load() we can ensure that the pubsubviewer widget
is only loaded and inlined once into the final ChiliPeppr workspace.
We are given back a reference to the instantiated singleton so its
not instantiated more than once. Then we call it's attachTo method
which creates the full pulldown menu for us and attaches the click
events.</td></tr>
      </tbody>
  </table>


## About ChiliPeppr

[ChiliPeppr](http://chilipeppr.com) is a hardware fiddle, meaning it is a 
website that lets you easily
create a workspace to fiddle with your hardware from software. ChiliPeppr provides
a [Serial Port JSON Server](https://github.com/johnlauer/serial-port-json-server) 
that you run locally on your computer, or remotely on another computer, to connect to 
the serial port of your hardware like an Arduino or other microcontroller.

You then create a workspace at ChiliPeppr.com that connects to your hardware 
by starting from scratch or forking somebody else's
workspace that is close to what you are after. Then you write widgets in
Javascript that interact with your hardware by forking the base template 
widget or forking another widget that
is similar to what you are trying to build.

ChiliPeppr is massively capable such that the workspaces for 
[TinyG](http://chilipeppr.com/tinyg) and [Grbl](http://chilipeppr.com/grbl) CNC 
controllers have become full-fledged CNC machine management software used by
tens of thousands.

ChiliPeppr has inspired many people in the hardware/software world to use the
browser and Javascript as the foundation for interacting with hardware. The
Arduino team in Italy caught wind of ChiliPeppr and now
ChiliPeppr's Serial Port JSON Server is the basis for the 
[Arduino's new web IDE](https://create.arduino.cc/). If the Arduino team is excited about building on top
of ChiliPeppr, what
will you build on top of it?

