/* global require console process Promise module */

const express = require('express'),
  app = express();

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getTail() {
  let c = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ];
  return `N${getRandomInt(9999)}${c[getRandomInt(c.length - 1)]}`;
}

function getService() {
  const services = [
    'SUB', // Suburbano
    'REG', // Regionale
    'RGX', // Regionale Express
    'IRG', // Inter-regionale
    'ICG', // InterCity Giorno
    'ICN', // InterCity Notte
    'FRB', // Frecciabianca
    'FRA', // Frecciaargento
    'FRR', // Frecciarossa
    'ITL', // .italo
    'TGV', // Tren de Grand Vitesse
    'EUC', // EuroCity
    'EUS' // EuroStar
  ];
  return services[getRandomInt(services.length - 1)];
}

function getTime() {
  return '01:23';
}

function getTrainNO() {
  return getRandomInt(2000);
}
// what is this?
function getHeading() {
  return getRandomInt(359)
    .toString()
    .padStart(3, '0');
}

function getPLTF() {
  const g = getRandomInt(30);
  return `g`;
}

function getCity() {
  const cities = [
    'Torino Porta Nuova',
    'Milano Centrale',
    'Genova Piazza Principe',
    'Roma Termini',
    'Napoli Centrale',
    'Venezia Santa Lucia',
    'Bari Centrale',
    'Reggio Calabria Centrale',
    'Reggio Emilia Mediopadan AV',
    'Firenze Santa Maria Novella',
    'Verona Porta Nuova',
    'Triestre Centrale',
    'Zurigo HB',
    'Parigi Gare De Lyon',
    'Marsiglia St. Charles',
    'Bolzano',
    'Lecce',
    'Catania',
    'Rimini',
    'Udine'
  ];
  return cities[getRandomInt(20)];
}

function getTime() {
  let hrs = getRandomInt(23)
    .toString()
    .padStart(2, '0');
  let mins = getRandomInt(59)
    .toString()
    .padStart(2, '0');
  return `${hrs}${mins}`;
}

// ========================================================================
// API

app.use('/api/arrivals', (req, res) => {
  let r = {
    data: []
  };

  for (let i = 0; i < 18; i++) {
    // Create the data for a row.
    let data = {
      airline: getService(),
      flight: getTrainNO(),
      city: getCity(),
      gate: getPLTF(),
      scheduled: getTime()
    };

    // Let's add an occasional delayed flight.
    data.status = getRandomInt(10) > 7 ? 'B' : 'A';
    if (data.status === 'B') {
      data.remarks = `Delayed ${getRandomInt(50)}M`;
    }

    // Add the row the the response.
    r.data.push(data);
  }

  res.json(r);
});

// ========================================================================
// STATIC FILES
app.use('/', express.static('public'));

// ========================================================================
// WEB SERVER
const port = process.env.PORT || 8080;
app.listen(port);
console.log('split flap started on port ' + port);
