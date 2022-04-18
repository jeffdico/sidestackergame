

import React from "react"; 
import {GET, POST} from "./http"; 


function ColumnArea(props){

	return (<>

		<span style={{marginLeft: '10px', padding: "0 20px"}}>{props.row} </span>  
		{
		props.cols.map((inn, colidx) => {

			if (inn === 0){
				return <button className='btn btn-lg btn-light' style={{margin: 6}} onClick={()=>props.selectfunc(props.row, colidx)} > _ </button>
			}

			return <button className={inn === 'x'? 'btn btn-lg btn-warning': "btn btn-lg btn-info"} style={{margin: 6}}> { inn } </button>
		})
		}

	</>)

}
export default class PlayComp extends React.Component {

	constructor(props){

		super(props); 
		this.props = props; 
		this.state = {
				moves: [],				 
				current_player: null,
				active_player_turn: null,

				players: {},
				loading: false, 
				
				errors:{
				},

				play_disable: false,
				data : {},
				gameover: false 
 
			}


		this.initfunc = this.initfunc.bind(this); 
		this.get_resp = this.get_resp.bind(this)
		this.failed_resp = this.failed_resp.bind(this)

		this.select_row_func = this.select_row_func.bind(this) 
		this.publish_move = this.publish_move.bind(this) 

		
		this.post_failed = this.post_failed.bind(this)
		this.quit_func = this.quit_func.bind(this)
		this.switch_players = this.switch_players.bind(this)

		this.refresh = this.refresh.bind(this); 
		this.refresh_resp = this.refresh_resp.bind(this); 
		
		this.change_func = this.change_func.bind(this);
		this.submit_data = this.submit_data.bind(this);

		 

	}

	banner = {
		x: "warning",
		o: 'info'
	}


	render(){

		let design = this.state.current_player == 'x'? 'warning' : "info" ; 
 

  		if (this.state.winplayer !== undefined){

  		}


		return (<div className="col-md-12">

			<div className='row mt-4'>
			<div className={this.state.gameover === true? "col-md-6" : "col-md-6 offset-md-3"}>

						
			<div className="justify-content-center align-items-center minbox" >
			<div>				
			
				<div className={`alert alert-${this.banner[this.state.current_player]}`}> 
					<div style={{display: "flex", justifyContent: "space-between", alignItems: 'center'}}>						
						<p>  
							Active Player: &nbsp; {' '}
							<span style={{fontSize: '1.2em'}}>
								<b>{this.state.current_player } </b> 
							</span> 
							<br/>
							Next To Play: &nbsp; {' '} <span style={{fontSize: '1.8em'}}> <b> {this.state.active_player_turn} </b> </span>

						</p>
						<p className='text-right'>						
							<button onClick={this.switch_players} className={`btn btn-${this.banner[this.state.current_player]} btn-sm`}> switch player </button> 
						</p>

					</div>
				</div>

				<ul className="mb-4 nodecore text-center" >

				<li style={{paddingLeft: "15px"}}>

					{
						[0,0,0,0,0,0,0].map((itm, idx2)=> <span className="btn btn-lg text-center" style={{margin: 6, fontSize: '17px'}} > {idx2} </span> )					
					}

				</li> 


				{
					this.state.moves.map((itm, idx) => <li> <ColumnArea key={`cola-${idx}`} row={idx} cols={itm } selectfunc={this.select_row_func} /> </li>)
				}
				

				</ul>

				<div className='mb-2'>
					{this.state.errors.move? <span className="text-danger"> {this.state.errors.move} </span> : null }

					<input type="text" className='form-control form-control-lg' 
						name="move" placeholder="row no, col no" id="move" onChange={this.change_func} value={this.state.move} 
					/>
				
				</div>
				<div className='d-grid gap-2'>
					{
						this.state.loading === true? (
							<button className="btn btn-lg btn-success" type="button"> please wait... </button> 
						): (<>
							<button onClick={this.submit_data} className="btn btn-lg btn-success"> Play </button>	
							<button onClick={this.quit_func} className="btn btn-lg btn-light"> Quit </button>									
						</>)

					}
				</div>

			</div>
			</div>	
			</div>

			{
				this.state.gameover === true? (
					<div className='col-md-6' style={{backgroundColor: "#eeeeee8c", borderRadius: "5px"}}>
						
						<div className='minbox centerpos'>
						<div style={{width: "85%"}}>
							<h3 className={'text-center'}>
								Game Over 
							</h3> <br/>
							<p className={`alert alert-${this.banner[this.state.winplayer]} mb-4 text-center`}>
								{this.state.game_status} 
							</p>

							<div className='d-grid'>				
								<button onClick={()=> this.props.navigate("/")} className="btn btn-lg btn-success"> Restart Game </button>
							</div>

						</div>
						</div>

					</div>

				) : null 
			}

			</div>

			<style jsx>{`.btn-light{background-color: #eee} 
						.nodecore{list-style: none; padding-left: 0px;} 
						.minbox{min-height: 550px; } 
						.centerpos{
							display: flex;
							flex-direction: column;
							justify-content: center ; 
							align-items : center;

						}`
					} 
			</style>
		</div>
		)
	}

	refresh(){
		
		GET(`/game/${this.state.current_player}/${this.state.session}`, this.get_resp, this.failed_resp)
	}

	refresh_resp(resp){
		if (resp.status === '0'){

			const game = resp.game_info ; 			
			this.setState({				
				moves: game.moves,
				active_player_turn: game.next_player
			})
		}

	}

	initfunc(sess){

		GET(`/game/${this.state.current_player}/${this.state.session}`, this.get_resp, this.failed_resp)
		this.setState({
			loading: true
		})

	}	

	get_resp(resp){	
		
		if (resp.status === 0){

			const game = resp.game_info ;
			
			if (game.gamestatus === 1){

				this.setState({
					gameover: true,
					game_status: `${game.winner} has won the game` ,
					winplayer: game.winner,
					loading: false,
					moves: game.moves,
				})
					
				clearInterval(this.intervalfunc)

				return 
			}

			else if (game.gamestatus === 2){

				this.setState({
					gameover: true,
					game_status: `game is a draw` ,
					winplayer: this.state.current_player,
					loading: false,
					moves: game.moves,
				})

				clearInterval(this.intervalfunc)

				return 
			}


			this.setState({
				
				moves: game.moves,

				active_player_turn: game.next_player,

				players: {
						player_one: game.player_one,
						player_two: game.player_two
					},

				loading: false 
			})
		}

		else if (resp.status === -1) {

			this.setState({
				errors: resp.errors,
				loading: false 
			})
		}
 
	}

	change_func(e){

		const data = this.state.data; 

		data[e.target.name] = e.target.value
		this.setState({data: data})

	}

	submit_data(){

		let tmp = this.state.data.move.split(',');

		const moves = this.state.moves ; 

		if (isNaN(Number(tmp[0])) === true || isNaN(Number(tmp[0]))){			
			alert("invalid move selected")				
			return
		}	

		else if ( Number(tmp[0]) < 0 || Number(tmp[0]) > 6  || Number(tmp[1]) < 0 || Number(tmp[1]) > 6 ){

			alert("invalid row or col value specified.")
			return 
		}

		if (moves[tmp[0]][tmp[1]] !== 0){
			alert("position specified is already taken!!!")
			return 
		}

 		
 		this.select_row_func(tmp[0], tmp[1])

 		this.setState({
 			move: ""
 		})


	}

	failed_resp(resp){
				
		this.setState({
			loading: false 
		})

		alert("application error or unknown session detected.");

	}

	quit_func(){
 		const resp = window.confirm("Are you sure you want to give up at this point?")
 		if (resp){
 			GET(`/gameover/${this.state.current_player}/${this.state.session}`, this.get_resp, this.failed_resp)
 			this.setState({ wintype: {msg: `${this.state.current_player} Quits the game`, player: this.state.current_player}})
 		}

 	}
 
 	switch_players(){

 		this.setState({
 			current_player: this.state.current_player === 'x'? 'o': 'x'
 		}, this.initfunc)

 	}

	componentDidMount(){
		 
		const session = this.props.loc.pathname.split('/')[2]
		
		this.setState({
			session: session,
			current_player: 'x' // default to current player always 
		}, this.initfunc)


		this.intervalfunc = setInterval(
				this.refresh, 3000
			)
 
	}

	componentWillUnmount(){
		clearInterval(this.intervalfunc)
	}

	select_row_func(row, col){
		

		if (this.state.gameover ===  true){
			
			return 
		}
		if (this.state.current_player != this.state.active_player_turn) {
			alert('Please wait for your turn')
			return 
		}

		const cells = this.state.moves;
		
		cells[row][col] = this.state.current_player;

		this.setState({
				moves: cells,
				loading: true 
			},
			this.publish_move
		)

	}

	publish_move(){

		
		const data = {
			moves: this.state.moves 			 
		} 

		const url = `/game/${this.state.active_player_turn}/${this.state.session}`
		
		POST(url, data, this.get_resp, this.post_failed)

	}
		
		
	post_failed(resp){

		alert("application server error issue");

		this.setState({
			loading: false 
		})

	}

 

}
 