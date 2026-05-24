scriptName = "PointUtility";

var trace = false;
if (!trace) consolePark();

confirmDrops = false;
dumpOnParseFail = true;

scriptName = "PointUtility";
thisScriptVersion = "3.3";
require("checkForUpdate")(scriptName, thisScriptVersion, 5, "https://raw.githubusercontent.com/antipole2/PointUtility/v3.2/version.JSON");

// Because of an error in the Position contstuctor in JS plugin v4.0.0,
// we need to use a patched version appended below and not the one in the plugin.
// So next line commented out
// Position = require("Position");

pasteMarkId = false;		// if we have pasteMark menu,id of its callback

//first time set up _remember if need be
if ((typeof _remember == "undefined")
	|| (_remember == null)
	|| (!_remember.hasOwnProperty("pointUtilitySet"))){ // first time
	consoleName(scriptName);
	_remember = {};
	_remember.pointUtilitySet = false;
	_remember.suffix = 1;
	}
if (trace) print(_remember, "\n");

OCPNonAllContextMenu(copyPos,"Copy position");
OCPNonAllWaypointContextMenu(copyMark, "Copy mark");
OCPNonAllRouteContextMenu(dupRoute, "Duplicate route");

if (_remember.pointUtilitySet){
	pasteMarkId = OCPNonAllContextMenu(pasteMark, "Paste mark");
	OCPNonAllContextMenu(handleClipboard, "Paste mark from clipboard");
	}

function copyPos(pos){	// copy formatted position to clipboard
	if (trace) print("Cppy position: ", pos, "\n");
	toClipboard(new Position(pos).formatted);
	}

function copyMark(info){	// copy mark as pro forma
	if (trace) print("In copyMark\n");
	theMark = OCPNgetSingleWaypoint(info.GUID);
	if (trace) print("Copied mark ", theMark.markName, "\n");
	_remember.mark = theMark;
	_remember.pointUtilitySet = true;
	if (!pasteMarkId){	// did not have paste mark available before, so add pasting options
		pasteMarkId = OCPNonAllContextMenu(pasteMark, "Paste mark");
		OCPNonAllContextMenu(handleClipboard, "Paste mark from clipboard");
		}
	}
	
function pasteMark(pos){	// paste pro forma mark at pos after confirming
	name = "pasted"+_remember.suffix++;
	confirm(name, pos);
	}

function confirm(name, position){	// give user chance to confirm mark
	dialog = [
		{"type":"caption", "value":scriptName},
		{"type":"field", "label":"Mark name", "value":name, "width":155},
		{"type":"field", "label":"Position", "value":new Position(position).formatted,"width":160	},
		{"type":"button", "label":["Cancel", "*Paste mark"]}
		];
	onDialogue(handleConfirm, dialog);
	}

function handleConfirm(response){
	if (trace) print(response, "\n");
	button = response[response.length - 1].label;
	if (button  == "Paste mark"){
		markName = response[1].value;
		try {	// position could be invalid
			position = new Position(response[2].value);
			dropMark(markName, position);
			}
		catch (err){
			report("Invalid position pair");
			}
		}
	}

function dropMark(name, pos){
	if (trace) print("dropMark(", name, ",", pos.formatted, "\n");
	mark = _remember.mark; // to shorten code
	mark.position = pos;
	mark.markName = name;
	mark.GUID = undefined;
	view = OCPNgetCanvasView();
	if (mark.useMinScale){ 	// check if we need to zoom in to mark visible		
		if (trace) print("Before:", view.ppm, "\t", view.chartScale,"\t", mark.minScale, "\n");
		if (view.chartScale > mark.minScale){
			view.ppm *= view.chartScale/mark.minScale*1.05;	// Err on safe side
			}
		if (trace) print("After:", view.ppm, "\t", view.chartScale,"\t", mark.minScale, "\n");
		}
	OCPNcentreCanvas(pos, view.ppm);
	OCPNaddSingleWaypoint(mark);
	if (confirmDrops) report("Dropped waypoint '" + mark.markName + "' at " + 
		new Position(mark.position).formatted + "\n");
	}

function handleClipboard(){
	if (!_remember.pointUtilitySet){
		report("Need to copy a waypoint as pattern\nbefore you can paste");
		return;
		}
	// clean up what was on clipboard removing word Lat and Long if present
	text = cleanString(fromClipboard());
	if (trace) print("Clipboard: ", text, "\n");
	// split into name (if any) and position
	partPat = /^(.*)\s?(\d\d{1,2}°.*\d?°.*)/i;
	parts = text.match(partPat);	// into parts
	if (trace) print("Parts: ", parts, "\n");
	if (parts == null){
		report("No recognised position pair on clipboard");
		return;
		}
	else {
		namePart = parts[1];
		// Position might have "Lat xxx  Long yyy".  Name part will have the Lat.  Deal with it.
		namePart = namePart.replace(/Lat/i, "").trim();
		positionPart = parts[2];
		if (trace) print("Name: ", namePart, "\tPosition: ", positionPart, "\n");
		// remove words Lat & Long if present
		matches = positionPart.match(/.*(\bLat\b)|(^Lat\b).*/);
		if (matches != null) positionPart = positionPart.replace("Lat", "");
		matches = text.match(/.*(\bLong?\b)|(^Long?\b).*/);
		if (matches != null) positionPart = positionPart.replace("Long", "");
		if (trace) print("cleaned position: ", positionPart, "\n");
		if (namePart.length < 1) namePart = "Clipboard" + _remember.suffix++;
		if (trace) print("namePart: '", namePart, "'\npositionPart: '", positionPart, "'\n");
		position = new Position(positionPart);
		if (trace) print("From clipboard name '", namePart, "'\tPosition: ", position, "\n");
		confirm(namePart, position);
		}
	}

function dupRoute(input){ // duplicate selected route
	if (trace) print("In dupRoute\n");
	route = OCPNgetRoute(input.GUID);
	existingName = route.name;
	if (trace) print("Selected route is ", route.name, "\n");
	route.isVisible = false;
	OCPNupdateRoute(route);	// hide original copy
	route.isVisible = true;
	route.name += " copy";
	delete route.GUID;	// get a new route created
	OCPNaddRoute(route);
	report("Route '" + existingName + "' has been hidden\nRoute '" + route.name + "' created");
	}

function report(message){
	onSeconds();	// cancel any existing timer
	alert(message);
	onSeconds(function(){alert(false);}, 10);	// cancel alert after time
	}

/***************************************************************
 * Patched version of Position contstructor
 ***************************************************************/
 function Position(lat, lon){
	if (arguments.length == 1){
		if (typeof arguments[0] != "string"){
			this.latitude = arguments[0].latitude;
			this.longitude = arguments[0].longitude;
			}
		else {3
			pos = parsePosition(arguments[0]);
			this.latitude = pos.latitude;
			this.longitude = pos.longitude;
			}
		}
	else {
		this.latitude= lat;
		this.longitude = lon;
		}
	
	Object.defineProperty(this, "formatted",{  // format for human eye
			enumerable: false,
			configurable: false,
			get: function () {
				return(niceify(OCPNformatDMS(1, this.latitude,true)) + " " + niceify(OCPNformatDMS(2, this.longitude,true)));
				}
			});
	
	Object.defineProperty(this, "NMEA",{   // format as in NMEA sentence
			enumerable: false,
			configurable: false,
			get: function () {
				latAbs = Math.abs(this.latitude);  wholeLatAbs =  Math.floor(latAbs);
				lonAbs = Math.abs(this.longitude);  wholeLonAbs =  Math.floor(lonAbs);
				return (
					((wholeLatAbs*100) + ((latAbs%1)*60)).toFixed(5) + "," + ((this.latitude < 0) ? "S," : "N,") +
					("00" + (((wholeLonAbs*100) + ((lonAbs%1)*60)).toFixed(5))).slice(-11) + "," + ((this.longitude < 0) ? "W" : "E")
					)
				}
			});
	
	this.NMEAdecode = function(string, n) {  // decodes n'th position from NMEA string
		n -= 1;  // base 0
		decoded = string.match(/\d+\.\d+,[NS],\d+\.\d+,[EW]/g);
		if (!decoded) return(false);
		poses = decoded[n].match(/\d+\.\d+/g);
		if (poses.length != 2) return false;
		whole = parseInt(poses[0]/100);  // Latitude
		rest = poses[0] - whole*100;
		this.latitude = whole + rest/60;
		whole = parseInt(poses[1]/100);  // Longitude
		rest = poses[1] - whole*100;
		this.longitude = whole + rest/60;
		poses = decoded[n].match(/[NSEW]/g);  // hemispheres
		if (poses[0] == "S") this.latitude *= -1;
		if (poses[1] == "W") this.longitude *= -1;
		return(true);
		}
	
	this.latest = function(){
		fix = OCPNgetNavigation();
		this.latitude = fix.position.latitude;
		this.longitude = fix.position.longitude;
		this.time = fix.fixTime;
		}
	
	this.parse = function(text){
		return parsePosition(text);
		}
	
	return this;
	
	function parsePosition(text){
		// parse lat & long into position object
		trace = false;
		title = arguments.callee.name;	// remember for error reporting
		phase = "";	// for error reporting
		partPat = /(.*)(N|S)(.*)(E|W)/i;
		parts = text.match(partPat);	// into parts
		if (parts == null) bail("not lat long pair");	
		if (trace) print("Halves: ", parts, "\n");
		if (parts.length != 5) bail("parse error 1");
		position = {};
		position.latitude = OCPNparseDMS(parts[1]+parts[2]);
		position.longitude = OCPNparseDMS(parts[3]+parts[4]);
		return position;
		function bail(message){
			throw(title + " " + phase + " " + message);
			};
		}
	
	function niceify(string){	// ajust precision to my liking
		parts = string.split(" ");
		switch (parts.length){
			case 1:	// Decimal degrees - do nothing
			return(string);
			case 2:	// should not be
			return("Nonsense formatting of decimal degrees");
			case 3:	// degrees and decimal minutes
			value = parts[1].slice(0,-1)* 1;
			parts[1] = value.toFixed(3) + "'";			
			return parts.join(" ");
			case 4:	// degrees minutes and decimal seconds
			value = parts[2].slice(0,-1)* 1;
			parts[2] = value.toFixed(1) + "\"";			
			return parts.join(" ");
			default: break;
			}			
		return("Invalid formatted string from OCPN");;
		}
	
	};
