var teams = ["49ers", "Bears", "Bengals", "Bills", "Broncos", "Browns", "Buccaneers", "Cardinals", "Chargers", "Chiefs",
             "Colts", "Cowboys", "Dolphins", "Eagles", "Falcons", "Giants", "Jaguars", "Jets", "Lions", "Packers",
             "Panthers", "Patriots", "Raiders", "Rams", "Ravens", "Redskins", "Saints", "Seahawks", "Steelers",
             "Texans", "Titans", "Vikings"]

var teamData = teams.reduce(function(acc, team) {
  acc[team] = { w: 0, l: 0, t: 0, diff: 0 };
  return acc;
}, {});

var ownerTeamList = [
  { owner: 'Ali', teams: ['Patriots', 'Seahawks', 'Lions'] },
  { owner: 'Wads', teams: ['Steelers', 'Titans', 'Buccaneers'] },
  { owner: 'Barrasse', teams: ['Packers', 'Chiefs', 'Bills'] },
  { owner: 'Gar', teams: ['Rams', 'Ravens', 'Cowboys'] },
  { owner: 'Rick', teams: ['Vikings', '49ers', 'Jets'] },
  { owner: 'Smith', teams: ['Eagles', 'Redskins', 'Dolphins'] },
  { owner: 'Abdo', teams: ['Saints', 'Broncos', 'Bears'] },
  { owner: 'Stimp', teams: ['Jaguars', 'Raiders', 'Colts'] },
  { owner: 'Denim', teams: ['Chargers', 'Panthers', 'Giants'] },
  { owner: 'Mio', teams: ['Texans', 'Falcons', 'Bengals'] }
]

function associateRecords() {
  return ownerTeamList.map(function(ownerTeam) {
    ownerTeam.records = [];
    ownerTeam.wins = 0;
    ownerTeam.losses = 0;
    ownerTeam.ties = 0;
    ownerTeam.diff = 0;
    ownerTeam.teams.forEach(function(team) {
      ownerTeam.records.push({ [team]: teamData[team] });
      ownerTeam.wins += teamData[team]['w']
      ownerTeam.losses += teamData[team]['l']
      ownerTeam.ties += teamData[team]['t']
      ownerTeam.diff += teamData[team]['diff']
    })
    return ownerTeam;
  })
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

sendRequest('https://cors-anywhere.herokuapp.com/https://www.pro-football-reference.com/years/2018/week_1.htm')
  .then(function(html) {
    scrapeScoreData(html);
    // console.log(teamData);
    console.log(associateRecords());

    appendRows()
  });

function appendRows() {
  var tbody = document.querySelector('tbody');
  ownerTeamList.forEach(function(ownerTeam) {
    var tr = document.createElement('tr');
    Object.keys(ownerTeam).forEach(function(key) {
      if (key === 'records') { return; }
      var td = document.createElement('td');
      td.textContent = ownerTeam[key];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

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
