import React from 'react';
import ReactDOM from'react-dom';

class Visualtypes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDatatype: 'All'
    };

    this.updateDatatype = this.updateDatatype.bind(this);
  }
  updateDatatype(type) {
    this.setState(function () {
      return {
        selectedDatatype: type
      }
    });
  }

  render() {
    var datatypes = ["All", "Axis", "Chart", "Data Circles", "Scatter Plot", "X Y Axis"];

    return (
      <ul className="datatypes">
        {datatypes.map((type) => {
          return (
            <li
              style={type === this.state.selectedDatatype ? { color: '#d0021b'}: null}
              onClick={this.updateDatatype.bind(null, type)}
              key={type}>
              {type}
            </li>
          )
        })}
      </ul>
    )
  }
}

export default Visualtypes;
