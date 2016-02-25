

var CSSRevealApp = React.createClass({

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
                event.data.html = me.getHTML( event.data );
                CSSRevealModel.csscomps_lookup[ event.data.target ] = event.data;
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

    getHTML: function ( comp ) {
        var iframe = document.querySelector("#cssreveal_target");

        if ( !iframe || !comp ) {
            return "";
        }

        var div = iframe.contentWindow.document.querySelector( comp.target );

        return div.outerHTML;
    },

    cleanHTML: function ( comp ) {

        // trying to offload as much as possible to this function...
        var clone = document.createElement("div");
        clone.innerHTML = comp.html;

        var allNodes = clone.querySelectorAll("*");
        clone.removeAttribute("data-reactid");
        Array.prototype.forEach.call( allNodes , function(el, i){
            el.removeAttribute("data-reactid");
        });

        var filterNodes,filter;
        for ( var i=0; i<comp.filters.length; i++ ) {
            filter = comp.filters[i];
            filterNodes = clone.querySelectorAll( filter[0] );
            Array.prototype.forEach.call( filterNodes , function(el, i) {
                if ( i >= filter[1] ) {
                    el.parentNode.removeChild( el );
                }
            });
        }

        var formatted_html = this._formatHTMLElement( clone.childNodes[0] , 1 );

        return formatted_html;

        // was missing a lot of elements, so I wrote my own....
        /*return html_beautify( clone.innerHTML  , {
                    'indent_inner_html': false,
                    'indent_size': 2,
                    'indent_char': ' ',
                    'wrap_line_length': 50,
                    'brace_style': 'expand',
                    'preserve_newlines': false,
                    'indent_handlebars': false,
                    'extra_liners': ['/html']
                });*/
    },

        _formatHTMLElement: function ( element , indents ) {
            var html = "";
            var indent_str = Array( indents ).join("\t");
            if ( element.nodeType == 1 ) {
                var clone = element.cloneNode();

                clone.innerHTML = "";

                if ( clone.getAttribute("class") ) {
                    var new_class_str = clone.getAttribute("class").replace( /\s\s+/g , " " );
                    new_class_str = new_class_str.replace( / /g , "\n\t" + indent_str );
                    clone.setAttribute( "class" , new_class_str );
                }

                var clone_arr = clone.outerHTML.split("</");
                var is_single_node = ( clone_arr.length == 1 );

                if ( is_single_node ) {
                    html += indent_str + clone.outerHTML + "\n";
                }else{
                    html += indent_str + clone_arr[0];//+ "\n";

                    var childElement,has_elementChildren = false;
                    for ( var i=0; i< element.childNodes.length; i++ ) {
                       childElement = element.childNodes[i];
                       if ( childElement.nodeType == 1 ) {
                           var childElement_arr = childElement.outerHTML.split("</");
                           var is_child_single_node = ( childElement_arr.length == 1 );
                           has_elementChildren = !is_child_single_node;
                           continue;
                       }
                    }

                    if ( has_elementChildren ) {
                       html += "\n";
                    }

                    for ( var i=0; i< element.childNodes.length; i++ ) {
                       childElement = element.childNodes[i];

                       if ( has_elementChildren ) {
                           if ( childElement.nodeType == 1 ) {
                               var childElement_arr = childElement.outerHTML.split("</");
                               var is_child_single_node = ( childElement_arr.length == 1 );
                               if ( is_child_single_node ) {
                                   html += childElement.outerHTML;
                               }else{
                                   html += this._formatHTMLElement( childElement , indents+1 );
                               }
                           }else{
                               html += this._formatHTMLElement( childElement , indents+1 );
                           }
                       }else{
                           if ( childElement.nodeType == 1 ) {
                               html += childElement.outerHTML;
                           }else{
                               var text_content = childElement.textContent.replace(/(\r\n|\n|\r)/gm,"").trim();
                               if ( text_content.length > 0 )
                                   html += text_content;
                           }
                       }
                    }

                    if ( !is_single_node ) {
                       if ( has_elementChildren ) {
                           html += indent_str + "</" + clone_arr[1] + "\n";
                       }else{
                           html += "</" + clone_arr[1] + "\n";
                       }
                    }
                }

            }else if ( element.nodeType == 3 ) {
                var text_content = element.textContent.replace(/(\r\n|\n|\r)/gm,"").trim();
                if ( text_content.length > 0 )
                    html += indent_str + text_content + "\n";
            }

            return html;
        },

    render: function() {

        var focused_csscomp = false;
        if ( RS.route.csscomp ) {
            focused_csscomp = CSSRevealModel.csscomps_lookup[ decodeURIComponent( RS.route.csscomp ) ];
        }

        var comp_list = [],csscomp,xcls;
        //for ( var i=CSSRevealModel.csscomps.length-1; i>=0; i-- ) {
        for ( var cssComp_name in CSSRevealModel.csscomps_lookup ) {
            csscomp = CSSRevealModel.csscomps_lookup[ cssComp_name ];//CSSRevealModel.csscomps[i];
            xcls = ( focused_csscomp === csscomp ) ? "c-cssreveallist__item--selected" : "";

            comp_list.push(
                <div className={ "c-cssreveallist__item " + xcls }
                    key={ csscomp.target }
                    onClick={ this.openCSSComp.bind( this , csscomp ) }>
                    { csscomp.target }
                </div>
            );
        }

        var cleanHTML = false;
        if ( focused_csscomp ) {
            cleanHTML = this.cleanHTML( focused_csscomp );
        }

        return <div className="c-cssrevealapp">
            <div className="c-cssrevealapp__back"
                onClick={ function () { RS.merge({'app':false}) } }></div>
            <div className="c-cssrevealapp__content">
                <div className="c-cssrevealapp__nav c-cssreveallist">
                    { comp_list }
                </div>
                <div className="c-cssrevealapp__viewer c-cssrevealhtml">
                    <pre className="prettyprint lang-html">
                        { cleanHTML }
                    </pre>
                </div>
            </div>
            <div className="c-cssrevealapp__back"
                onClick={ function () { RS.merge({'app':false}) } }>

                <div className="c-cssrevealapp__close"
                    onClick={ function () { RS.merge({'app':'','d':3}) } }>
                    close
                </div>
            </div>
        </div>;
    }

});
