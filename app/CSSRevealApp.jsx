






var CSSRevealApp = React.createClass({

    componentWillMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["app"],
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "CSSRevealApp"
    	);
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "CSSRevealApp" );
    },

    render: function() {

        var comp_list = [],csscomp;
        for ( var i=0; i<CSSRevealModel.csscomps.length; i++ ) {
            csscomp = CSSRevealModel.csscomps[i];
            comp_list.push( <div>{ csscomp.target }</div> );
        }

        return <div className="c-cssrevealapp">
            { comp_list }

        </div>;
    }

});
