# PointUtility
 
This script adds functionality for positions, marks and routes to OpenCPN.  When the script is run, it parks itself out of the way and you have the following functionality.

## _Copy position_ context menu

The _Copy position_ context menu copies the cursor position to your clipboard formatted ready for pasting into logs or reports.

## _Copy mark_ waypoint context menu

This copies the waypoint to become the template for pasted marks.

Choose a mark with the desired icon, _Show at scale_  option and other attributes.

The copied mark becomes the _pro forma_ style for pasted marks.

## _Paste mark_ context menu

Proposes to paste a mark at the chosen location using a previously copied mark as the style template.

When a mark is pasted, the chart is centred on it and will be zoomed in, if necessary, so that the mark is displayed.

This context menu is only available if you have previously copied a mark to be a template.

## _Paste mark from clipboard_ context menu

You can paste a mark at a position from some other source, such as a cruising guide.

Copy a position such as  _56° 48.190'N 010° 26.637'E_ to your clipboard and then select _Paste mark from clipboard_ in the context menu.  The script will propose to paste a mark at the location, the canvas centred there and the chart zoomed in if required so that the mark is displayed.

If there is text no longer than 15 characters before the position (e.g. _Sandy Bay 56° 48.190'N 010° 26.637'E_) this will be proposed as the mark name.

This context menu is only available if you have previously copied a mark to be a template.

## _Duplicate route_ route context menu

In OpenCPN, duplicating a route to modify for some purpose is tedious - involving exporting the route, editing out the GUID and then importing it.

Point Utility adds a _Duplicate route_ route context.  The original route is hidden and _copy_ is appened to the duplicate name.
This is very useful if you have a stock route and you want to start a new route based on your stock route but do not want to modify the stock route.

## Installing the script

This script needs JavaScript plugin v4.0.0 or later.

1. Copy this URL to your clipboard (copy link - do not follow it) `https://raw.githubusercontent.com/antipole2/PointUtility/main/pointUtility.js`
2. In a JavaScript console choose `Load` and then `URL on clipboard`.  The script should be loaded into the script pane.
3. Choose `Run` to start the script.

If you want to run the script when not online, you will need to save it to a local file.  You can tick the _Auto run_ box to have the script start automatically.

Alternatively, you can fork the repository if you want to evolve the script yourslf.

## Discussions

To discuss this script's functionality, use the Discussions button above.
