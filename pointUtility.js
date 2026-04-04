scriptName = "PointUtility";
near = 0.25;	// copied waypoint must be this near nm

confirmDrops = false;
dumpOnParseFail = true;

require("pluginVersion")("3.2");
scriptName = "PointUtility";
scriptVersion = "1.6" // Uses OCPN 5.12 + latest JS plugin; copy route added
require("checkForUpdate")(scriptName, scriptVersion, 5, "https://raw.githubusercontent.com/antipole2/PointUtility/main/version.JSON");

var trace = false;
if (!trace) consolePark();

pasteMarkId = false;		// if we have pasteMark menu,id of its callback
Position = require("Position");
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

/*
function cancel(){
	alert(false);
	}
*/
