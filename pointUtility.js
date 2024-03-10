scriptName = "PointUtility";
near = 0.25;	// copied waypoint must be this near nm

trace = false;
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
OCPNonContextMenu(copyPos,"Copy position");
OCPNonContextMenu(markCopy, "Copy mark");
if (_remember.pointUtilitySet) OCPNonContextMenu(pasteMark, "Paste mark");
onCloseButton(fromClipBoard);

function copyPos(pos){
	toClipboard(new Position(pos).formatted);
	OCPNonContextMenu(copyPos,"Copy position");
	}

function markCopy(location){
	nearby = findNearby(location);
	if (nearby == "") report(" No waypoint within " + near + "nm");
	else {
		_remember.mark = nearby;
		_remember.pointUtilitySet = true;
		}
	OCPNonContextMenu(markCopy, "Copy mark");
	}
	
function pasteMark(pos){
	name = "pasted"+_remember.suffix++;
	dropMark(name, pos);
	OCPNonContextMenu(pasteMark, "Paste mark");
	}

function dropMark(name, pos){
	if (trace) print("dropMark(", name, ",", pos.formatted, "\n");
	mark = _remember.mark; // to shorten code
	mark.position = pos;
	mark.markName = name;
	mark.GUID = undefined;
	if (mark.useMinScale){ 	// check if we need to zoom in so mark visible
		view = OCPNgetCanvasView();
		// print("Before:", view.ppm, "\t", view.chartScale,"\t", mark.minScale, "\n");
		if (view.chartScale > mark.minScale){
			view.ppm *= view.chartScale/mark.minScale*1.05;	// Err on safe side
			}
		// print("After:", view.ppm, "\t", view.chartScale,"\t", mark.minScale, "\n");
		OCPNcentreCanvas(pos, view.ppm);
		}
	OCPNaddSingleWaypoint(mark);
	report("Dropped waypoint '" + mark.markName + "' at " + 
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
		report("No position pair on clipboard");
		return;
		}
	if (trace)print("Parts: ", parts, "\n");
	// remove words Lat & Long if present
	matches = text.match(/.*(\bLat\b)|(^Lat\b).*/);
	if (matches != null) text = text.replace("Lat", "");
	matches = text.match(/.*(\bLong\b)|(^Long\b).*/);
	if (matches != null) text = text.replace("Long", "");

	// split string into label and position
	pos = text.search("\xB0");	// where first º 
	namePart = text.slice(0, pos);
	positionPart = cleanText.slice(pos+1);
	pos = namePart.lastIndexOf(" ");
	if ((pos < 0) || (namePart.length > 15)){ // no space before position or name too long, so invent name
		namePart = "Clipboard" + _remember.suffix++;
		}
	else namePart = namePart.slice(0, pos).trim();
	positionPart = text.slice(pos+1);	//NB if no name, pos was left as -1 so this will slice from start of position
	if (trace) print("namePart: '", namePart, "'\npositionPart: '", positionPart, "'\n");
	position = new Position(positionPart);
	dropMark(namePart, position);
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

