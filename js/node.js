if (!ffnds) var ffnds = {};

(function () {
  var id = function (json) {
    try {
      return json.nodeinfo.node_id;
    }
    catch (e) {
      console.log('Missing node ID: ' + JSON.stringify(json));
      return '';
    }
  };

  var name = function (json) {
    try {
      return json.nodeinfo.hostname;
    }
    catch (e) {
      console.log('Missing hostname: ' + JSON.stringify(json));
      return '';
    }
  };

  var online = function (json) {
    try {
      return json.flags.online;
    }
    catch (e) {
      console.log('Missing online flag: ' + JSON.stringify(json));
      return false;
    }
  };

  var uptime = function (json) {
    try {
      return json.flags.gateway ? 0 : json.statistics.uptime;
    }
    catch (e) {
      console.log('Missing uptime: ' + JSON.stringify(json));
      return 0;
    }
  };

  var clients = function (json) {
    try {
      return json.statistics.clients;
    }
    catch (e) {
      console.log('Missing clients: ' + JSON.stringify(json));
      return 0;
    }
  };

  var location = function (json) {
    try {
      return json.flags.gateway ? undefined : json.nodeinfo.location;
    }
    catch (e) {
      console.log('Missing location: ' + JSON.stringify(json));
      return undefined;
    }
  };

  var firmware = function (json) {
    try {
      return json.flags.gateway ? '' : json.nodeinfo.software.firmware.release;
    }
    catch (e) {
      console.log('Missing firmware: ' + JSON.stringify(json));
      return '';
    }
  }

  var model = function (json) {
    try {
      return json.flags.gateway ? '' : json.nodeinfo.hardware.model;
    }
    catch (e) {
      console.log('Missing model: ' + JSON.stringify(json));
      return '';
    }
  }

  ffnds.node = {
    id: id,
    name: name,
    online: online,
    uptime: uptime,
    clients: clients,
    location: location,
    firmware: firmware,
    model: model,
  };
}());
