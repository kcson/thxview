import React, {Component} from 'react';

export default class MapPalce extends Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.props.text !== nextProps.text) ||
            (this.props.lat !== nextProps.lat) ||
            (this.props.lng !== nextProps.lng)
  }

  render() {
    const markerStyle = {
      position: 'absolute',
      backgroundColor: 'rgba(255, 0, 0, 0.5)',
      color: 'black',
      fontSize: 16,
      fontWeight: 'bold',
      padding: 4,
      display: 'flex',
      alignItems: 'center'
    };

    let baseWidth = 30;
    //baseWidth = baseWidth  +  Math.ceil(this.props.text / 100) * 5;
    baseWidth = baseWidth  +  Math.log10(this.props.text) * 5;
    markerStyle.width = baseWidth;
    markerStyle.height = baseWidth;
    markerStyle.left = -baseWidth / 2;
    markerStyle.top = -baseWidth / 2;
    markerStyle.borderRadius = baseWidth;

    return (
        <div style={markerStyle}>
          <span style={{margin: 'auto'}}>{this.props.text}</span>
        </div>
    );
  }
}