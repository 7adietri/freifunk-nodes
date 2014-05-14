freifunk-nodes
==============

A simple Freifunk node list. Similar to the list in [ffmap-d3][],
but with filtering and auto-refresh.

  [ffmap-d3]: https://github.com/ffnord/ffmap-d3

Installation
------------

1. Clone the repository to a webserver that also provides a `nodes.json` file.
2. Edit `config.js` to your liking.
3. Load `list.html`.

Filtering
---------

The filter works on node name, firmware version and model. Multiple filter
strings can be separated by comma.
