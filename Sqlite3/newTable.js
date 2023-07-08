const initDb = () => {
    const sqlite = require("sqlite3").verbose();
    const dbGames = new sqlite.Database("./games.sqlite", sqlite.OPEN_READWRITE, (err) => {
        if (err) return console.error(err);
    });
    const dbPlayers = new sqlite.Database("./players.sqlite", sqlite.OPEN_READWRITE, (err) =>{
        if (err){
            return console.error(err);
        }
    });

    const sqlGames = "CREATE TABLE IF NOT EXISTS games(ID INTEGER PRIMARY KEY AUTOINCREMENT, hostname TEXT, roles TEXT, gameStarted BOOLEAN, gamecode TEXT)";
    const sqlPlayers = 
    "CREATE TABLE IF NOT EXISTS players(playerID INTEGER PRIMARY KEY AUTOINCREMENT, playername TEXT, isAlive BOOLEAN, role TEXT, gamecode TEXT, FOREIGN KEY(gamecode) REFERENCES games(gamecode))";

    
    dbGames.run(sqlGames);
    dbPlayers.run(sqlPlayers);
}

module.exports = initDb