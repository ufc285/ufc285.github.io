function getSymbol(num) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  // return only the symbol
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item.symbol;
}

function shrinkNum(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  // if the number has more than 2 whole digits, make digits = 0
  if ((num / item.value).toFixed(0).toString().length > 2) {
    digits = 0;
  }
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") : "0";
}

window.onload = () => {
  setInterval(() => {
    $.get("https://node-1.siricoin.tech:5006/chain/length", function (data) {
      var length = data.result;

      document.getElementById("blocks").innerHTML =
        shrinkNum(length, 1) + "<span>" + getSymbol(length) + "</span>";
    });

    $.get(
      "https://node-1.siricoin.tech:5006/chain/miningInfo",
      function (data) {
        var difficulty = data.result.difficulty;

        var hashrate = difficulty / 1200;

        document.getElementById("hashrate").innerHTML =
          shrinkNum(hashrate, 1) +
          "<span>" +
          getSymbol(hashrate) +
          "H/s</span>";
        document.getElementById("difficulty").innerHTML =
          shrinkNum(difficulty, 1) +
          "<span>" +
          getSymbol(difficulty) +
          "</span>";
      }
    );
  }, 1000);
};
