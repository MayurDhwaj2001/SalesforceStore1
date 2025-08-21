var app = angular.module("myApp", []);

app.controller("ProductController", function ($scope, $http, $window) {
  const clientId =
    "3MVG95mg0lk4batgI8YqVaxwFkNvoicKKC.LbD2LazFQtoEoQZaR7xw619onSWHb77cVJZ3L3VeDksSDonvjR";
  const redirectUri = "https://mayurdhwaj2001.github.io/SalesforceStore1/";
  const loginUrl = "https://login.salesforce.com";
  const authUrl = `${loginUrl}/services/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}`;

  $scope.products = [];
  $scope.isLoggedIn = false;

  // Step 1: Redirect to Salesforce login
  $scope.login = function () {
    $window.location.href = authUrl;
  };

  // Step 2: Extract token + instance_url from URL fragment
  function parseFragment(hash) {
    const params = {};
    if (!hash) return params;
    hash
      .substring(1)
      .split("&")
      .forEach((pair) => {
        const [key, value] = pair.split("=");
        params[key] = decodeURIComponent(value || "");
      });
    return params;
  }

  const fragment = parseFragment($window.location.hash);
  if (fragment.access_token && fragment.instance_url) {
    const accessToken = fragment.access_token;
    const instanceUrl = fragment.instance_url;
    $scope.isLoggedIn = true;

    // Step 3: Call Salesforce API
    $http
      .get(
        `${instanceUrl}/services/data/v61.0/query/?q=${encodeURIComponent(
          "SELECT Id, Name, ProductCode FROM Product2"
        )}`,
        { headers: { Authorization: "Bearer " + accessToken } }
      )
      .then(
        function (response) {
          $scope.products = response.data.records;
        },
        function (error) {
          console.error("Error fetching products:", error);
        }
      );

    // Save token for reuse (optional)
    $window.sessionStorage.setItem("sf_access_token", accessToken);
    $window.sessionStorage.setItem("sf_instance_url", instanceUrl);
  }

  // Step 4: Logout
  $scope.logout = function () {
    $scope.products = [];
    $scope.isLoggedIn = false;

    // Clear sessionStorage
    $window.sessionStorage.removeItem("sf_access_token");
    $window.sessionStorage.removeItem("sf_instance_url");

    // Redirect to Salesforce logout
    // $window.location.href = `${loginUrl}/secur/logout.jsp?retUrl=${encodeURIComponent(
    //   redirectUri
    // )}`;
  };
});
