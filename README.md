# PointUtility
 
This script adds functionality for adding marks to OpenCPN.  When the script is run, it parks itself out of the way and you have the following functionality.

## _Copy position_ context menu

The _Copy position_ context menu copies the cursor position to your clipboard formatted ready for pasting into logs or reports.

## _Copy mark_ context menu

This copies a nearby waypoint to become the template for dropped marks.  You can click on the mark itself - at present this context menu will be in the _Main menu_ subsection.

Choose a mark with the desired icon, _Show at scale_  option and other attributes.

The copied mark becomes the pro forma style for dropped marks.

## _Paste mark_ context menu

Drops a mark at the location using a previously copied mark as the style template.

An alert shows the name and position of the dropped mark.

This context menu is only available if you have previously copied a mark to be a template.

## Pasting a position from elsewhere

You can paste a mark at a position from some other source, such as a cruising guide.

Copy a position such as  _56° 48.190'N 010° 26.637'E_ to your clipbaord and then click on the PointUtility's console Close button.  A mark will be dropped at the location, the canvas centred there and the chart zoomed in if required so that the mark is displayed.

If there is text no longer than 15 characters before the position (e.g. _Sandy Bay 56° 48.190'N 010° 26.637'E_) this will be used as the mark name.

## Installing the script

1. Copy this URL to your clipboard - https://raw.githubusercontent.com/antipole2/PointUtility/main/pointUtility.js
2. In a JavaScript console choose `Load` and then `URL on clipboard`.  The script should be loaded into the script pane.
3. Choose `Run` to start the script.

If you want to run the script when not online, you will need to save it to a local file.

Alternatively, you can fork the repository if you want to evolve the script.

## Discussions

To discuss this script's functionality, use the Discussions button above.
