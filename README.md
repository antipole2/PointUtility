# PointUtility
 
This JavaScript script adds functionality for adding positions

## _Copy position_ context menu

The _Copy position_ context menu copies a position to your clipboard formatted ready for pasting into rlogs or reports.

## _Copy mark_ context menu

This copies a nearby waypoint to become the template for dropped marks.  You can click on the mark itself - at present this context menu will be in the _Main menu_ subsection.

Choose a mark with the desired icon, _Show at scale_ and other attributes.

The copued mark becomes the pro forma style for dropped marks.

## _Paste mark_ context menu

Drops a mark at the location using a previously copied mark as the style template.

An alert shows the name and position of the dropped mark.

This context menu is only available if you have previously copied a mark to be a template.

## Control panel

The script presents one dialogue to select the log file and another to control recording.

The recording interval can be set and recording started, paused or ended.

The recording mode can be

#### Overwrite

When recording starts, it overwrites the log file.

#### Append

Data is appended to any existing data in the log file

#### Append (auto start)

In this mode, if recording was in progress when the script stopped (or the plugin was disabled) then recording will automatically recommence when the script runs again.  If you combine this with the console _Auto run_ option, recording will automatically recommence when the plugin is loaded.  Thus recording can be auomatically started when OpenCPN is launched.  An alert is displayed for a short while to advise that recording has recommenced.

#### Calling up the control panel

When a control panel choice has been made, the panel is no longer displayed. All that is visible is the parked console.  To summon up the control panel - perhaps to start, stop of paise recording, you ca click on the console's close button.

## Installing the script

1. Copy this URL to your clipboard - https://raw.githubusercontent.com/antipole2/VDR2/main/vdr2.js
2. In a JavaScript console choose `Load` and then `URL on clipboard`.  The script should be loaded into the script pane.
3. Choose `Run` to start the script.

NB If you want to run the script when not online, you will need to save it to a local file.

## Discussions

To discuss this script's functionality, us ethe Discussions tab aboove.

## Technical note

The script options are stored in the console's `_remember` variable.  They thus endure between script runs and across OpenCPN restarts (proviided OpenCPN quits gracefully).  The `_remember` variable is unique to the console.  Should you run the script in a different console, it will have fresh option settings.
