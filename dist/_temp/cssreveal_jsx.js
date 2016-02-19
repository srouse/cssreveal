




var Bootstrap = React.createClass({displayName: "Bootstrap",


    openApp: function(){
        var csscomp = false;
        if ( CSSRevealModel.csscomps && CSSRevealModel.csscomps.length > 0 ) {
            csscomp = CSSRevealModel.csscomps[0].target;
        }

        RS.merge({
            'app':'show',
            'app.csscomp':csscomp
        });
    },

    render: function() {
        return React.createElement("div", {className: "c-bootstrap"}, 
            React.createElement("div", {className: "c-bootstrap__back", onClick:  this.openApp}), 
            React.createElement("iframe", {id: "cssreveal_target", src:  this.props.url + '?' + Math.random()}), 
            React.createElement("div", {className: "c-bootstrap__back", onClick:  this.openApp}), 
            React.createElement(CSSRevealApp, null)
        );
    }

});



var CSSRevealApp = React.createClass({displayName: "CSSRevealApp",

    componentWillMount: function() {
        var me = this;

        RouteState.listenToHash();
		window.RS = RouteState;


        RouteState.addDiffListeners(
    		["app","csscomp"],
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "CSSRevealApp"
    	);
    },

    componentDidMount: function () {
        var me = this;

        window.addEventListener( "message" , function(event) {
            if ( event.data.action == "cssreveal" ) {
                //me.add( event.data.target , event.data.filters );
                if ( !CSSRevealModel.csscomps_lookup[ event.data.target ] ) {
                    event.data.cleanHTML = me.cleanHTML( event.data );
                    CSSRevealModel.csscomps_lookup[ event.data.target ] = event.data;
                    CSSRevealModel.csscomps.push( event.data );
                }
                me.forceUpdate();
            }
        }, false);
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "CSSRevealApp" );
    },

    componentDidUpdate: function () {
        document.querySelector(".prettyprint").classList.remove("prettyprinted");
        if ( PR ) { PR.prettyPrint(); }
    },

    openCSSComp: function( csscomp ){
        RS.merge({'app.csscomp': encodeURIComponent( csscomp.target ) });
    },

    cleanHTML: function ( comp ) {

        var iframe = document.querySelector("#cssreveal_target");

        if ( !iframe || !comp ) {
            return "";
        }

        var div = iframe.contentWindow.document.querySelector( comp.target );
        var clone = div.cloneNode( true );

        var allNodes = clone.querySelectorAll("*");
        clone.removeAttribute("data-reactid");
        Array.prototype.forEach.call(allNodes, function(el, i){
            el.removeAttribute("data-reactid");
        });

        var filterNodes,filter;
        for ( var i=0; i<comp.filters.length; i++ ) {
            filter = comp.filters[i];
            filterNodes = clone.querySelectorAll( filter[0] );
            Array.prototype.forEach.call( filterNodes , function(el, i) {
                if ( i >= filter[1] )
                    el.parentNode.removeChild( el );
            });
        }

        return html_beautify( clone.outerHTML  , {
                    'indent_inner_html': false,
                    'indent_size': 2,
                    'indent_char': ' ',
                    'wrap_line_length': 50,
                    'brace_style': 'expand',
                    'preserve_newlines': false,
                    'indent_handlebars': false,
                    'extra_liners': ['/html']
                });
    },

    render: function() {

        var focused_csscomp = false;
        if ( RS.route.csscomp ) {
            focused_csscomp = CSSRevealModel.csscomps_lookup[ decodeURIComponent( RS.route.csscomp ) ];
        }

        var comp_list = [],csscomp,xcls;
        for ( var i=CSSRevealModel.csscomps.length-1; i>=0; i-- ) {
            csscomp = CSSRevealModel.csscomps[i];
            xcls = ( focused_csscomp === csscomp ) ? "c-cssreveallist__item--selected" : "";

            comp_list.push(
                React.createElement("div", {className:  "c-cssreveallist__item " + xcls, 
                    key:  csscomp.target, 
                    onClick:  this.openCSSComp.bind( this , csscomp) }, 
                     csscomp.target
                )
            );
        }

        return React.createElement("div", {className: "c-cssrevealapp"}, 
            React.createElement("div", {className: "c-cssrevealapp__back", 
                onClick:  function () { RS.merge({'app':false}) }}), 
            React.createElement("div", {className: "c-cssrevealapp__content"}, 
                React.createElement("div", {className: "c-cssrevealapp__nav c-cssreveallist"}, 
                     comp_list 
                ), 
                React.createElement("div", {className: "c-cssrevealapp__viewer c-cssrevealhtml"}, 
                    React.createElement("pre", {className: "prettyprint lang-html"}, 
                         (( focused_csscomp ) ? focused_csscomp.cleanHTML : "") 
                    )
                )
            ), 
            React.createElement("div", {className: "c-cssrevealapp__back", 
                onClick:  function () { RS.merge({'app':false}) }}, 

                React.createElement("div", {className: "c-cssrevealapp__close", 
                    onClick:  function () { RS.merge({'app':'','d':3}) }}, 
                    "close"
                )
            )
        );
    }

});
