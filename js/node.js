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
      var uptime = json.statistics.uptime;
      return typeof(uptime) === 'number' ? uptime : 0;
    }
    catch (e) {
      console.log('Missing uptime: ' + JSON.stringify(json));
      return 0;
    }
  };

  var clients = function (json) {
    try {
      var clients = json.statistics.clients;
      return typeof(clients) === 'number' ? clients : 0;
    }
    catch (e) {
      console.log('Missing clients: ' + JSON.stringify(json));
      return 0;
    }
  };

  var location = function (json) {
    try {
      return json.nodeinfo.location ? json.nodeinfo.location : '';
    }
    catch (e) {
      console.log('Missing location: ' + JSON.stringify(json));
      return undefined;
    }
  };

  var firmware = function (json) {
    try {
      var sw = json.nodeinfo.software;
      return sw.firmware && sw.firmware.release ? sw.firmware.release : '';
    }
    catch (e) {
      console.log('Missing firmware release: ' + JSON.stringify(json));
      return '';
    }
  }

  var model = function (json) {
    try {
      var hw = json.nodeinfo.hardware;
      return hw && hw.model ? hw.model : '';
    }
    catch (e) {
      console.log('Missing hardware model: ' + JSON.stringify(json));
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
