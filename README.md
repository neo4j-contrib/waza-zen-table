waza-zen-table
==============

Zen-Table Hacking for http://waza.heroku.com

The beautiful [Zen-Sand-Coffee-Table](http://www.kickstarter.com/projects/fnbrit/zen-table) will be exhibited at Waza. To make it do cool stuff we want to hack an external interface and API.

![Zen-Table with Heroku Logo](http://4.bp.blogspot.com/-h_RcVxvvupo/UHl5rgmOBEI/AAAAAAAAAFU/ZxBRWVyEY6Q/s400/heroku_zentable.jpg)

## Hardware Setup

* zen-desktop or -coffee-table with USB connection 
* MacBook or RaspBerry Pi as proxy
* USB port exposed to the internet using something [like this]()
* Webcam

## API / Apps

* node.js / ruby application running on heroku connected to the internet-exposed-usb port of the proxy
* Web-UI with Javascript / Tablescript console and Webcam integration much like on 
* expose a http API for remotely controlling the Zen-Table (e.g. for remote control via an iOS/Android app)


## References

* http://www.zen-table.com/
* http://blog.neo4j.org/2012/10/zen-graph-visualizations-what-can-you-do.html
* [Table Script](http://www.zen-table.com/articles/how-to/reference-table-script)
* [Howto Create a Pattern from an Image](http://www.zen-table.com/articles/how-to/uploading-an-image)
* [Generated Patterns](http://www.zen-table.com/tools/add-pattern-script?p=agtzfnplbi10YWJsZXIOCxIHUGF0dGVybhifTgw)
* [Script Pattern Console](http://www.zen-table.com/tools/add-pattern-script)


* [Serial Tools (Mac)](http://www.w7ay.net/site/Applications/Serial%20Tools/index.html)
* [Serial Port Internet](http://playwithmyled.com/internet-to-serial-proxy/)

## Random bits of information

Every Zen Tale comes with a USB connector built into it, and uses a standard FTDI driver chip, so no special serial adapter is necessary.  Once plugged into your computer, it will appear as a virtual COM port, and by removing the SD-card from its slot, you can then send/receive data to the table directly via a serial terminal program, or via any suitable serial library/API/programming language you choose.
 
The table interprets a simple set of commands and G-Codes.  The parameters passed in are floating point X,Y coordinate pairs in millimeters.  Here are a couple of basic examples that each draw an identical square 100 millimeters along each side:
 
````
Robot.Home
Robot.LineTo(100.0, 100.0)
Robot.LineTo(200.0, 100.0)
Robot.LineTo(200.0, 200.0)
Robot.LineTo(100.0, 200.0)
Robot.LineTo(100.0, 100.0)
````
 
Or
 
````
G162
G0 X100.0 Y100.0
G0 X200.0
G0 Y200.0
G0 X100.0
G0 Y100.0
````

The Javascript based tool that you have seen on Zen-Table.com allows you to use the full power of the Javascript programming language, to generate a static output file with commands like the Robot.LineTo shown above.  That static file is then saved onto an SD card to be auto-played via the table.  Once a file has been read and drawing has completed, the table will read the next file on the card and begin drawing that one.  This works great if you are looking for the Zen Table equivalent of an electronic photo frame, but from what Kevin told me it sounds like you need a dynamic display showing live data, in which case you will want to communicate with the table directly using the commands described above.
 
To quickly answer some of your other questions:
 
The wood used in a Zen Desktop is all bamboo, very hard and very strong.  The basic frame is in two parts, the lower section comes with the linear bearing system pre-fitted, and the corner joints are glued in place and held square in an aluminium jig we built specifically to hold the bamboo square while everything sets.  The upper bamboo section is biscuit joined and has the lower pane of glass glued in place.  The “sand” sits on this glass, and another slightly smaller but thicker and stronger piece sits on top.

The Sand is actually a mixture of microscopic silicone beads, and ground up nut husks!  I know that sounds strange, but we did a lot of research to find a material which is not abrasive to the glass or magnets, and also still looks and moves like sand.

The magnet used inside the table is a neodymium bar magnet.  The magnet which sculpts a path in the sand is a neodymium ball magnet.  The ball magnet does not actually roll along as it moves, because the balls are magnetized axially there is a distinct North/South direction, but the ball provides a small contact area against the glass, reducing friction and the possibility for the silicone beads to get stuck underneath, and the ball shape cuts the most consistent looking path through the “sand”.

Resolution is an interesting topic in this context as there are several ways of looking at it…  The Zen Desktop has a maximum mechanical resolution of 1/80th millimeter on X (uses a belt drive) and 1/668th millimeter on Y (uses a leadscrew), which sounds fantastic, BUT the width of the furrow left by the magnet is 9.5mm from edge to edge, which sounds really coarse, until you realize that the size of the individual silicone balls is approximately 0.25mm, and you can create furrows very close to one another to get high resolution effects.  Ultimately resolution is more about how involved you want to get with the program which is sending commands to the table, I have written some spirograph type patterns which draw very fine lines, but they take a long time to complete.  I have also created some patterns which draw corporate logos with high resolution elements by drawing fairly coarse features, but then trace outlines around those features to push the coarser elements in towards one another.  It is an interesting area for experimentation which deserves far more attention than I have been able to give it so far.
 
Regarding the software.  I have made the firmware which runs on the microcontroller inside the table open source, so you will be able to tinker with it to your heart’s content.  The controller is a 32-bit 8-core device from Parallax.com called a Propeller.  The firmware is written in a mixture of a high level language called Spin and also in assembly.  The same USB virtual COM port which you use to communicate with the table can also be used to re-program the on board firmware.  I will give you access to the firmware code repository soon if you are interested in it?

There used to be several commands for moving the head to specific locations, one which ramped up the acceleration at the beginning of the move then ramped it down at the end, one which moved at a constant speed, another which accelerated or decelerated at a constant rate.  The generated scripts had all sorts of acceleration problems which caused the tables (both desktop and coffee table) to lose steps on the stepper motors, the missed steps would eventually accumulate and the sculpting head you eventually bang into the side of the mechanism.
 
I decided to resolve the situation by making every one of the move/line commands ALWAYS do the speed-up, move, slow-down for every move in the firmware, no matter what command had been passed in.  This fixes the problem, but when a table is sculpting a script with lots of short moves the mechanism sounds very strange!  Currently the tables sound like the game Space Invaders when that large ship would move across the very top of the screen, making a Wow-Wow-Wow-Wow-Wow sound!  I plan to fix this and make everything beautiful again by moving the smarts which I had hoped for in the website script generator be moved into the firmware.
 
There are other commands that the firmware parses, and I do plan to do exactly what you suggest by making one of the commands go to a location “invisibly” by using the return lines since once again that was supposed to be something handled by the script generator, but I think will just be provided by the firmware.  Here are all the current and planned commands:
 
* Robot.Home
* Robot.Level   (can be used to level out the sand when you first get a coffee table, simply alternates the clear commands many times)
* Robot.Clear   (clears along both axes)
* Robot.ClearX
* Robot.ClearY
* Robot.MoveTo(float, float)    (this will be the “smart” command which used the return lines to get to a location invisibly)
* Robot.LineTo(float, float)    (this command replaces all older drawing commands like MoveToExitSpeed, MoveToSmooth)
* Robot.WaitSeconds(int)    (usually used at the end of a script file to make the system delay before loading a new pattern file)
* Robot.WaitMinutes(int)    (see above)
* Robot.DebugEnable   (continuously sends debug data to a serial console to help understand what the low level driver is doing)
* Robot.DebugDisable
* System.Reboot    (Reboots the microcontroller)
* SD.Run(string)    (loads and executed a specific file from the SD card)
* USB.Send(string)    (sends a string across the USB port)
* Attract.Enable    (enables the mode which auto-reads pattern files from the SD card and executes them sequentially, it is enabled by default)
* Attract.Disable
 
Note that only a small subset of the commands above are allowed to be executed from a script file on SD card, while they are all accessible via the USB serial bridge.
 
I *REALLY* do want to expose a coffee table via the internet using a webcam, this was my plan all along, but it has not happened yet.
 
I think there are many artistic things which could be done with the basic plotter mechanism employed.  If the magnet below the table was replaced with an electromagnet, imagine what you could do if the sand was replaced with iron filings, or a mixture of sand and ferrofluid!  So many things to try, so little time to try them…

* Controller Board
* 2x Power Supplies
* 2x Stepper Motor Drivers
* 2x Stepper Motors (NEMA 23)
* Wires & Wiring Diagram
* Firmware Source Code and License

The kit included the electronic and firmware components of the table; in addition to the kit components and the table housing (including sand and glass) you'll need a linear bearing system of some sort to transfer the motion of the stepper motors.  We've used a combination of t-slot framing and bearings on smooth rods, but there are other alternatives you could explore.

