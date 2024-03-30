scriptName = "PointUtility";
near = 0.25;	// copied waypoint must be this near nm

trace = false;
confirmDrops = false;
dumpOnParseFail = true;

if (!trace) consolePark();

Position = require("Position");

//first time set up _remember if need be
if ((typeof _remember == "undefined")
	|| (!_remember.hasOwnProperty("pointUtilitySet"))){
	// first time
	consoleName(scriptName);
	_remember = {};
	_remember.pointUtilitySet = false;
	_remember.suffix = 1;
	}
if (trace) print(_remember, "\n");

OCPNonContextMenu(copyPos,"Copy position");
OCPNonContextMenu(markCopy, "Copy mark");
if (_remember.pointUtilitySet) OCPNonContextMenu(pasteMark, "Paste mark");
onCloseButton(fromClipBoard);

function copyPos(pos){	// copy formatted position to clipboard
	toClipboard(new Position(pos).formatted);
	OCPNonContextMenu(copyPos,"Copy position");
	}

function markCopy(location){	// copy nearest mark as pro forma
	nearby = findNearby(location);
	if (nearby == "") report(" No waypoint within " + near + "nm");
	else {
		_remember.mark = nearby;
		_remember.pointUtilitySet = true;
		}
	if (trace) print("Pro forma mark copied\n_remember now: ", _remember, "\n");
	OCPNonContextMenu();	// not sure if we had one, so start again
	OCPNonContextMenu(markCopy, "Copy mark");
	OCPNonContextMenu(pasteMark, "Paste mark");
	}
	
function pasteMark(pos){	// paste pro forma mark at pos after confirming
	name = "pasted"+_remember.suffix++;
	confirm(name, pos);
	OCPNonContextMenu(pasteMark, "Paste mark");
	}

function confirm(name, position){	// give user chnace to confirm mark
	dialog = [
		{"type":"caption", "value":scriptName},
		{"type":"field", "label":"Mark name", "value":name, "width":155},
		{"type":"field", "label":"Position", "value":new Position(position).formatted,"width":160	},
		{"type":"button", "label":["Cancel", "*Drop mark"]}
		];
	onDialogue(handleConfirm, dialog);
	}

function handleConfirm(response){
	if (trace) print(response, "\n");
	button = response[response.length - 1].label;
	if (button  == "Drop mark"){
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
	if (mark.useMinScale){ 	// check if we need to zoom in to mark visible
		view = OCPNgetCanvasView();
		if (trace) print("Before:", view.ppm, "\t", view.chartScale,"\t", mark.minScale, "\n");
		if (view.chartScale > mark.minScale){
			view.ppm *= view.chartScale/mark.minScale*1.05;	// Err on safe side
			}
		if (trace) print("After:", view.ppm, "\t", view.chartScale,"\t", mark.minScale, "\n");
		OCPNcentreCanvas(pos, view.ppm);
		}
	OCPNaddSingleWaypoint(mark);
	if (confirmDrops) report("Dropped waypoint '" + mark.markName + "' at " + 
		new Position(mark.position).formatted + "\n");
	}

function fromClipBoard(){
	trace = false;
	onCloseButton(fromClipBoard);
	if (!_remember.pointUtilitySet){
		report("Need to copy a waypoint as pattern\nbefore you can paste");
		return;
		}
	// clean up what was on clipboard removing word Lat and Long if present
	text = fromClipboard();
	cleanText = cleanString(text);
	partPat = /(.*)\xB0.*(N|S)(.*)\xB0.*(E|W)/i;
	parts = cleanText.match(partPat);	// into parts
	if (parts == null){
		report("No valid position pair on clipboard");
		return;
		}
	if (trace)print("Parts: ", parts, "\n");
	// remove words Lat & Long if present
	matches = text.match(/.*(\bLat\b)|(^Lat\b).*/);
	if (matches != null) text = text.replace("Lat", "");
	matches = text.match(/.*(\bLong\b)|(^Long\b).*/);
	if (matches != null) text = text.replace("Long", "");

	// split string into label and position
	pos = text.search("\xB0");	// where first ° 
	namePart = text.slice(0, pos);
	positionPart = cleanText.slice(pos+1);
	pos = namePart.lastIndexOf(" ");
	if ((pos < 0) || (namePart.length > 25)){ // no space before position or name too long, so invent name
		namePart = "Clipboard" + _remember.suffix++;
		}
	else namePart = namePart.slice(0, pos).trim();
	positionPart = text.slice(pos+1);	//NB if no name, pos was left as -1 so this will slice from start of position
	if (trace) print("namePart: '", namePart, "'\npositionPart: '", positionPart, "'\n");
	position = new Position(positionPart);
	confirm(namePart, position);
	}
	
function findNearby(pos){
	// find waypoint near pos
	waypoints = [];	// array of candidates
	guids = OCPNgetWaypointGUIDs();
	if (guids.length < 1) return "";
	for (g = 0; g < guids.length; g++){
		waypoint = OCPNgetSingleWaypoint(guids[g]);
		if (!waypoint.isVisible) continue;
		waypoint.distance = OCPNgetVectorPP(pos, waypoint.position).distance;
		if (waypoint.distance > near) continue;
		waypoints.push(waypoint);	// remmember candidate
		}
	if (waypoints.length < 1) return "";
	else if (waypoints.length == 1) return waypoints[0];	// only one
	waypoints.sort(function(a, b){return a.distance - b.distance});
	if (!waypoints[1].distance > waypoints[0].distance) throw("Selection ambiguous");
	return waypoints[0];
	}

function report(message){
	onSeconds();	// cancel any existing timer
	alert(message);
	onSeconds(cancel, 7);
	}

function cancel(){
	alert(false);
	}

