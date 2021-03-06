




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
            React.createElement(CSSRevealApp, {shortcuts:  this.props.shortcuts})
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
        //document.querySelector(".prettyprint").classList.remove("prettyprinted");
        //if ( PR ) { PR.prettyPrint(); }
    },

    openCSSComp: function( csscomp ){
        RS.merge({'app.csscomp': encodeURIComponent( csscomp.target ) });
    },

    openShortcut: function( hash ){
        document.location.hash = hash;
    },

    getHTML: function ( comp ) {
        var iframe = document.querySelector("#cssreveal_target");

        if ( !iframe || !comp ) {
            return "";
        }

        var div = iframe.contentWindow.document.querySelector( comp.target );

        if ( div ){
            return div.outerHTML;
        }else{
            return false;
        }
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
    },


        _formatHTMLElement: function ( element , indents ) {
            var html = "",innerText,nodeClasses;
            var indent_str = Array( indents ).join("\t");
            var to_ignore = ["OPTION","BR","B","META","LINK"];

            if ( element.nodeType == 1 ) {// element node

                if ( to_ignore.indexOf( element.nodeName ) != -1 ) {
                    return "";//ignore these
                }

                // hint at text content...
                //innerText = $(element).text().replace(/(\r\n|\n|\r|\t|\s\s)/gm,"").trim();

                var childElement;
                var innerText = "";
                for ( var i=0; i< element.childNodes.length; i++ ) {
                   childElement = element.childNodes[i];
                   if ( childElement.nodeType == 3 ) {
                       innerText += $(childElement).text().replace(/(\r\n|\n|\r|\t|\s\s)/gm,"").trim();
                   }
                }

                if ( innerText.length > 0 ) {
                    if ( innerText.length > 20 ) {
                        innerText = "<i>" + innerText.substring( 0, 20 ) + "...</i>";
                    }else{
                        innerText = "<i>" + innerText + "</i>";
                    }
                }

                var node_prefix = "&lt;";
                var node_postfix = " class=\"";
                html += "\n" + indent_str + "<span style='color: #000; weight: bold;'>" + node_prefix +
                                        element.nodeName.toLowerCase() + "</span>" +
                                        node_postfix;
                                        //innerText + "\n";

                nodeClasses = element.className.split(/\s+/);

                if ( nodeClasses.length > 1 ) {
                    html += "\n" + indent_str + "\t";
                }

                if ( nodeClasses.length > 0 && nodeClasses[0] != "" ) {
                    html += "<span style='color: #4DB167'>" + nodeClasses.join( "\n" + indent_str + "\t" )+ "</span>";
                }
                html += "\"<span style='color: #000; weight: bold;'>&gt;</span>";


                //html += "<div style='height: 8px;'></div>";

                var childElement,has_elementChildren = false;
                var childStrLength = 0,child_html;
                for ( var i=0; i< element.childNodes.length; i++ ) {
                   childElement = element.childNodes[i];
                   child_html = this._formatHTMLElement( childElement , indents+1 );
                   childStrLength += child_html.length;
                   html += child_html;
                }

                if ( childStrLength > 0 ) {
                    html += "\n" + indent_str;
                }

                html += innerText + "<span style='color: #000; weight: bold;'>" + "&lt;\\" +  element.nodeName.toLowerCase() +"&gt;" + "</span>";

            }else if ( element.nodeType == 3 ) {// text node
                //var text_content = element.textContent.replace(/(\r\n|\n|\r)/gm,"").trim();
                //if ( text_content.length > 0 )
                //    html += indent_str + text_content + "\n";
            }

            return html;
        },

        _formatHTMLElement_v1: function ( element , indents ) {
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

        var comp_list = [];

        //Create Shortcuts Lookup
        var shortcut_lookup = {};
        if ( this.props.shortcuts ) {
            var shortcut;
            for ( var i=0; i<this.props.shortcuts.length; i++ ) {
                shortcut = this.props.shortcuts[i];
                shortcut_lookup[shortcut.title] = true;
                // avoid dups....
                if ( !CSSRevealModel.csscomps_lookup[shortcut.title] ) {
                    comp_list.push(
                        React.createElement("div", {className:  "c-cssreveallist__item ", 
                            key:  "shortcut_" + shortcut.title, 
                            onClick: this.openShortcut.bind( this , shortcut.url)}, 
                             shortcut.title + " *"
                        )
                    );
                }
            }
        }



        var csscomp,xcls;
        //for ( var i=CSSRevealModel.csscomps.length-1; i>=0; i-- ) {
        for ( var cssComp_name in CSSRevealModel.csscomps_lookup ) {
            csscomp = CSSRevealModel.csscomps_lookup[ cssComp_name ];//CSSRevealModel.csscomps[i];
            xcls = ( focused_csscomp === csscomp ) ? "c-cssreveallist__item--selected" : "";
            comp_list.push(
                React.createElement("div", {className: 
                        "c-cssreveallist__item " + xcls +
                        ( ( shortcut_lookup[csscomp.target] === true ) ? "" : " c-cssreveallist__item--noShortcut"), 
                    
                    key:  csscomp.target, 
                    onClick:  this.openCSSComp.bind( this , csscomp) }, 
                     csscomp.target
                )
            );
        }




        var cleanHTML = false;
        var focused_csscomp_title = "";
        if ( focused_csscomp ) {
            cleanHTML = this.cleanHTML( focused_csscomp );
            focused_csscomp_title = focused_csscomp.target;
        }


        return React.createElement("div", {className: "c-cssrevealapp"}, 
            React.createElement("div", {className: "c-cssrevealapp__back", 
                onClick:  function () { RS.merge({'app':false}) }}), 
            React.createElement("div", {className: "c-cssrevealapp__content"}, 
                React.createElement("div", {className: "c-cssrevealapp__nav c-cssreveallist"}, 
                     comp_list 
                ), 
                React.createElement("div", {className: "c-cssrevealapp__viewer c-cssrevealhtml"}, 
                    React.createElement("div", {className: "c-cssrevealapp__title"},  focused_csscomp_title ), 
                    React.createElement("pre", {className: "prettyprint-OFF lang-html-OFF", 
                        dangerouslySetInnerHTML: {__html:cleanHTML}}
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
