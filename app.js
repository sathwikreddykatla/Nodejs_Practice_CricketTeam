const express = require('express')
const app = express()
const path = require('path')
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
const initializeDBserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBserver()
//get player details
app.get('/players/', async (request, response) => {
  const get_player_details_query = `SELECT *
     FROM cricket_team
     ORDER BY player_id
     LIMIT 15`
  const db_result = await db.all(get_player_details_query)
  await db_result.map(each_player =>
    convertDbObjectToResponseObject(each_player),
  )
  response.send(db_result)
})
// post player_details
app.post('/players/', async (request, response) => {
  const player_keys = request.body
  const {player_name, jersey_number, role} = player_keys
  const post_player_details_query = `INSERT INTO cricket_team (player_name,jersey_number,role)
  VALUES 
  ("${player_name}",
  "${jersey_number}",
  "${role}");'
  `
  await db.run(post_player_details_query)
  response.send('Player Added to Team')
})
// get player with id
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const get_playerdetailsById_query = `SELECT *
  FROM cricket_team
  WHERE player_id="${playerId}";`
  const result = await db.get(get_playerdetailsById_query)
  response.send(convertDbObjectToResponseObject(result))
})
// update player details
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const player_details = request.body
  const {player_name, jersey_number, role} = player_details
  const update_query = `UPDATE cricket_team
    SET 
      player_name="${player_name}",
      jersey_number="${jersey_number}",
      role="${role}"
    WHERE player_id="${playerId}";`
  await db.run(update_query)
  response.send('Player Details Updated')
})
// delete player details
app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const delete_query = `DELETE FROM
      cricket_team
   WHERE player_id="${playerId}"`
  await db.run(delete_query)
  response.send('Player Removed')
})
module.exports = app
