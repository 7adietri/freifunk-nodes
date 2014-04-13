if (!ffnds) var ffnds = {};

(function () {
  var tbody, routersum, clientsum, lastupdate;
  var node_filter;
  var refresh = 5 * 60 * 1000;

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

  var update_filter = function (fragment) {
    var filter = ffnds.parse_filter(fragment);
    node_filter = function(node) {
      var value = node.name + ' ' + node.firmware + ' ' + node.model;
      return filter(value);
    }
    window.location.hash = '#' + fragment;
    if (!fragment && typeof window.history.replaceState === 'function') {
      history.replaceState({}, '', window.location.href.slice(0, -1));
    }
    apply_filter();
  };

  var name_sort = function (node_a, node_b) {
    var name_a = node_a.name.toLocaleLowerCase();
    var name_b = node_b.name.toLocaleLowerCase();
    return name_a.localeCompare(name_b);
  };

  var update_list = function (json) {
    var nodes = json.nodes.sort(name_sort);
    var data = tbody.selectAll('tr').data(nodes, function (d) { return d.id; });

    var tr = data.enter().append('tr');
    tr.append('td');
    tr.append('td');
    tr.append('td');
    tr.append('td');
    tr.append('td');
    tr.append('td');
    tr.append('td');
    tr.append('td');

    data.select('td:nth-child(1)').text(function (d) { return d.name; });
    data.select('td:nth-child(2)')
      .text(function (d) { return d.flags.online ? 'Online' : 'Offline'; })
      .classed('offline', function (d) { return !d.flags.online; });
    data.select('td:nth-child(3)').text(function (d) { return d.clients; });
    data.select('td:nth-child(4)').text(function (d) { return d.wifi.length; });
    data.select('td:nth-child(5)').text(function (d) { return d.vpn.length; });
    data.select('td:nth-child(6)').text(function (d) { return d.geo ? 'Ja' : 'Nein'; });
    data.select('td:nth-child(7)').text(function (d) { return d.firmware; });
    data.select('td:nth-child(8)').text(function (d) { return d.model; });

    data.exit().remove();

    lastupdate.text(new Date(json.meta.timestamp + 'Z').toLocaleString());
    apply_filter();
  };

  var load_nodes = function () {
    d3.json('nodes.json', function (error, json) {
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
    hdr.append('th').text('Clients');
    hdr.append('th').text('WLAN');
    hdr.append('th').text('VPN');
    hdr.append('th').text('Geo');
    hdr.append('th').text('Firmware');
    hdr.append('th').text('Modell');

    tbody = table.append('tbody');

    var tfoot = table.append('tfoot');
    var ftr = tfoot.append('tr');
    ftr.append('td').text('Summe');
    routersum = ftr.append('td').append('span');
    clientsum = ftr.append('td').append('span');
    lastupdate = ftr.append('td').attr('colspan', '5').style('text-align', 'right').text('Stand: ').append('span');
  };

  ffnds.init = function () {
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
