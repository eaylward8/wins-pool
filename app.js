var teams = ["49ers", "Bears", "Bengals", "Bills", "Broncos", "Browns", "Buccaneers", "Cardinals", "Chargers", "Chiefs",
             "Colts", "Cowboys", "Dolphins", "Eagles", "Falcons", "Giants", "Jaguars", "Jets", "Lions", "Packers",
             "Panthers", "Patriots", "Raiders", "Rams", "Ravens", "Redskins", "Saints", "Seahawks", "Steelers",
             "Texans", "Titans", "Vikings"]

var teamData = teams.reduce(function(acc, team) {
  acc[team] = { w: 0, l: 0, t: 0, diff: 0 };
  return acc;
}, {});

var ownerTeamList = [
  { owner: 'Ali', teams: ['Patriots', 'Seahawks', 'Lions'], records: [], wins: 0, losses: 0, ties: 0, diff: 0 },
  { owner: 'Wads', teams: ['Steelers', 'Titans', 'Buccaneers'], records: [], wins: 0, losses: 0, ties: 0, diff: 0 },
  { owner: 'Barrasse', teams: ['Packers', 'Chiefs', 'Bills'], records: [], wins: 0, losses: 0, ties: 0, diff: 0 },
  { owner: 'Gar', teams: ['Rams', 'Ravens', 'Cowboys'], records: [], wins: 0, losses: 0, ties: 0, diff: 0 },
  { owner: 'Rick', teams: ['Vikings', '49ers', 'Jets'], records: [], wins: 0, losses: 0, ties: 0, diff: 0 },
  { owner: 'Smith', teams: ['Eagles', 'Redskins', 'Dolphins'], records: [], wins: 0, losses: 0, ties: 0, diff: 0 },
  { owner: 'Abdo', teams: ['Saints', 'Broncos', 'Bears'], records: [], wins: 0, losses: 0, ties: 0, diff: 0 },
  { owner: 'Stimp', teams: ['Jaguars', 'Raiders', 'Colts'], records: [], wins: 0, losses: 0, ties: 0, diff: 0 },
  { owner: 'Denim', teams: ['Chargers', 'Panthers', 'Giants'], records: [], wins: 0, losses: 0, ties: 0, diff: 0 },
  { owner: 'Mio', teams: ['Texans', 'Falcons', 'Bengals'], records: [], wins: 0, losses: 0, ties: 0, diff: 0 }
]

function associateRecords() {
  ownerTeamList.map(function(ownerTeam) {
    // ownerTeam.records = [];
    // ownerTeam.wins = 0;
    // ownerTeam.losses = 0;
    // ownerTeam.ties = 0;
    // ownerTeam.diff = 0;
    ownerTeam.teams.forEach(function(team) {
      ownerTeam.records.push({ [team]: teamData[team] });
      ownerTeam.wins += teamData[team]['w']
      ownerTeam.losses += teamData[team]['l']
      ownerTeam.ties += teamData[team]['t']
      ownerTeam.diff += teamData[team]['diff']
    })
    return ownerTeam;
  })
  return sortStandings(ownerTeamList);
}

function sortStandings(records) {
  return records.sort(function(ownerA, ownerB) {
    if (ownerA.wins > ownerB.wins) { return -1 }
    if (ownerA.wins < ownerB.wins) { return 1 }

    if (ownerA.losses < ownerB.losses) { return -1 }
    if (ownerA.losses > ownerB.losses) { return 1 }

    if (ownerA.diff > ownerB.diff) { return -1 }
    if (ownerA.diff < ownerB.diff) { return 1 }
  });
}

function sendRequest(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        resolve(this.responseXML);
      } else {
        reject({ status: this.status });
      }
    }
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
  })
}

function appendRows() {
  var tbody = document.querySelector('tbody');
  ownerTeamList.forEach(function(ownerTeam) {
    var tr = document.createElement('tr');
    Object.keys(ownerTeam).forEach(function(key) {
      if (key === 'records') { return; }
      var td = document.createElement('td');
      key === 'teams' ? td.textContent = ownerTeam[key].join(', ') : td.textContent = ownerTeam[key];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function scrapeScoreData(html) {
  html.querySelectorAll('table.teams tbody').forEach(function(body) {
    var winnerRow = body.querySelector('.winner');
    var loserRow = body.querySelector('.loser');
    var drawRows = body.querySelectorAll('.draw');

    if (winnerRow && loserRow) {
      updateWinLoss(winnerRow, loserRow);
    }

    if (drawRows.length > 0) {
      updateDraw(drawRows);
    }
  })
}

function updateWinLoss(winnerRow, loserRow) {
  var winner = winnerRow.firstElementChild.textContent.split(' ').pop();
  var wScore = parseInt(winnerRow.querySelector('td.right').textContent);
  var loser = loserRow.firstElementChild.textContent.split(' ').pop();
  var lScore = parseInt(loserRow.querySelector('td.right').textContent);

  teamData[winner]['w'] += 1;
  teamData[winner]['diff'] += (wScore - lScore);
  teamData[loser]['l'] += 1;
  teamData[loser]['diff'] += (lScore - wScore);
}

function updateDraw(drawRows) {
  var team1 = drawRows[0].firstElementChild.textContent.split(' ').pop();
  var team2 = drawRows[1].firstElementChild.textContent.split(' ').pop();

  teamData[team1]['t'] += 1;
  teamData[team2]['t'] += 1;
}

// RUN
function run() {
  promises = [];
  for (var i = 1; i <= 2; i++) {
    var url = 'https://secret-coast-86046.herokuapp.com/https://www.pro-football-reference.com/years/2018/week_' + i + '.htm'
    promises.push(sendRequest(url));
  }
  Promise.all(promises).then(function(htmls) {
    htmls.forEach(function(html) {
      scrapeScoreData(html);
    })
    associateRecords();
    appendRows();
  });
}

run();


// fetch('https://cors-anywhere.herokuapp.com/https://www.pro-football-reference.com/years/2018/week_1.htm')
//   .then(function(res) {
//     return res.text();
//   })
//   .then(function(html) {
//     debugger;
//     // need to create new DOMParser and feed it the html string
//     scrapeScoreData(html);
//     console.log(teamData);
//   });
