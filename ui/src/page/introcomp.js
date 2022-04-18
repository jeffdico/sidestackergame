

import React from "react"
import {Navigate} from "react-router-dom"
import {POST} from "./http"
import { useSelector, useDispatch } from 'react-redux'




export default class IntroComp extends React.Component {

	constructor(props){

		super(props);
		this.props = props;
		this.state = {
			
			errors: {},
			data: {}, 
			redirect: false,
			redirect_url: null 
		}

		this.change_func = this.change_func.bind(this)
		this.submit_data = this.submit_data.bind(this)

		this.post_resp = this.post_resp.bind(this); 
		this.handle_failed = this.handle_failed.bind(this);

	}

	render(){

  
		return (
			<div className="col-md-6 offset-md-3 mt-4">
				<div className="flex-row justify-content-center align-items-center" style={{minHeight: "500px"}}>
					<div>
						
						<p className='alert alert-warning text-center'> 
							Side stacker game built for humans. <br/> 
							To start, select player symbols
						</p>

						<div className="mb-4">
							{
								this.state.errors.player_one? <span className='text-danger'> {this.state.errors.player_one}</span> : null 
							}
							<br/>
							<label htmlFor="player_one"> Player One </label>
							<select name="player_one" onChange={this.change_func} className='form-control form-control-lg' id="playerone">
								<option value="-1">Select Symbol</option>
								<option value="o">O</option>
								<option value="x">X</option>
							</select> 
						</div>

						<div className="mb-4">
							{
								this.state.errors.player_two? <span className='text-danger'> {this.state.errors.player_two}</span> : null 
							}
							<br/>
							<label htmlFor="player_two"> Player Two </label>
							<select name="player_two" onChange={this.change_func} className='form-control form-control-lg' id="playertwo">
								<option value="-1">Select Symbol</option>
								<option value="o">O</option>
								<option value="x">X</option>
							</select> 
						</div>	
						<div className="mb-4 d-grid">
							<button onClick={this.submit_data} className='btn btn-success btn-lg'>
								{this.state.loading === true? "Loading" : "Start Game" }
							</button>
						</div>	

					</div>

				</div>	
				
			</div>
		)
	}

	change_func(e){

		const {data} = this.state; 
		data[e.target.name] = e.target.value;
		this.setState({data: data})

	}
	
	submit_data(){

		const {data} = this.state; 

		POST("/", data, this.post_resp, this.handle_failed)
		this.setState({loading: true})

	}

	post_resp(resp){

		
		if (resp.status === -1 ){

			this.setState({
				loading: false,
				errors: resp.errors 
			})

			return 
		}

		const playdata = { 	 
			'current_player': resp.current_player		 
		}

		this.props.navigate(`/plays/${resp.session}`, {state: playdata})
 

	}

	handle_failed(resp){

		
		this.setState({
			errors: resp.errors,
			loading: false 
		})

	}


}