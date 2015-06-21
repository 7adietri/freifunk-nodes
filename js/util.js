if (!ffnds) var ffnds = {};

(function () {
  var hasReplaceState = (typeof window.history.replaceState === 'function');

  // Update homepage link according to config.js.
  var init_homepage = function () {
    var homepage = document.getElementById('homepage');
    if (ffnds.config.homepage_url) {
      homepage.href = ffnds.config.homepage_url;
    }
    if (ffnds.config.homepage_text) {
      homepage.text = ffnds.config.homepage_text;
    }
  };

  // Parse a comma-separated, case-insensitive regex filter.
  // Escaped characters: '.' and '+'
  var parse_filter = function (filter_string) {
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
  var set_fragment = function (fragment) {
    window.location.hash = '#' + fragment;
    var href = window.location.href;
    if (!fragment && href.slice(-1) === '#' && hasReplaceState) {
      history.replaceState({}, '', href.slice(0, -1));
    }
  };

  ffnds.util = {
    init_homepage: init_homepage,
    parse_filter: parse_filter,
    set_fragment: set_fragment,
  };
}());
