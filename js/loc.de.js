if (!ffnds) var ffnds = {};

(function () {
  var dict = {
    Uptime: 'Laufzeit',
    Model: 'Modell',
    Uptime_Days_Hours: '{}d {}h',
    Uptime_Hours: '{}h',
    Sum_Online_Total: '{} / {}',
    Updated_Timestamp: 'Stand: {}',
  };

  ffnds.loc = function (key) {
    var value = key;
    if (dict.hasOwnProperty(key)) {
      value = dict[key];
    }
    var i = 1;
    while (i < arguments.length) {
      value = value.replace('{}', arguments[i++]);
    }
    return value;
  };
}());
