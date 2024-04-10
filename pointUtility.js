scriptName = "PointUtility";
near = 0.25;	// copied waypoint must be this near nm

if (OCPNgetPluginConfig().PluginVersionMajor < 3) throw(scriptName + " requires plugin v3 or later.");
trace = false;
confirmDrops = false;
dumpOnParseFail = true;

scriptVersion = 1.1
checkVersion(scriptVersion, 2,
	"https://raw.githubusercontent.com/antipole2/PointUtility/main/pointUtility.js",
	"https://raw.githubusercontent.com/antipole2/PointUtility/main/version.JSON"
	);

if (!trace) consolePark();

Position = require("Position");

//first time set up _remember if need be
if ((typeof _remember == "undefined")
	|| (_remember == null)
	|| (!_remember.hasOwnProperty("pointUtilitySet"))){
	// first time
	consoleName(scriptName);
	_remember = {};
	_remember.pointUtilitySet = false;
	_remember.suffix = 1;
	}
if (trace) print(_remember, "\n");

OCPNonContextMenu(copyPos,"Copy position");
OCPNonContextMenu(copyMark, "Copy mark");
if (_remember.pointUtilitySet){
	OCPNonContextMenu(pasteMark, "Paste mark");
	OCPNonContextMenu(handleClipboard, "Paste mark from clipboard");
	}

function copyPos(pos){	// copy formatted position to clipboard
	toClipboard(new Position(pos).formatted);
	OCPNonContextMenu(copyPos,"Copy position");
	}

function copyMark(location){	// copy nearest mark as pro forma
	nearby = findNearby(location);

	if (nearby == ""){
		report(" No single nearest waypoint within " + near + "nm");
		OCPNonContextMenu(markCopy, "Copy mark");
		return;
		}
	else {
		_remember.mark = nearby;
		_remember.pointUtilitySet = true;
		}
	if (trace) print("Pro forma mark copied\n_remember now: ", _remember, "\n");
	OCPNonContextMenu();	// not sure if we had one, so start again
	OCPNonContextMenu(copyMark, "Copy mark");
	OCPNonContextMenu(pasteMark, "Paste mark");
	OCPNonContextMenu(handleClipboard, "Paste mark from clipboard");
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

function handleClipboard(){
	if (!_remember.pointUtilitySet){
		report("Need to copy a waypoint as pattern\nbefore you can paste");
		return;
		}
	// clean up what was on clipboard removing word Lat and Long if present
	text = cleanString(fromClipboard());
	if (trace) print("Clipboard: ", text, "\n");
	// split into name (if any) and position
	partPat = /^(.*)\s?(\d\d{1,2}º.*\d?º.*)/i;
	parts = text.match(partPat);	// into parts
	if (trace) print("Parts: ", parts, "\n");
	if (parts == null){
		report("No valid position pair on clipboard");
		OCPNonContextMenu(handleClipboard, "Paste mark from clipboard");
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
	OCPNonContextMenu(handleClipboard, "Paste mark from clipboard");
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
	if (!waypoints[1].distance > waypoints[0].distance){
		report("Mark selection ambiguous - more than one nearest");
		return "";
		}
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

function checkVersion(version, days, scriptURL, versionCheckURL){
/*
	version	present version
	days		check every tis often if on-line
	scriptURL	where the script can be found
	versionCheckURL	 where the version  file can be found
*/
//	if (OCPNgetPluginConfig().PluginVersionMajor < 3) throw(scriptName + " requires plugin v3 or later.");
	if (!OCPNisOnline()) return;
	if (_remember == undefined) _remember = {};
	now = Date.now();
	if (trace) print("Now: ", now, "\n");
	if (_remember.hasOwnProperty("versionControl")){
		lastCheck = _remember.versionControl.lastCheck;
		if (trace) print("versionControl.lastCheck was ", lastCheck, "\n");
		if (now < (lastCheck + days*24*60*60*1000)){
			if (trace) print("No version check due\n");
			return;
			}
		_remember.versionControl.lastCheck = now;
		}
	else _remember.versionControl = {"lastCheck":0};
	if (trace) print("versionControl.lastCheck updated to ", now, "\n");
//	versionCheckURL = "https://raw.githubusercontent.com/antipole2/VDR2/main/version.JSON";
//	scriptURL = "https://raw.githubusercontent.com/antipole2/VDR2/main/vdr2.js"
	details = JSON.parse(readTextFile(versionCheckURL));
	if (version < details.version){
		message = "\You have script version " + scriptVersion
			+ "\nUpdate to version " + details.version + " available."
			+ "\nDate: " + details.date + "\nNew: " + details.new
			+ "\n \nUpdating will lose any local changes you have made\nYou need to save these first"
			+ "\nTo supress update prompts, disable the call to checkVersion"
			+ "\nUpdate now?";
		response = messageBox(message, "YesNo");
		if (response == 2){
			require("Consoles");
			consoleLoad(consoleName(), scriptURL);
			message = "Script updated.\nYou need to save it locally if you want to run it off-line"
				+ "\nYou can now run the updated script.";
			messageBox(message);
			stopScript("Script updated");
			}
		else _remember.versionControl.lastCheck = now;
		}
	else if (trace) print("Version already up to date\n");
	}
