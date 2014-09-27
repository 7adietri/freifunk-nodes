if (!ffnds) var ffnds = {};

(function () {
  var cfg;
  var tbody, routersum, clientsum, lastupdate;
  var node_filter;
  var refresh = 5 * 60 * 1000;

  // Apply filter function to nodes, update node/client counts.
  var apply_filter = function () {
    var online = 0, total = 0, clients = 0;
    var rows = tbody.selectAll('tr');
    rows.classed('filtered', function (d) {
      if (node_filter(d)) {
        online += d.flags.online;
        total += 1;
        clients += d.clients;
        return false;
      } else {
        return true;
      }
    })
    routersum.text(online + ' / ' + total);
    clientsum.text(clients);
  };

  // Update filter function and URL fragment, apply new filter.
  var update_filter = function (fragment) {
    var filter = ffnds.parse_filter(fragment);
    node_filter = function(node) {
      var value = node.name + ' ' + node.firmware + ' ' + node.model;
      return filter(value);
    }
    ffnds.set_fragment(fragment);
    apply_filter();
  };

  var name_sort = function (node_a, node_b) {
    var name_a = node_a.name.toLocaleLowerCase();
    var name_b = node_b.name.toLocaleLowerCase();
    return name_a.localeCompare(name_b);
  };

  // Update table with node data, sort and filter.
  var update_list = function (json) {
    var data = tbody.selectAll('tr').data(json.nodes, function (d) { return d.id; });

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
      data.select('td:nth-child(1)').html(null).append('a')
        .attr('href', cfg.node_linker)
        .attr('target', '_blank')
        .text(function (d) { return d.name; });
    } else {
      data.select('td:nth-child(1)').text(function (d) { return d.name; });
    }
    data.select('td:nth-child(2)')
      .text(function (d) { return d.flags.online ? 'Online' : 'Offline'; })
      .classed('offline', function (d) { return !d.flags.online; });
    data.select('td:nth-child(3)').text(render_uptime);
    data.select('td:nth-child(4)').text(function (d) { return d.clients; });
    data.select('td:nth-child(5)').text(function (d) { return d.wifi.length; });
    data.select('td:nth-child(6)').text(function (d) { return d.vpn.length; });
    data.select('td:nth-child(7)').text(function (d) { return d.geo ? 'Ja' : 'Nein'; });
    data.select('td:nth-child(8)').text(function (d) { return d.firmware; });
    data.select('td:nth-child(9)').text(function (d) { return d.model; });

    data.exit().remove();
    data.sort(name_sort);
    apply_filter();

    lastupdate.text(new Date(json.meta.timestamp + 'Z').toLocaleString());
  };

  var render_uptime = function (d) {
    if (d.hasOwnProperty('uptime') && d.uptime > 0) {
      return (d.uptime / 3600).toFixed(1) + 'h';
    } else {
      return '';
    }
  };

  // Periodically load node data.
  var load_nodes = function () {
    d3.json(cfg.nodes_url, function (error, json) {
      if (error) {
        console.log('Error loading nodes: ' + error);
      } else {
        try {
          update_list(ffnds.prepare_nodes(json));
        } catch (error) {
          console.log('Error updating list: ' + error);
        }
      }
      window.setTimeout(load_nodes, refresh);
    });
  };

  var init_list = function (table) {
    var thead = table.append('thead');
    var hdr = thead.append('tr');
    hdr.append('th').text('Name');
    hdr.append('th').text('Status');
    hdr.append('th').text('Uptime');
    hdr.append('th').text('Clients');
    hdr.append('th').text('WLAN');
    hdr.append('th').text('VPN');
    hdr.append('th').text('Geo');
    hdr.append('th').text('Firmware');
    hdr.append('th').text('Modell');

    tbody = table.append('tbody');

    var tfoot = table.append('tfoot');
    var ftr = tfoot.append('tr');
    ftr.append('td');
    routersum = ftr.append('td').append('span');
    ftr.append('td');
    clientsum = ftr.append('td').append('span');
    lastupdate = ftr.append('td').attr('colspan', '5').style('text-align', 'right').text('Stand: ').append('span');
  };

  ffnds.init = function () {
    cfg = ffnds.config;
    ffnds.init_homepage();
    init_list(d3.select('#list'));

    var fragment = window.location.hash.substring(1);
    update_filter(fragment);

    var input = document.getElementById('filter');
    input.placeholder = 'Filter';
    input.value = fragment;
    input.addEventListener('input', function () { update_filter(this.value); }, false);

    load_nodes();
  };
}());

window.addEventListener('load', ffnds.init, false);
