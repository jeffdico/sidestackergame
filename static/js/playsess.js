
'use strict';

// const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.props = props ; 
    this.state = { 
        data: [1,2,3,4,5]
    };
  }

  render() {
     
    return (<div jsx className="col-md-6 offset-md-3"> 
        <ul> 
        {
          this.state.data.map((itm, idx)=> <li> {itm} </li>)
        }
        </ul>      
      
      </div>)
  }

  componentDidMount(){
      console.log(axios)
  }
}


ReactDOM.render(LikeButton, document.getElementById('root'));