import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const style = props.isWinning ? {backgroundColor: 'green', color: 'white'} : {}
  return (
    <button className="square" style={style} onClick={props.onClick} >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return <Square key={i} value={this.props.squares[i]} onClick={() => this.props.onClick(i)}/>;
  }

  renderWinningSquare(i) {
    console.log(`Winning square ${i}`)
    return <Square key={i} isWinning= {true} value={this.props.squares[i]} onClick={() => this.props.onClick(i)}/>;
  }

  render() {
    const row = []
    let count = 0;
    const winningLine = this.props.winningLine;

    for(let i =0; i< 3; i++) {
      const column = [];
      for(let j=count; j<count + 3; j++) {
        if (winningLine && winningLine.includes(j)) {
          column.push(this.renderWinningSquare(j));
        } else {
          column.push(this.renderSquare(j));
        }
      }
      row.push(<div key={i} className="board-row">{column}</div>);
      count = count + 3;
    }

    return (
      <div>
        {row}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history:[{
        squares: Array(9).fill(null),
        moves: []
      }],
      xIsNext: true,
      stepNumber: 0,
      sortMoveAsc: false,
      winningLine: null
    };
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  handleClick(i) {
    // Get the history from start to stepNumber
    // stepNumber can be the latest history or older history
    const stepNumber = this.state.stepNumber;
    const history = this.state.history.slice(0, stepNumber + 1); 
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const moves = current.moves.concat([i]);
    const winnerInfo = calculateWinner(current.squares);
    const winner = winnerInfo ? winnerInfo['pattern'] : winnerInfo;

    if(winner || squares[i]) {
      return;
    }

    squares[i] = this.getNextState();
    this.setState({
      // concat does not mutate the array -> so this is preferable to push
      history: history.concat([{
        squares: squares,
        moves: moves
      }]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
    });
  }

  getNextState() {
    return this.state.xIsNext? 'X' : 'O';
  }

  render() {
    // Get the history from start to stepNumber
    // stepNumber can be the latest history or older history
    const stepNumber = this.state.stepNumber;
    const history = this.state.history;
    const current = history[stepNumber];
    const winnerInfo = calculateWinner(current.squares);
    const winner = winnerInfo ? winnerInfo['pattern'] : winnerInfo;
    const sortOrderAsc = this.state.sortMoveAsc;

    let move = history.map((step, move) => {
      let movesHistory = step.moves;
      let moveLocation = getLocation(movesHistory[movesHistory.length - 1])
      const desc = move ? `Go to move #${move} - ${moveLocation}` : `Go to game start`;
      const bold = move === stepNumber && move ? {fontWeight: 'bold'} : {fontWeight: 'normal'}
      // Return those moves list (as buttons)
      return (
        <ul key={move}>
          <button style={bold} onClick={() => this.jumpTo(move)}>{desc}</button>
        </ul>
      );
    })

    // If order is descending, then reverse the move
    if(!sortOrderAsc) {
      move = move.slice().reverse();
    } 

    let status;

    // If there is a winner
    if (winner) {
      status = `Winner is ${winner}`;
      current.winningLine = winnerInfo.line;
    } 
    // If the game is ended without winner or game is calculated to be a draw
    else if(stepNumber === 9) {
      status = 'Draw!!!'
    }
    else {
      status = `Next player: ${this.getNextState()}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} winningLine={current.winningLine} onClick={(i) => this.handleClick(i)}/>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{move}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { pattern: squares[a], line: lines[i]};
    }
  }
  return null;
}

function getLocation(num) {
  if (num < 3) {
    return `[0, ${num}]`;
  } else if (num < 6) {
    return `[1, ${num - 3}]`;
  } else {
    return `[2, ${num - 6}]`;
  }
}