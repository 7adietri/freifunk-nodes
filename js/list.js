if (!ffnds) var ffnds = {};

(function () {
  var tbody, routersum, clientsum, lastupdate;

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
    data.select('td:nth-child(2)').text(function (d) { return d.flags.online ? 'Online' : 'Offline'; });
    data.select('td:nth-child(3)').text(function (d) { return d.clients; });
    data.select('td:nth-child(4)').text(function (d) { return d.wifi.length; });
    data.select('td:nth-child(5)').text(function (d) { return d.vpn.length; });
    data.select('td:nth-child(6)').text(function (d) { return d.geo ? 'Ja' : 'Nein'; });
    data.select('td:nth-child(7)').text(function (d) { return d.firmware; });
    data.select('td:nth-child(8)').text(function (d) { return d.model; });

    data.exit().remove();

    routersum.text(nodes.reduce(function (s, d) { return s + d.flags.online; }, 0) + ' / ' + nodes.length);
    clientsum.text(nodes.reduce(function (s, d) { return s + d.clients; }, 0));
    lastupdate.text(new Date(json.meta.timestamp + 'Z').toLocaleString());
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

    d3.json('nodes.json', function (error, json) {
      if (error) {
        console.log('Error loading nodes: ' + error);
      } else {
        update_list(ffnds.prepare_nodes(json));
      }
    });
  };
}());

window.addEventListener('load', ffnds.init, false);
