if (!ffnds) var ffnds = {};

(function () {
  var cfg, loc, node, util;
  var tbody, routersum, clientsum, lastupdate;
  var node_filter;
  var updater_id;
  var nodes, links;
  var first_load = true;

  // Apply filter function to nodes, update node/client counts.
  var apply_filter = function () {
    var online = 0, total = 0, clients = 0;
    var rows = tbody.selectAll('tr');
    rows.classed('filtered', function (d) {
      if (node_filter(d)) {
        online += node.online(d);
        total += 1;
        clients += node.clients(d);
        return false;
      } else {
        return true;
      }
    })
    routersum.text(loc('Sum_Online_Total', online, total));
    clientsum.text(clients);
  };

  // Update filter function and URL fragment, apply new filter.
  var update_filter = function (fragment) {
    var filter = util.parse_filter(fragment);
    node_filter = function(d) {
      var name = node.name(d);
      var firmware = node.firmware(d);
      var model = node.model(d);
      return filter(name + ' ' + firmware + ' ' + model);
    }
    util.set_fragment(fragment);
    apply_filter();
  };

  var name_sort = function (node_a, node_b) {
    var name_a = node.name(node_a).toLocaleLowerCase();
    var name_b = node.name(node_b).toLocaleLowerCase();
    return name_a.localeCompare(name_b);
  };

  // Update table with node data, sort and filter.
  var update_list = function () {
    var data = tbody.selectAll('tr').data(d3.values(nodes.nodes), node.id);

    var tr = data.enter().append('tr');
    tr.append('td');
    tr.append('td');
    tr.append('td');
    tr.append('td');
    tr.append('td');
    tr.append('td');
    tr.append('td');
    tr.append('td');
    tr.append('td');

    if (cfg.node_linker) {
      data.select('td:nth-child(1)')
        .html(null)
        .append('a')
        .attr('href', cfg.node_linker)
        .attr('target', '_blank')
        .text(node.name);
    } else {
      data.select('td:nth-child(1)')
        .text(node.name);
    }
    data.select('td:nth-child(2)')
      .text(function (d) { return node.online(d) ? loc('Online') : loc('Offline'); })
      .classed('online', node.online);
    data.select('td:nth-child(3)').text(render_uptime);
    data.select('td:nth-child(4)').text(node.clients);
    data.select('td:nth-child(5)').text(count_mesh_links);
    data.select('td:nth-child(6)').text(count_vpn_links);
    data.select('td:nth-child(7)').text(function (d) { return node.location(d) ? loc('Yes') : loc('No') });
    data.select('td:nth-child(8)').text(node.firmware);
    data.select('td:nth-child(9)').text(node.model);

    data.exit().remove();
    data.sort(name_sort);
    apply_filter();

    var timestamp = new Date(nodes.timestamp + 'Z').toLocaleString();
    lastupdate.text(loc('Updated_Timestamp', timestamp));

    if (first_load) {
      d3.select('#loading').style('display', 'none');
      d3.select('#list').style('display', null);
      first_load = false;
    }
  };

  var render_uptime = function (d) {
    var uptime = node.uptime(d);
    var days = 0, hours = 0;
    if (uptime > 0) {
      if (uptime > 86400) {
        days = Math.floor(uptime / 86400);
        hours = Math.floor(uptime % 86400 / 3600);
        return loc('Uptime_Days_Hours', days, hours);
      } else {
        hours = (uptime / 3600).toFixed(1);
        return loc('Uptime_Hours', hours);
      }
    } else {
      return '';
    }
  };

  var count_mesh_links = function (d) {
    var list = links[node.id(d)] || [];
    return list.filter(function (l) { return l.vpn === false; }).length;
  };

  var count_vpn_links = function (d) {
    var list = links[node.id(d)] || [];
    return list.filter(function (l) { return l.vpn === true; }).length;
  };

  var parse_links = function (json) {
    var links = {};
    var add_link = function (source_id, target_id, json) {
      if (links[source_id] === undefined) {
        links[source_id] = [];
      }
      links[source_id].push({
        target: target_id,
        vpn: json.vpn,
        tq: json.tq
      });
    };
    try {
      var nodes = json.batadv.nodes;
      json.batadv.links.forEach(function (l) {
        var s = nodes[l.source];
        var t = nodes[l.target];
        add_link(s.node_id, t.node_id, l);
        if (l.bidirect) {
          add_link(t.node_id, s.node_id, l);
        }
      });
    }
    catch (e) {
      console.log('Error parsing links: ' + e);
    }
    return links;
  };

  var load_data = function () {
    d3.json(cfg.nodes_url, function (error, json) {
      if (error) {
        console.log('Error loading nodes.json: ' + error);
      } else {
        nodes = json;
        d3.json(cfg.graph_url, function (error, json) {
          if (error) {
            console.log('Error loading graph.json: ' + error);
          } else {
            links = parse_links(json);
          }
          update_list();
        });
      }
    });
  };

  var init_list = function (table) {
    table.style('display', 'none');

    var thead = table.append('thead');
    var hdr = thead.append('tr');
    hdr.append('th').text(loc('Name'));
    hdr.append('th').text(loc('Status'));
    hdr.append('th').text(loc('Uptime'));
    hdr.append('th').text(loc('Clients'));
    hdr.append('th').text(loc('Mesh'));
    hdr.append('th').text(loc('VPN'));
    hdr.append('th').text(loc('Geo'));
    hdr.append('th').text(loc('Firmware'));
    hdr.append('th').text(loc('Model'));

    tbody = table.append('tbody');

    var tfoot = table.append('tfoot');
    var ftr = tfoot.append('tr');
    ftr.append('td');
    routersum = ftr.append('td').append('span');
    ftr.append('td');
    clientsum = ftr.append('td').append('span');
    lastupdate = ftr.append('td').attr('colspan', '5').style('text-align', 'right').append('span');
  };

  ffnds.init = function () {
    cfg = ffnds.config;
    loc = ffnds.loc;
    node = ffnds.node;
    util = ffnds.util;
    util.init_homepage();
    init_list(d3.select('#list'));

    var fragment = window.location.hash.substring(1);
    update_filter(fragment);

    var input = document.getElementById('filter');
    input.value = fragment;
    input.addEventListener('input', function () { update_filter(this.value); }, false);

    links = {};
    updater_id = window.setInterval(load_data, cfg.update_period * 60 * 1000);
    load_data();
  };
}());

window.addEventListener('load', ffnds.init, false);
