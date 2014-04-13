if (!ffnds) var ffnds = {};

(function () {
  // Ensure name property, resolve links, remove clients.
  ffnds.prepare_nodes = function (json) {
    var nodes = json.nodes;
    nodes.forEach(function (d) {
      if (!d.flags.client) {
        if (!d.name) {
          d.name = d.id;
        }
        d.clients = 0;
        d.wifi = [];
        d.vpn = [];
      }
    });
    json.links.forEach(function (d) {
      var src = nodes[d.source];
      var dst = nodes[d.target];
      if (d.type === 'client') {
        src.clients++;
      } else if (d.type === 'vpn') {
        src.vpn.push(dst);
        dst.vpn.push(src);
      } else {
        src.wifi.push(dst);
        dst.wifi.push(src);
      }
    });
    return {
      meta: json.meta,
      nodes: nodes.filter(function (d) { return !d.flags.client; })
    };
  };
}());
