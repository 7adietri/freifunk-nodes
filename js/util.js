if (!ffnds) var ffnds = {};

(function () {
  var hasReplaceState = (typeof window.history.replaceState === 'function');

  // Update homepage link according to config.js.
  ffnds.init_homepage = function () {
    var homepage = document.getElementById('homepage');
    if (ffnds.config.homepage_url) {
      homepage.href = ffnds.config.homepage_url;
    }
    if (ffnds.config.homepage_text) {
      homepage.text = ffnds.config.homepage_text;
    }
  };

  // Ensure name property, resolve links, remove clients.
  ffnds.prepare_nodes = function (json) {
    var nodes = json.nodes;
    nodes.forEach(function (d) {
      if (!d.flags.client) {
        if (!d.name) {
          d.name = d.id;
        }
        d.wifi = [];
        d.vpn = [];
      }
    });
    json.links.forEach(function (d) {
      var src = nodes[d.source];
      var dst = nodes[d.target];
      if (d.type === 'vpn') {
        src.vpn.push(dst);
        dst.vpn.push(src);
      } else if (d.type === null) {
        src.wifi.push(dst);
        dst.wifi.push(src);
      }
    });
    return {
      meta: json.meta,
      nodes: nodes.filter(function (d) { return !d.flags.client; })
    };
  };

  // Parse a comma-separated, case-insensitive regex filter.
  // Escaped characters: '.' and '+'
  ffnds.parse_filter = function (filter_string) {
    var filter;
    var regexes = [];
    if (filter_string) {
      filter_string.split(',').forEach(function (p) {
        if (p) {
          p = p.replace(/\./g, '\\.')
          p = p.replace(/\+/g, '\\+')
          regexes.push(new RegExp(p, 'i'));
        }
      });
      filter = function (value) {
        return regexes.some(function (r) { return r.test(value); });
      }
    } else {
      filter = function () {
        return true;
      }
    }
    return filter;
  };

  // Set the URI fragment.
  ffnds.set_fragment = function (fragment) {
    window.location.hash = '#' + fragment;
    var href = window.location.href;
    if (!fragment && href.slice(-1) === '#' && hasReplaceState) {
      history.replaceState({}, '', href.slice(0, -1));
    }
  };
}());
