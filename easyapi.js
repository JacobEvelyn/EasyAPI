"use strict";

// easyapi.js
// Jacob Evelyn
// 2014
// TODO: Stop use of Mutation Events.

window.EasyAPI = (function() {
  var data;

  var parseLocation = function() {
    return {
      subdomain: getSubdomain(window.location.hostname.split(".")),
      params: getParams()
    };
  };

  // Return the current subdomain.
  var getSubdomain = function(splitByDots) {
    return splitByDots[0];
  };

  // Return the query parameters in object form.
  var getParams = function() {
    var pair, i;
    var output = {};
    var pairs = window.location.search.slice(1).split("&");

    for (i = 0; i < pairs.length; i++) {
      pair = pairs[i].split("=");

      // Convert string number and boolean values into native types.
      try {
        output[pair[0]] = JSON.parse(pair[1]);
      } catch (e) {
        output[pair[0]] = pair[1];
      }
    }

    return output;
  };

  var redirect = function(media, output) {
    window.location.replace("data:" + media + ";base64," + btoa(output));
  };

  // Format our message to be written.
  var formattedWrite = function(message, error) {
    switch (data.params.format) {
      case "json":
        if (error) {
          redirect("application/json", JSON.stringify({ error: message }));
        } else {
          redirect("application/json", JSON.stringify({ result: message }));
        }
        break;
      case "txt":
        redirect("text/plain", message);
        break;
      case "html":
        window.addEventListener("DOMContentLoaded", function() {
          document.body.innerHTML = message.replace(/&/g, "&amp;").
            replace(/</g, "&lt;").replace(/>/g, "&gt;");
        });
        break;
      default:
        redirect("text/plain", "Invalid format.");
    }
  };

  // Delete the attributes of EasyAPI that mutate our data.
  var makeReadOnly = function() {
    delete EasyAPI.result;
    delete EasyAPI.error;
    delete EasyAPI.setDefaults;
  };

  data = parseLocation();

  // Return our API for EasyAPI: data, output, error.
  return {
    input: function() {
      return data;
    },
    result: function(message) {
      formattedWrite(message);

      // Destroy our EasyAPI object.
      makeReadOnly();
    },
    error: function(message) {
      formattedWrite(message, true);

      // Destroy our EasyAPI object.
      makeReadOnly();
    },
    setDefaults: function(object) {
      var key;
      for (key in object) {
        if (typeof data.params[key] === "undefined") {
          data.params[key] = object[key];
        }
      }
    }
  };
})();
