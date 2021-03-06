import '../styl/game.styl';
import React from 'react';
var $ = require('jquery');


if (React.initializeTouchEvents)
    React.initializeTouchEvents(true);

var Screen = React.createClass({
    getInitialState: function(){
        gameStore.subscribe(function(){
            this.setState({
                field: gameStore.field
            });
        });
        return {
            field: gameStore.field
        }
    },
    render: function(){
        return (
            <div class="Screen">
                <div className="Screen__ctrl">
                    <MoveController/>
                </div>
                <div className="Screen__field">
                    <Field/>
                </div>
            </div>
        );
    }
});
Array.prototype.vecadd = function(a){
    var t = [];
    for (var i=0; i < this.length; i++)
    {
        t.push(this[i]+a[i]);
    }
    return t;
};
Array.prototype.vecdiff = function(a){
    var t = [];
    for (var i=0; i < this.length; i++)
    {
        t.push(this[i]-a[i]);
    }
    return t;
};

Array.prototype.scalar = function(){
    var s = 0;
    for (var i=0; i < this.length; i++)
    {
        s+= this[i]*this[i];
    }
    return Math.sqrt(s);
};

Array.prototype.angle = function(a){
    if (a)
    {
        this.vecdiff(a).angle();
    }
    else
    {
        return Math.atan2(this[1], this[0])*180/Math.PI;
    }
};

Array.prototype.rads = function(a){
    if (a)
    {
        this.vecdiff(a).rads();
    }
    else
    {
        return Math.atan2(this[1], this[0]);
    }
};

Array.prototype.invert = function(n){
    return this.map(function(x, i){
        if (typeof(n)=='undefined')
        {
            return -x;
        }
        if (i==n)
            return -x;
        return x;
    });
};

var MoveController = React.createClass({
    getInitialState: function(){
        return {
            active: true,
            touch: null,
            position: [0,0]
        };
    },
    render: function(){
        var style = {
            left: this.state.position[0]+'px',
            top: this.state.position[1]+'px',
			transition: this.state.active ? 'none' : 'all 0.2s'
        };
        return (<div className="MoveController" onTouchStart={this._touchStart} onTouchEnd={this._touchEnd}
                    onTouchMove={this._touchMove} ref='ctrl'>
            <span className="MoveController__move" ref='move' style={style}></span>
        </div>);
    },
    _touchStart: function(e){
        e.preventDefault();
        var targetTouches = e.targetTouches;
        if (targetTouches.length > 1)
        {
            return;
        }
        this.setState({touch: targetTouches[0].identifier, active: true});
        var pos = [targetTouches[0].pageX, targetTouches[0].pageY];
        //var center = this.getCenter();
        var $ctrl = $(React.findDOMNode(this.refs.ctrl));
        var $move = $(React.findDOMNode(this.refs.move));
        var moveFix = [Math.round($move.width()/2), Math.round($move.height()/2)];
        var center = [Math.round(($ctrl.width())/2), Math.round(($ctrl.height())/2)];
        var offset = $ctrl.offset();
        offset = [offset.left, offset.top];
        var globCenter = offset.vecadd(center);
        var diff = pos.vecdiff(globCenter).invert();
        console.log(diff);
        console.log(this.getDirection(diff));
        var maxRad = Math.round($ctrl.width()/2-($move.width()/2));
        if (diff.scalar() > maxRad)
        {
            var rads = diff.rads();
            this.setState({
                position: center.vecdiff([Math.cos(rads)*maxRad, Math.sin(rads)*maxRad]).vecdiff(moveFix)
            });
        }
        else
        {
            this.setState({position: pos.vecdiff(offset).vecdiff(moveFix)});
        }
    },
    _touchEnd: function(e){
        e.preventDefault();
        var targetTouches = e.targetTouches;
        var isFound = false;
        for (var i=0; i<targetTouches.length; i++)
        {
            if (targetTouches[i].identifier == this.state.touch)
            {
                isFound = true;

            }
        }
        if (!isFound)
        {
            this.setState({touch: null, active: false});
            this.setToCenter();
        }
    },
    _touchMove: function(e){
        e.preventDefault();
        if (this.state.touch!=null)
        {
            var targetTouches = e.targetTouches;
            for (var i=0; i<targetTouches.length; i++)
            {
                if (targetTouches[i].identifier == this.state.touch)
                {
                    var pos = [targetTouches[i].pageX, targetTouches[i].pageY];
                    //var center = this.getCenter();
                    var $ctrl = $(React.findDOMNode(this.refs.ctrl));
                    var $move = $(React.findDOMNode(this.refs.move));
                    var moveFix = [Math.round($move.width()/2), Math.round($move.height()/2)];
                    var center = [Math.round(($ctrl.width())/2), Math.round(($ctrl.height())/2)];
                    var offset = $ctrl.offset();
                    offset = [offset.left, offset.top];
                    var globCenter = offset.vecadd(center);
                    var diff = pos.vecdiff(globCenter).invert();
                    console.log(diff);
                    console.log(this.getDirection(diff.invert(0)));
                    var maxRad = Math.round($ctrl.width()/2-($move.width()/2));
                    if (diff.scalar() > maxRad)
                    {
                        var rads = diff.rads();
                        this.setState({
                            position: center.vecdiff([Math.cos(rads)*maxRad, Math.sin(rads)*maxRad]).vecdiff(moveFix)
                        });
                    }
                    else
                    {
                        this.setState({position: pos.vecdiff(offset).vecdiff(moveFix)});
                    }
                }
            }
        }
        //e.
    },
    getDirection: function(diff){
        if (diff[0]<0)
        {
            if (Math.abs(diff[0]) > Math.abs(diff[1]))
            {
                return 'west';
            }
            else
            {
                if (diff[1]>0)
                {
                    return 'north';
                }
                else
                    return 'south';
            }
        }
        else
        {
            if (Math.abs(diff[0]) > Math.abs(diff[1]))
            {
                return 'east';
            }
            else
            {
                if (diff[1]>0)
                {
                    return 'north';
                }
                else
                    return 'south';
            }
        }
    },
    getCenter: function(){
        var $move = $(React.findDOMNode(this.refs.move));
        var $ctrl = $(React.findDOMNode(this.refs.ctrl));
        var center = [Math.round(($ctrl.width() - $move.width())/2), Math.round(($ctrl.height()- $move.height())/2)];
        return center;
    },
    setToCenter: function(){
        this.setState({
            position: this.getCenter()
        });
    },
    componentDidMount: function(){
        this.setToCenter();
    }
});

var Field = React.createClass({
    getInitialState: function(){
        gameStore.subscribe(function() {
            this.setState({field: gameStore.field});
        });
        return {
            field: gameStore.field
        }
    },
    render: function(){
        var rows = this.state.field.map(function(r, num){
            var tiles = r.map(function(t, i){
                return (<Tile data={t} key={i}/>);
            });
            return (<div className="field__row" key={num}>{tiles}</div>);
        })

        return (<div className="field">{rows}</div>);
    }
});

var Tile = React.createClass({
    render: function() {
        var style = {background: this.props.data};
        return <div className="tile" style={style}></div>
    }
});

function generateRandomColor(){
    var color = '#';
    for (var i=0; i<6; i++)
    {
        color+=Math.floor(Math.random()*16).toString(16);
    }
    return color;
}

function createField(w, h){
    var a = [];
    for (var i=0; i<h; i++)
    {
        var row = [];
        for (var j=0;j<w; j++)
        {
            row.push(generateRandomColor());
        }
        a.push(row);
    }
    return a;
}

var gameStore = {
    field: createField(10, 6),
    gameWorld: function(){

    },
    renderField: function(){

    },
    actions: {
        moveAction: function(action, slot){

        },
        move: function(direction){

        }
    },
    cbs: [],
    subscribe: function(f){
        this.cbs.push(f);
    },
    publish: function(){
        this.cbs.forEach(function(f){f();});
    }
};

React.render(<Screen/>, document.body);
