const MINE_TILE = "mine"
const FLAG_TILE = "flag"
const DEFAULT_TILE = "default"
const ONE_TILE = "one-mine"
const TWO_TILE = "two-mines"
const THREE_TILE = "three-mines"
const FOUR_TILE = "four-mines"
const FIVE_TILE = "five-mines"
const SIX_TILE = "six-mines"
const SEVEN_TILE = "seven-mines"
const EIGHT_TILE = "eight-mines"

const boardHTMLObject = document.getElementById("board");

let difficulty = "easy"
let firstClick = true;
let gameEnded = false;
let gameBoardArray = [];
let minesRemaining = 0;
let TimerInterval = setInterval(TimerCallback, 1000);

function RefreshState()
{
    CleanListeners();
    DisplayGameBoard();
    ListenOnTiles();
}

function GetTileIndicesFromId(tileId)
{
    const idTokenized = tileId.split('-');
    return {i: parseInt(idTokenized[2]), j: parseInt(idTokenized[3])};
}

function GetTileIdFromIndices(i, j)
{
    return `game-tile-${i}-${j}`;
}

function RevealHint()
{
    gameBoardArray.reduce((previous, tileArray) => previous || tileArray.find(tile => tile.hidden && tile.value !== MINE_TILE), undefined).property = "glow";
}

function TimerCallback()
{
    const timerElement = document.getElementById("game-timer");
    const lastTime = parseInt(timerElement.textContent);
    
    if (lastTime >= 999)
        return;
    
    timerElement.textContent = lastTime + 1;
}

function InitTile(value = DEFAULT_TILE)
{
    return {value: value, hidden: true, property: null}
}

function InitTileArray(numTiles = 9)
{
    return Array(numTiles).fill(0).map(t => InitTile())
}

function InitBoard()
{
    const numTiles = difficulty === "hard" ? 24 : (difficulty === "medium" ? 16 : 9)
    
    let gameBoardArray = Array(numTiles).fill(0).map(ta => InitTileArray(numTiles));
    
    return gameBoardArray;
}

function InitMines(clickedI, clickedJ)
{
    let numMines = difficulty === "hard" ? 99 : (difficulty === "medium" ? 40 : 10)
    minesRemaining = numMines;

    while (numMines > 0)
    {
        let i = Math.floor(Math.random() * gameBoardArray.length);
        let j = Math.floor(Math.random() * gameBoardArray[0].length);
        
        
        if (gameBoardArray[i][j].value !== MINE_TILE
            && i !== clickedI && j !== clickedJ)
            {
            gameBoardArray[i][j] = InitTile(MINE_TILE)
            numMines--;
        }
    }
}

function GetTileNode(gameTile, rowIndex, tileIndex)
{
    let div = document.createElement("div");
    div.id = GetTileIdFromIndices(rowIndex, tileIndex);
    div.classList.add("tile")
    div.classList.add(gameTile.hidden ? "hidden" : "visible");
    div.classList.add(gameTile.value);
    div.classList.add(gameTile.property);

    return div;
}

function DisplayGameBoard()
{
    const boardContainerElement = document.createElement("div");
    gameBoardArray.forEach((arrayElement, rowIndex) => {
        let arrayNode = document.createElement("div");
        arrayNode.id = `game-row-${rowIndex}`
        arrayNode.classList.add("row")
        arrayElement.forEach((gameTile, tileIndex) => {
            let gameTileNode = GetTileNode(gameTile, rowIndex, tileIndex);
            arrayNode.appendChild(gameTileNode);
        });
        boardContainerElement.appendChild(arrayNode);
    });
    boardHTMLObject.innerHTML = boardContainerElement.innerHTML;
}

function RevealBoard()
{
    gameBoardArray.forEach(tileArray => tileArray.forEach(tile => tile.hidden = false));
}

function EndGame(didWin)
{
    RevealBoard();
    clearInterval(TimerInterval);
    const gameStatusElement = document.getElementById("game-status");
    if (didWin)
    {
        gameStatusElement.textContent = "Game Won";
    }
    else
    {
        gameStatusElement.textContent = "Game Lost";
    }
    gameEnded = true;
    return;
}

function UpdateMineCount()
{
    const mineCountElement = document.getElementById("mines-left");
    mineCountElement.textContent = minesRemaining;
}

function GetAdjacentTiles(i, j)
{
    const GetIndicesObject = (i, j) => {return {i, j}};
    let adjacentTiles = [];
    const dim = gameBoardArray.length

    if (i - 1 >= 0 && j - 1 >= 0)
        adjacentTiles.push(GetIndicesObject(i - 1, j - 1));
    
    if (i - 1 >= 0 && j + 1 < dim)
        adjacentTiles.push(GetIndicesObject(i - 1, j + 1));

    if (i + 1 < dim && j - 1 >= 0)
        adjacentTiles.push(GetIndicesObject(i + 1, j - 1));

    if (i + 1 < dim && j + 1 < dim)
        adjacentTiles.push(GetIndicesObject(i + 1, j + 1));
    
    if (i - 1 >= 0)
        adjacentTiles.push(GetIndicesObject(i - 1, j));
    
    if (j + 1 < dim)
        adjacentTiles.push(GetIndicesObject(i, j + 1));
    
    if (i + 1 < dim)
        adjacentTiles.push(GetIndicesObject(i + 1, j));
    
    if (j - 1 >= 0)
        adjacentTiles.push(GetIndicesObject(i, j - 1));

    return adjacentTiles.filter((tileObject) => {
        const value = gameBoardArray[tileObject.i][tileObject.j].value;
        const hidden = gameBoardArray[tileObject.i][tileObject.j].hidden;
        return ((hidden) && (value === DEFAULT_TILE || value === MINE_TILE))
    });
}

function GetTileValueFromNumberOfAdjacentMines(numberMinesTileTouches)
{
    var values = {
        1: ONE_TILE,
        2: TWO_TILE,
        3: THREE_TILE,
        4: FOUR_TILE,
        5: FIVE_TILE,
        6: SIX_TILE,
        7: SEVEN_TILE,
        8: EIGHT_TILE,
        "default": EIGHT_TILE
    }

    return (values[numberMinesTileTouches] || values["default"]);
}

function ClearTiles(i, j)
{
    gameBoardArray[i][j].hidden = false;
    gameBoardArray[i][j].property = null;
    
    const adjacentTiles = GetAdjacentTiles(i, j);
    const adjacentTilesNumber = adjacentTiles.length;

    adjacentTilesWithoutMines  = adjacentTiles.filter((tileObject) => gameBoardArray[tileObject.i][tileObject.j].value !== MINE_TILE);
    const isAdjacentToMine = adjacentTilesNumber !== adjacentTilesWithoutMines.length;
    
    if (isAdjacentToMine)
    {
        const numberMinesTileTouches = adjacentTilesNumber - adjacentTilesWithoutMines.length;
        gameBoardArray[i][j].value = GetTileValueFromNumberOfAdjacentMines(numberMinesTileTouches)
    }

    else
        adjacentTilesWithoutMines.forEach(tileIndices => ClearTiles(tileIndices.i, tileIndices.j));

}

function CheckWinCondition()
{
    const hiddenTilesLeft = gameBoardArray.reduce((previous, current) => previous + current.filter(tileArray => tileArray.hidden === true).length, 0)
        return (minesRemaining - hiddenTilesLeft === 0);
}


function HandleTileClick(e)
{
    if (gameEnded)
        return;

    const {i, j} = GetTileIndicesFromId(e.target.id);
    const tile = gameBoardArray[i][j];

    if (firstClick)
    {
        InitMines(i, j)
        firstClick = false;
    }


    UpdateMineCount();

    if (tile.value === MINE_TILE)
    {
        EndGame(false);
        DisplayGameBoard();
        CleanListeners();
        return;
    }

    else
    {
        ClearTiles(i, j);
    }

    if (CheckWinCondition())
        EndGame(true);

    RefreshState();
}

function CleanListeners()
{
    boardHTMLObject.childNodes.forEach(arrayNode => arrayNode.childNodes.forEach(tileNode => tileNode.removeEventListener('click', HandleTileClick)));
}

function ListenOnTiles()
{
    boardHTMLObject.childNodes.forEach(arrayNode => arrayNode.childNodes.forEach(tileNode => {
        tileNode.addEventListener('click', HandleTileClick)
    }));
}

function ResetTimer()
{
    const timerElement = document.getElementById("game-timer");
    timerElement.textContent = 0;
    clearInterval(TimerInterval);
    TimerInterval = setInterval(TimerCallback, 1000);
}

function ResetGame()
{
    firstClick = true;
    gameEnded = false;
    gameBoardArray = InitBoard();
    RefreshState();
    ResetTimer();
}

const difficultyRadioButtons = document.querySelectorAll('input[name="difficulty"]');

const resetButton = document.getElementById("reset-game");

resetButton.addEventListener('click', () => ResetGame())

difficultyRadioButtons.forEach((radioButton) => {
    radioButton.addEventListener('click', (event) => {
        const lastDifficulty = difficulty;
        const selectedDifficulty = event.target.id;
        difficulty = selectedDifficulty;
        lastDifficulty !== selectedDifficulty && ResetGame();
    });
})

const hintButton = document.getElementById("hint");

hintButton.addEventListener('click', (event) => {
    if (gameEnded)
        return;
    
    RevealHint();
    RefreshState();
});

ResetGame();