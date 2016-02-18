




var Bootstrap = React.createClass({displayName: "Bootstrap",

    componentWillMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["page"],
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "CSSReveal"
    	);
    },

    componentDidMount: function () {
        var me = this;
        window.addEventListener( "message" , function(event) {
            if ( event.data.action == "cssreveal" ) {
                //me.add( event.data.target , event.data.filters );
                if ( !CSSRevealModel.csscomps_lookup[ event.data.target ] ) {
                    CSSRevealModel.csscomps_lookup[ event.data.target ] = event.data;
                    CSSRevealModel.csscomps.push( event.data );
                }
                console.log( CSSRevealModel );
            }
        }, false);

        RouteState.listenToHash();
		RS = RouteState;
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "CSSReveal" );
    },

    /*
    add: function ( target , filters ) {

        var iframe = document.querySelector("#cssreveal_target");
        var div = iframe.contentWindow.document.querySelector( target );
        var clone = div.cloneNode( true );

        var allNodes = clone.querySelectorAll("*");
        clone.removeAttribute("data-reactid");
        Array.prototype.forEach.call(allNodes, function(el, i){
            el.removeAttribute("data-reactid");
        });

        var filterNodes,filter;
        for ( var i=0; i<filters.length; i++ ) {
            filter = filters[i];
            //clone.querySelector( filters[i] ).remove();
            filterNodes = clone.querySelectorAll( filter[0] );
            Array.prototype.forEach.call( filterNodes , function(el, i) {
                if ( i >= filter[1] )
                    el.parentNode.removeChild( el );
            });
        }

        var today = new Date();
        var time_taken = today.toLocaleFormat('%d-%b-%Y'); // 30-Dec-2011

        // add note after CSSModeling is updated to deal with semicolons.
        var note = "";//"<div style='font-size: 11px; color: #aaa; position: fixed; bottom: 10px; right: 10px;'>snapshot taken: " + time_taken + "</div>";
        alert( clone.outerHTML );

    }

    */

    render: function() {
        return React.createElement("div", {className: "c-bootstrap", onClick:  function () { RS.merge({'app':'show'}) }}, 
            React.createElement("iframe", {id: "cssreveal_target", src:  this.props.url + '?' + Math.random(), height: "96%"}), 
            React.createElement(CSSRevealApp, null)
        );
    }

});








var CSSRevealApp = React.createClass({displayName: "CSSRevealApp",

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
            comp_list.push( React.createElement("div", null,  csscomp.target) );
        }

        return React.createElement("div", {className: "c-cssrevealapp"}, 
             comp_list 

        );
    }

});
