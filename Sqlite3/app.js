const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const sqlite = require("sqlite3").verbose();
const url = require("url");
const initDb = require("./newTable.js");
const crypto = require("crypto");
let sql;

initDb();

app.use(cors());

const dbGames = new sqlite.Database(
  "./games.sqlite",
  sqlite.OPEN_READWRITE,
  (err) => {
    if (err) return console.error(err);
  }
);

const dbPlayers = new sqlite.Database(
  "./players.sqlite",
  sqlite.OPEN_READWRITE,
  (err) => {
    if (err) {
      return console.error(err);
    }
  }
);

app.use(bodyParser.json());

//POST-Request -> Create a game

app.post("/games", (req, res) => {
  try {
    let { hostname, roles } = req.body;
    if (!hostname) {
      res.json({
        status: 400,
        success: false,
        error: "no hostname provided",
      });
    }

    gamecode = crypto.randomBytes(5).toString("base64url");

    sql =
      "INSERT INTO games(hostname, roles,gameStarted,gamecode) VALUES(?,?,FALSE,?)";

    dbGames.run(
      sql,
      [hostname, JSON.stringify(roles), gamecode],
      (err, result) => {
        if (err) {
          res.json({
            status: 500,
            success: false,
            error: err,
          });
          console.error(err);
          return;
        }
        console.log("successful input ", hostname);
        res.json({
          status: 200,
          success: true,
          gamecode: gamecode,
        });
      }
    );
  } catch (error) {
    res.json()({
      status: 400,
      success: false,
    });
  }
});

//GET-Request -> Get a list of all games

app.get("/games", (req, res) => {
  sql = "SELECT id, hostname, roles, gamecode, gameStarted FROM games";
  try {
    dbGames.all(sql, [], (err, rows) => {
      if (err) {
        console.error(err);
        res.json({
          status: 500,
          success: false,
          error: err,
        });
        return;
      }

      if (rows.length < 1) {
        res.json({
          status: 404,
          success: false,
          error: "no games found",
        });
        return;
      }

      res.json({
        status: 200,
        data: rows.map((row) => ({ ...row, roles: JSON.parse(row.roles) })),
        success: true,
      });
    });
  } catch (error) {
    return res.json()({
      status: 400,
      success: false,
    });
  }
});

// GET-Request -> Get wanted game by gamecode

app.get("/games/:id", (req, res) => {
  const gamecode = req.params.id;
  sql = "SELECT hostname, roles FROM games WHERE gamecode = ?";
  try {
    dbGames.all(sql, [gamecode], (err, rows) => {
      if (err) {
        console.error(err);
        res.json({
          status: 500,
          success: false,
          error: err,
        });
        return;
      }

      if (rows.length < 1) {
        res.json({
          status: 404,
          success: false,
          error: "game not found",
        });
        return;
      }

      res.json({
        status: 200,
        data: rows.map((row) => ({ ...row, roles: JSON.parse(row.roles) })),
        success: true,
      });
    });
  } catch (error) {
    return res.json({
      status: 400,
      success: false,
    });
  }
});

// POST-Request -> Insert a new player to the game

app.post("/players", (req, res) => {
  try {
    let { playername, role, gamecode } = req.body;
    if (!playername || !gamecode) {
      res.json({
        status: 400,
        success: false,
        error: "no playername or gamecode provided",
      });
      return;
    }
    if (!role || role.length === 0) {
      role = "Mensch";
    }

    const checkGameExistsSql =
      "SELECT COUNT(*) AS count FROM games WHERE gamecode = ?";
    dbGames.get(checkGameExistsSql, [gamecode], (err, result) => {
      if (err) {
        res.json({
          status: 500,
          success: false,
          error: err,
        });
        console.error(err);
        return;
      }

      if (result.count === 0) {
        res.json({
          status: 404,
          success: false,
          error: "gamecode not found",
        });
        return;
      }

      const sql =
        "INSERT INTO players (playername, isAlive, role, gamecode) VALUES (?, TRUE, ?, ?)";
      dbPlayers.run(sql, [playername, role, gamecode], function (err) {
        if (err) {
          res.json({
            status: 500,
            success: false,
            error: err,
          });
          console.error(err);
          return;
        }

        const playerID = this.lastID;

        console.log("successful input: ", playername);
        res.json({
          status: 200,
          success: true,
          playerID: playerID,
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: 400,
      success: false,
    });
  }
});

//GET-Request -> Get a list of all games

app.get("/players", (req, res) => {
  const sql =
    "SELECT playerID, playername, role, isAlive, gamecode FROM players";
  try {
    dbPlayers.all(sql, [], (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({
          status: 500,
          success: false,
          error: err,
        });
        return;
      }

      if (rows.length < 1) {
        res.status(404).json({
          status: 404,
          success: false,
          error: "no players found",
        });
        return;
      }

      res.status(200).json({
        status: 200,
        data: rows,
        success: true,
      });
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      success: false,
    });
  }
});

//  PUT-Request is Alive

app.put("/players/:playerID", (req, res) => {
  const playerId = req.params.playerID;
  const { isAlive } = req.body;

  if (isAlive === undefined) {
    return res.json({
      status: 400,
      success: false,
      error: "No fields to update provided",
    });
  }

  const updateFields = ["isAlive = ?"];
  const updateValues = [isAlive];

  const sql = `UPDATE players SET ${updateFields.join(
    ", "
  )} WHERE playerID = ?`;

  try {
    dbPlayers.run(sql, [...updateValues, playerId], (err) => {
      if (err) {
        console.error(err);
        return res.json({
          status: 500,
          success: false,
          error: err,
        });
      }

      res.json({
        status: 200,
        success: true,
        message: "Player updated successfully",
      });
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: 400,
      success: false,
      error: error.message,
    });
  }
});

// PUT-Request -> Change gameStarted to true

app.put("/games/:gamecode", (req, res) => {
  const { gameStarted } = req.body;
  const { gamecode } = req.params;

  if (gameStarted === undefined) {
    return res.status(400).json({
      status: 400,
      success: false,
      error: "Keine zu aktualisierenden Felder angegeben",
    });
  }

  const updateFields = ["gameStarted = ?"];
  const updateValues = [gameStarted];

  const sqlUpdateGame = `UPDATE games SET ${updateFields.join(
    ", "
  )} WHERE gamecode = ?`;
  const sqlGetGame = "SELECT roles FROM games WHERE gamecode = ?";
  const sqlGetPlayers = "SELECT * FROM players WHERE gamecode = ?";

  try {
    dbGames.run(sqlUpdateGame, [...updateValues, gamecode], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: 500,
          success: false,
          error: err,
        });
      }

      dbGames.get(sqlGetGame, [gamecode], (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: 500,
            success: false,
            error: err,
          });
        }

        const roles = row.roles ? JSON.parse(row.roles) : [];

        dbPlayers.all(sqlGetPlayers, [gamecode], (err, players) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              status: 500,
              success: false,
              error: err,
            });
          }

          function shuffleArray(array) {
            const shuffledArray = [...array];
            for (let i = shuffledArray.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledArray[i], shuffledArray[j]] = [
                shuffledArray[j],
                shuffledArray[i],
              ];
            }
            return shuffledArray;
          }

          const shuffledRoles = shuffleArray(roles);
          const shuffledPlayers = shuffleArray(players);
          const numPlayers = players.length;
          const amountWerewolves = numPlayers > 11 ? 3 : 2;

          const availableRoles = [...shuffledRoles];

          const werewolfIndices = [];

          while (werewolfIndices.length < amountWerewolves) {
            const randomIndex = Math.floor(Math.random() * numPlayers);
            if (!werewolfIndices.includes(randomIndex)) {
              werewolfIndices.push(randomIndex);
            }
          }

          // Zuweisen der Rolle 'Werwolf' an die ausgewählten Spieler
          for (let i = 0; i < numPlayers; i++) {
            const playerID = shuffledPlayers[i].playerID;
            let role;

            if (werewolfIndices.includes(i)) {
              role = "Werwolf";
            } else if (availableRoles.length > 0) {
              // Assign a role from the available roles
              role = availableRoles.pop();
            } else {
              // Assign 'Dorfbewohner' role if no more roles available
              role = "Dorfbewohner";
            }

            dbPlayers.run(
              "UPDATE players SET role = ? WHERE playerID = ?",
              [role, playerID],
              (err) => {
                if (err) {
                  console.error(err);
                }
              }
            );
          }

          res.json({
            status: 200,
            success: true,
            message: "Game Started",
            roles: roles,
            players: players,
          });
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: 400,
      success: false,
      error: error.message,
    });
  }
});

// Remove player from DB 'Players'

app.delete("/players", (req, res) => {
  const { playerID } = req.body;
  const sql = "DELETE FROM players WHERE playerID = ?";

  try {
    dbPlayers.run(sql, [playerID], function (err) {
      if (err) {
        console.error(err);
        res.json({
          status: 500,
          success: false,
          error: err,
        });
        return;
      }

      if (this.changes === 0) {
        res.json({
          status: 404,
          success: false,
          error: "Player not found",
        });
        return;
      }

      res.json({
        status: 200,
        success: true,
        message: "Player deleted successfully",
      });
    });
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      error: error.message,
    });
  }
});

// Remove game from DB 'games'

app.delete("/games", (req, res) => {
  const { gamecode } = req.body;
  const sql = "DELETE FROM games WHERE gamecode = ?";

  try {
    dbGames.run(sql, [gamecode], function (err) {
      if (err) {
        console.error(err);
        res.json({
          status: 500,
          success: false,
          error: err,
        });
        return;
      }

      if (this.changes === 0) {
        res.json({
          status: 404,
          success: false,
          error: "game not found",
        });
        return;
      }

      res.json({
        status: 200,
        success: true,
        message: "game deleted successfully",
      });
    });
  } catch (error) {
    res.json({
      status: 400,
      success: false,
      error: error.message,
    });
  }
});
app.listen(3000);
