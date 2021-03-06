let React                   = require( 'react' );
let ReactTime               = require( 'react-time' ).default;
let SelectedHeaderOptions   = require( './selected_header_options.jsx' );
let DeleteEvent             = require( '../modal/delete.jsx' ).DeleteEvent;
let Owner                   = require( '../modal/owner.jsx' );
let Entities                = require( '../modal/entities.jsx' );
let ChangeHistory           = require( '../modal/change_history.jsx' );
let ViewedByHistory         = require( '../modal/viewed_by_history.jsx' );
let SelectedPermission      = require( '../components/permission.jsx' );
let SelectedEntry           = require( './selected_entry.jsx' );
let Tag                     = require( '../components/tag.jsx' );
let Source                  = require( '../components/source.jsx' );
let Store                   = require( '../activemq/store.jsx' );
let Notification            = require( 'react-notification-system' );
let AddFlair                = require( '../components/add_flair.jsx' ).AddFlair;
let EntityDetail            = require( '../modal/entity_detail.jsx' );
let LinkWarning             = require( '../modal/link_warning.jsx' );
let Links                   = require( '../modal/links.jsx' ).default;
let DetailDataStatus        = require( '../components/detail_data_status.jsx' );
let Mark                    = require( '../modal/mark.jsx' ).default;
let ExportModal             = require( '../modal/export_event.jsx' );
let PromotedData            = require( '../modal/promoted_data.jsx' ).default;
let InitialAjaxLoad;

let SelectedHeader = React.createClass( {
    getInitialState: function() {
        let entityDetailKey = Math.floor( Math.random()*1000 );
        return {
            showEventData:false,
            headerData:{},
            sourceData:'',
            tagData:'',
            permissionsToolbar:false,
            entitiesToolbar:false,
            changeHistoryToolbar:false,
            viewedByHistoryToolbar:false,
            entryToolbar:false,
            deleteToolbar:false,
            promoteToolbar:false,
            notificationType:null,
            notificationMessage:null,
            key:this.props.id,
            showEntryData:false,
            entryData:'',
            showEntityData:false,
            entityData:'',
            entityid:null,
            entitytype:null,
            entityoffset:null,
            entityobj:null,
            flairToolbar:false,
            linkWarningToolbar:false,
            exportModal: false,
            refreshing:false,
            loading: false,
            eventLoaded:false,
            entryLoaded:false,
            entityLoaded:false,
            alertSelected:false,
            aIndex:null,
            aType:null,
            aStatus:null,
            aID:0,
            guideID: null,
            fileUploadToolbar: false,
            isNotFound: false,
            runWatcher: false,
            entityDetailKey: entityDetailKey,
            processing: false,
            showSignatureOptions: false,
            showMarkModal: false,
            showLinksModal: false,
            isDeleted: false,
            flairOff: false,
            highlightedText: '',
            flairing : false,
            isMounted: false,
        };
    },
    componentWillMount: function() {
        this.setState( {loading:true} );
    },
    componentDidMount: function() {
        this.setState( {isMounted: true} );
        let delayFunction = {
            delay: function() {
                let entryType = 'entry';
                if ( this.props.type == 'alertgroup' ) { entryType = 'alert'; }
                //Main Type Load
                $.ajax( {
                    type:'get',
                    url:'scot/api/v2/' + this.props.type + '/' + this.props.id,
                    success:function( result ) {
                        if ( this.state.isMounted ) {
                            let eventResult = result;
                            this.setState( {headerData:eventResult,showEventData:true, isNotFound:false, tagData:eventResult.tag, sourceData:eventResult.source} );
                            if ( this.state.showEventData == true && this.state.showEntryData == true && this.state.showEntityData == true ) {
                                this.setState( {loading:false} );
                            }
                            if ( this.props.type == 'alertgroup' && eventResult.parsed === -1 ) {
                                this.setState( {flairing: true} );
                            } else {
                                this.setState( {flairing: false} );
                            }
                        }
                    }.bind( this ),
                    error: function( result ) {
                        this.setState( {showEventData:true, isNotFound:true} );
                        if ( this.state.showEventData == true && this.state.showEntryData == true && this.state.showEntityData == true ) {
                            this.setState( {loading:false} );
                        }
                        this.props.errorToggle( 'Error: Failed to load detail data. Error message: ' + result.responseText, result );
                    }.bind( this ),
                } );
                //entry load
                $.ajax( {
                    type: 'get',
                    url: 'scot/api/v2/' + this.props.type + '/' + this.props.id + '/' + entryType,
                    success: function( result ) {
                        if ( this.state.isMounted ) {
                            let entryResult = result.records;
                            this.setState( {showEntryData:true, entryData:entryResult, runWatcher:true} );
                            this.Watcher();
                            if ( this.state.showEventData == true && this.state.showEntryData == true && this.state.showEntityData == true ) {
                                this.setState( {loading:false} );
                            }
                        }
                    }.bind( this ),
                    error: function( result ) {
                        this.setState( {showEntryData:true} );
                        if ( this.state.showEventData == true && this.state.showEntryData == true && this.state.showEntityData == true ) {
                            this.setState( {loading:false} );
                        }
                        this.props.errorToggle( 'Error: Failed to load entry data. Error message: ' + result.responseText, result );
                    }
                } );
                //entity load
                $.ajax( {
                    type: 'get',
                    url: 'scot/api/v2/' + this.props.type + '/' + this.props.id + '/entity',
                    success: function( result ) {
                        if ( this.state.isMounted ) {
                            let entityResult = result.records;
                            this.setState( {showEntityData:true, entityData:entityResult} );
                            var waitForEntry = {
                                waitEntry: function() {
                                    if( this.state.showEntryData == false ) {
                                        setTimeout( waitForEntry.waitEntry,50 );
                                    } else {
                                        setTimeout( function(){AddFlair.entityUpdate( entityResult,this.flairToolbarToggle,this.props.type,this.linkWarningToggle,this.props.id,this.scrollTo );}.bind( this ) );
                                        if ( this.state.showEventData == true && this.state.showEntryData == true && this.state.showEntityData == true ) {
                                            this.setState( {loading:false} );
                                        }
                                    }
                                }.bind( this )
                            };
                            waitForEntry.waitEntry();
                        }
                    }.bind( this ),
                    error: function( result ) {
                        this.setState( {showEntityData:true} );
                        if ( this.state.showEventData == true && this.state.showEntryData == true && this.state.showEntityData == true ) {
                            this.setState( {loading:false} );
                        }
                        this.props.errorToggle( 'Error: Failed to load entity data.', result );
                    }.bind( this )
                } );
                //guide load
                if ( this.props.type == 'alertgroup' ) {
                    $.ajax( {
                        type:'get',
                        url: 'scot/api/v2/' + this.props.type + '/' + this.props.id + '/guide',
                        success: function( result ) {
                            if ( this.state.isMounted ) {
                                let arr = [];
                                for ( let i=0; i < result.records.length; i++ ) {
                                    arr.push( result.records[i].id );
                                }
                                this.setState( {guideID: arr} );
                            }
                        }.bind( this ),
                        error: function( result ) {
                            this.setState( {guideID: null} );
                            this.props.errorToggle( 'Error: Failed to load guide data. Error message:' + result.responseText, result );
                        }.bind( this )
                    } );
                }
                Store.storeKey( this.props.id );
                Store.addChangeListener( this.updated );
            }.bind( this )
        };
        InitialAjaxLoad = setTimeout( delayFunction.delay,400 );
    },
    componentWillUnmount: function() {
        this.setState( {isMounted: false} );
        clearTimeout( InitialAjaxLoad );
        Store.removeChangeListener( this.props.id, this.updated );
    },
    componentDidUpdate: function() {
        //This runs the watcher which handles the entity popup and link warning.
        if( this.state.runWatcher == true ) {
            this.Watcher();
        }
    },
    componentWillReceiveProps: function() {
        //resets the watcher flag to false. This will only get set to true if a call for entries is made.
        this.setState( {runWatcher:false} );
    },
    updated: function( _type,_message ) {
        if ( !this.state.isDeleted ) {
            this.setState( {refreshing:true, eventLoaded:false,entryLoaded:false,entityLoaded:false} );
            let entryType = 'entry';
            if ( this.props.type == 'alertgroup' ) {entryType = 'alert';}
            //main type load
            $.ajax( {
                type:'get',
                url:'scot/api/v2/' + this.props.type + '/' + this.props.id,
                success:function( result ) {
                    if ( this.state.isMounted ) {
                        let eventResult = result;
                        this.setState( {headerData:eventResult,showEventData:true, eventLoaded:true, isNotFound:false, tagData:eventResult.tag, sourceData:eventResult.source} );
                        if ( this.state.eventLoaded == true && this.state.entryLoaded == true && this.state.entityLoaded == true ) {
                            this.setState( {refreshing:false} );
                        }
                        if ( this.props.type == 'alertgroup' && eventResult.parsed === -1 ) {
                            this.setState( {flairing: true} );
                        } else {
                            this.setState( {flairing: false} );
                        }
                    }
                }.bind( this ),
                error: function( result ) {
                    this.setState( {showEventData:true, eventLoaded:true, isNotFound:true} );
                    if ( this.state.eventLoaded == true && this.state.entryLoaded == true && this.state.entityLoaded == true ) {
                        this.setState( {refreshing:false} );
                    }
                    this.props.errorToggle( 'Error: Failed to reload detail data. Error message: ' + result.responseText, result );
                }.bind( this ),
            } );
            //entry load
            $.ajax( {
                type: 'get',
                url: 'scot/api/v2/' + this.props.type + '/' + this.props.id + '/' + entryType,
                success: function( result ) {
                    if ( this.state.isMounted ) {
                        let entryResult = result.records;
                        this.setState( {showEntryData:true, entryLoaded:true, entryData:entryResult, runWatcher:true} );
                        this.Watcher();
                        if ( this.state.eventLoaded == true && this.state.entryLoaded == true && this.state.entityLoaded == true ) {
                            this.setState( {refreshing:false} );
                        }
                    }
                }.bind( this ),
                error: function( result ) {
                    this.setState( {showEntryData:true, entryLoaded:true} );
                    if ( this.state.eventLoaded == true && this.state.entryLoaded == true && this.state.entityLoaded == true ) {
                        this.setState( {refreshing:false} );
                    }
                    this.props.errorToggle( 'Error: Failed to reload entry data. Error message: ' + result.responseText, result );
                }
            } );
            //entity load
            $.ajax( {
                type: 'get',
                url: 'scot/api/v2/' + this.props.type + '/' + this.props.id + '/entity',
                success: function( result ) {
                    if ( this.state.isMounted ) {
                        let entityResult = result.records;
                        this.setState( {showEntityData:true, entityLoaded:true, entityData:entityResult} );
                        var waitForEntry = {
                            waitEntry: function() {
                                if( this.state.entryLoaded == false ){
                                    setTimeout( waitForEntry.waitEntry,50 );
                                } else {
                                    setTimeout( function(){AddFlair.entityUpdate( entityResult,this.flairToolbarToggle,this.props.type,this.linkWarningToggle,this.props.id );}.bind( this ) );
                                    if ( this.state.eventLoaded == true && this.state.entryLoaded == true && this.state.entityLoaded == true ) {
                                        this.setState( {refreshing:false} );
                                    }
                                }
                            }.bind( this )
                        };
                        waitForEntry.waitEntry();
                    }
                }.bind( this ),
                error: function( result ) {
                    this.setState( {showEntityData:true} );
                    if ( this.state.eventLoaded == true && this.state.entryLoaded == true && this.state.entityLoaded == true ) {
                        this.setState( {refreshing:false} );
                    }
                    this.props.errorToggle( 'Error: Failed to reload entity data.', result );
                }.bind( this )
            } );
            //error popup if an error occurs
            if ( _type!= undefined && _message != undefined ) {
                this.props.errorToggle( _message );
            }
        }
    },
    flairToolbarToggle: function( id,value,type,entityoffset,entityobj ){
        this.setState( {flairToolbar:true,entityid:id,entityvalue:value,entitytype:type,entityoffset:entityoffset, entityobj:entityobj} );
    },
    flairToolbarOff: function() {
        if ( this.state.isMounted ) {
            let newEntityDetailKey = this.state.entityDetailKey + 1;
            this.setState( {flairToolbar:false, entityDetailKey:newEntityDetailKey} );
        }
    },
    linkWarningToggle: function( href ) {
        if ( this.state.linkWarningToolbar == false ) {
            this.setState( {linkWarningToolbar:true,link:href} );
        } else {
            this.setState( {linkWarningToolbar:false} );
        }
    },

    exportToggle: function( ) {
        if ( this.state.exportModal == false) {
            this.setState( { exportModal: true})
        } else{
            this.setState({exportModal:false})
        }
    },

    viewedbyfunc: function( headerData ) {
        let viewedbyarr = [];
        if ( headerData != null ) {
            for ( let prop in headerData.view_history ) {
                viewedbyarr.push( prop );
            }
        }
        return viewedbyarr;
    },
    entryToggle: function() {
        if ( this.state.entryToolbar == false ) {
            this.setState( {entryToolbar:true} );
        } else {
            this.setState( {entryToolbar:false} );
            //click refresh detail button on screen to refresh data while the tinymce window was open since it held back updates of the DOM
            //hold off on refresh as the tinymce preventing update is currently commented out
            /*if ($('#refresh-detail')) {
                $('#refresh-detail').click();
            }*/
        }
    },
    deleteToggle: function( isDeleted ) {
        if ( this.state.deleteToolbar == false ) {
            this.setState( {deleteToolbar:true} );
        } else {
            this.setState( {deleteToolbar:false} );
        }
        //set isDeleted to true so notifications won't fire
        if ( isDeleted ) { this.setState( { isDeleted: true } ); }
    },
    changeHistoryToggle: function() {
        if ( this.state.changeHistoryToolbar == false ) {
            this.setState( {changeHistoryToolbar:true} );
        } else {
            this.setState( {changeHistoryToolbar:false} );
        }
    },
    viewedByHistoryToggle: function() {
        if ( this.state.viewedByHistoryToolbar == false ) {
            this.setState( {viewedByHistoryToolbar:true} );
        } else {
            this.setState( {viewedByHistoryToolbar:false} );
        }
    },
    permissionsToggle: function() {
        if ( this.state.permissionsToolbar == false ) {
            this.setState( {permissionsToolbar:true} );
        } else {
            this.setState( {permissionsToolbar:false} );
        }
    },
    entitiesToggle: function() {
        if ( this.state.entitiesToolbar == false ) {
            this.setState( {entitiesToolbar:true} );
        } else {
            this.setState( {entitiesToolbar:false} );
        }
    },
    promoteToggle: function() {
        if ( this.state.promoteToolbar == false ) {
            this.setState( {promoteToolbar:true} );
        } else {
            this.setState( {promoteToolbar:false} );
        }
    },
    fileUploadToggle: function() {
        if ( this.state.fileUploadToolbar == false ) {
            this.setState( {fileUploadToolbar:true} );
        } else {
            this.setState( {fileUploadToolbar:false} );
        }
    },
    titleCase: function( string ) {
        let newstring = string.charAt( 0 ).toUpperCase() + string.slice( 1 );
        return (
            newstring
        );
    },
    alertSelected: function( aIndex,aID,aType,aStatus ){
        this.setState( {alertSelected:true,aIndex:aIndex,aID:aID,aType:aType,aStatus:aStatus} );
    },

    Watcher: function() {
        $( 'iframe' ).each( function( index,ifr ) {
        //requestAnimationFrame waits for the frame to be rendered (allowing the iframe to fully render before excuting the next bit of code!!!
            ifr.contentWindow.requestAnimationFrame( function() {
                if( ifr.contentDocument != null ) {
                    let arr = [];
                    //arr.push(this.props.type);
                    arr.push( this.checkFlairHover );
                    arr.push( this.checkHighlight );
                    $( ifr ).off( 'mouseenter' );
                    $( ifr ).off( 'mouseleave' );
                    $( ifr ).on( 'mouseenter', function( v,type ) {
                        let intervalID = setInterval( this[0], 50, ifr );// this.flairToolbarToggle, type, this.props.linkWarningToggle, this.props.id);
                        let intervalID1 = setInterval( this[1], 50, ifr );// this.flairToolbarToggle, type, this.props.linkWarningToggle, this.props.id);
                        $( ifr ).data( 'intervalID', intervalID );
                        $( ifr ).data( 'intervalID1', intervalID1 );
                        console.log( 'Now watching iframe ' + intervalID );
                    }.bind( arr ) );
                    $( ifr ).on( 'mouseleave', function() {
                        let intervalID = $( ifr ).data( 'intervalID' );
                        let intervalID1 = $( ifr ).data( 'intervalID1' );
                        window.clearInterval( intervalID );
                        window.clearInterval( intervalID1 );
                        console.log( 'No longer watching iframe ' + intervalID );
                    } );
                }
            }.bind( this ) );
        }.bind( this ) );
        if( this.props.type == 'alertgroup' ) {
            $( '#detail-container' ).find( 'a, .entity' ).not( '.not_selectable' ).each( function( index,tr ) {
                $( tr ).off( 'mousedown' );
                $( tr ).on( 'mousedown', function( index ) {
                    let thing = index.target;
                    if ( $( thing )[0].className == 'extras' ) { thing = $( thing )[0].parentNode;} //if an extra is clicked reference the parent element
                    if ( $( thing ).attr( 'url' ) ) {  //link clicked
                        let url = $( thing ).attr( 'url' );
                        this.linkWarningToggle( url );
                    } else { //entity clicked
                        let entityid = $( thing ).attr( 'data-entity-id' );
                        let entityvalue = $( thing ).attr( 'data-entity-value' );
                        let entityoffset = $( thing ).offset();
                        let entityobj = $( thing );
                        this.flairToolbarToggle( entityid, entityvalue, 'entity', entityoffset, entityobj );
                    }
                }.bind( this ) );
            }.bind( this ) );
        }
    },

    checkHighlight: function( ifr ) {
        let content;
        if ( ifr ) {
            content = ifr.contentWindow.getSelection().toString();
            if ( this.state.highlightedText != content ) {
                //this only tells the lower components to run their componentWIllReceiveProps methods to check for highlighted text.
                this.setState( {highlightedText: content } );
            } else {
                return;
            }
        }
    },

    checkFlairHover: function( ifr, nicktype ) {
        function returnifr() {
            return ifr;
        }
        if( ifr.contentDocument != null ) {
            $( ifr ).contents().find( '.entity' ).each( function( index, entity ) {
                if( $( entity ).css( 'background-color' ) == 'rgb(255, 0, 0)' ) {
                    $( entity ).data( 'state', 'down' );
                } else if ( $( entity ).data( 'state' ) == 'down' ) {
                    $( entity ).data( 'state', 'up' );
                    let entityid = $( entity ).attr( 'data-entity-id' );
                    let entityvalue = $( entity ).attr( 'data-entity-value' );
                    let entityobj = $( entity );
                    let ifr = returnifr();
                    let entityoffset = {top: $( entity ).offset().top+$( ifr ).offset().top, left: $( entity ).offset().left+$( ifr ).offset().left};
                    this.flairToolbarToggle( entityid,entityvalue,'entity',entityoffset, entityobj );
                }
            }.bind( this ) );
            $( ifr ).contents().find( 'a' ).each( function( index,a ) {
                if( $( a ).css( 'color' ) == 'rgb(255, 0, 0)' ) {
                    $( a ).data( 'state','down' );
                } else if ( $( a ).data( 'state' ) == 'down' ) {
                    $( a ).data( 'state','up' );
                    let url = $( a ).attr( 'url' );
                    this.linkWarningToggle( url );
                }
            }.bind( this ) );
        }
    },

    summaryUpdate: function() {
        this.forceUpdate();
    },

    scrollTo: function() {
        if ( this.props.taskid != undefined ) {
            $( '.entry-wrapper' ).scrollTop( $( '.entry-wrapper' ).scrollTop() + $( '#iframe_'+this.props.taskid ).position().top -30 );
        }
    },
    guideRedirectToAlertListWithFilter: function() {
        RegExp.escape = function( text ) {
            return text.replace( /[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&' );
        };
        //column, string, clearall (bool), type
        this.props.handleFilter( null,null,true,'alertgroup' );
        this.props.handleFilter( [{id:'subject', value: RegExp.escape( this.state.headerData.applies_to[0] )}], null, false, 'alertgroup' );
        window.open( '#/alertgroup/' );
    },
    showSignatureOptionsToggle: function() {
        if ( this.state.showSignatureOptions == false ) {
            this.setState( {showSignatureOptions: true} );
        } else {
            this.setState( {showSignatureOptions: false} );
        }
    },
    markModalToggle: function() {
        if ( this.state.showMarkModal == false ) {
            this.setState( {showMarkModal: true} );
        } else {
            this.setState( {showMarkModal: false} );
        }
    },
    ToggleProcessingMessage: function( status ) {
        this.setState( {processing: status} );
        this.props.togglePreventClick();
    },

    linksModalToggle: function() {
        let showLinksModal = !this.state.showLinksModal;
        this.setState( { showLinksModal: showLinksModal } );
    },

    toggleFlair: function() {
        if ( this.state.flairOff ) {
            this.setState( { flairOff: false, runWatcher: true} );
            setTimeout( function(){AddFlair.entityUpdate( this.state.entityData,this.flairToolbarToggle,this.props.type,this.linkWarningToggle,this.props.id );}.bind( this ) );
        } else {
            this.setState( { flairOff: true} );
        }
    },

    render: function() {
        let headerData = this.state.headerData;
        let viewedby = this.viewedbyfunc( headerData );
        let type = this.props.type;
        let subjectType = this.titleCase( this.props.type );  //in signatures we're using the key "name"
        let id = this.props.id;
        let string = '';

        if ( this.state.headerData.subject ) {
            string = this.state.headerData.subject;
        } else if ( this.state.headerData.value ) {
            string = this.state.headerData.value;
        } else if ( this.state.headerData.name ) {
            string = this.state.headerData.name;
        } else if ( this.state.headerData.body ) {
            string = this.state.headerData.body;
        }

        return (
            <div> {this.state.isNotFound ? <h1>No record found.</h1> :
                <div>
                    <div id="header">
                        <div id="NewEventInfo" className="entry-header-info-null">
                            <div className='details-subject' style={{display: 'inline-flex',paddingLeft:'5px'}}>
                                {this.state.showEventData ? <EntryDataSubject data={this.state.headerData} subjectType={subjectType} type={type} id={this.props.id} errorToggle={this.props.errorToggle} />: null}
                                {this.state.refreshing ? <span style={{color:'lightblue'}}>Refreshing Data...</span> :null }
                                {this.state.loading ? <span style={{color:'lightblue'}}>Loading...</span> :null}
                                {this.state.processing ? <span style={{color: 'lightblue'}}>Processing Actions...</span> : null }
                                {this.state.flairing ? <span style={{color: 'lightblue'}}>Flairing...</span> : null }
                            </div>
                            {type != 'entity' ?
                                <div className='details-table toolbar' style={{display: 'flex'}}>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <th></th>
                                                <td><div style={{marginLeft:'5px'}}>{this.state.showEventData ? <DetailDataStatus data={this.state.headerData} status={this.state.headerData.status} id={id} type={type} errorToggle={this.props.errorToggle} />: null}</div></td>
                                                {( type != 'entity' ) ?
                                                    <th>Owner: </th>
                                                    :
                                                    null
                                                }
                                                {( type != 'entity' ) ?
                                                    <td><span>{this.state.showEventData ? <Owner key={id} data={this.state.headerData.owner} type={type} id={id} updated={this.updated} errorToggle={this.props.errorToggle}/>: null}</span></td>
                                                    :
                                                    null
                                                }
                                                {( type != 'entity' ) ?
                                                    <th>Updated: </th>
                                                    :
                                                    null
                                                }
                                                {( type != 'entity' ) ?
                                                    <td><span id='event_updated'>{this.state.showEventData ? <EntryDataUpdated data={this.state.headerData.updated} /> : null}</span></td>
                                                    :
                                                    null
                                                }
                                                {( type == 'event' || type == 'incident' ) && this.state.showEventData && this.state.headerData.promoted_from.length > 0 ? <th>Promoted From:</th> : null}
                                                {( type == 'event' || type == 'incident' ) && this.state.showEventData && this.state.headerData.promoted_from.length > 0 ? <PromotedData data={this.state.headerData.promoted_from} type={type} id={id} /> : null}
                                                {( type != 'entity' ) && this.state.showEventData ? <Tag data={this.state.tagData} id={id} type={type} updated={this.updated} errorToggle={this.props.errorToggle} /> : null}
                                                {( type != 'entity' ) && this.state.showEventData ? <Source data={this.state.sourceData} id={id} type={type} updated={this.updated} errorToggle={this.props.errorToggle}/> : null }
                                            </tr>
                                        </tbody>
                                    </table>
                                    {/*<DetailHeaderMoreOptions type={type} id={id} data={this.state.headerData} errorToggle={this.props.errorToggle} showData={this.state.showEventData} />*/}
                                </div>
                                :
                                null
                            }
                        </div>
                        <Notification ref="notificationSystem" />
                        {this.state.exportModal ? <ExportModal type={type}  errorToggle={this.props.errorToggle} exportToggle={this.exportToggle} id={id} /> : null }
                        {this.state.linkWarningToolbar ? <LinkWarning linkWarningToggle={this.linkWarningToggle} link={this.state.link}/> : null}
                        {this.state.viewedByHistoryToolbar ? <ViewedByHistory viewedByHistoryToggle={this.viewedByHistoryToggle} id={id} type={type} subjectType={subjectType} viewedby={viewedby} errorToggle={this.props.errorToggle} /> : null}
                        {this.state.changeHistoryToolbar ? <ChangeHistory changeHistoryToggle={this.changeHistoryToggle} id={id} type={type} subjectType={subjectType} errorToggle={this.props.errorToggle}/> : null}
                        {this.state.entitiesToolbar ? <Entities entitiesToggle={this.entitiesToggle} entityData={this.state.entityData} flairToolbarToggle={this.flairToolbarToggle} flairToolbarOff={this.flairToolbarOff} /> : null}
                        {this.state.deleteToolbar ? <DeleteEvent subjectType={subjectType} type={type} id={id} deleteToggle={this.deleteToggle} updated={this.updated} errorToggle={this.props.errorToggle} history={this.props.history}/> :null}
                        {this.state.showMarkModal ? <Mark modalActive={true} type={type} id={id} string={string} errorToggle={this.props.errorToggle} markModalToggle={this.markModalToggle} /> : null }
                        {this.state.showLinksModal ? <Links modalActive={true} type={type} id={id} errorToggle={this.props.errorToggle} linksModalToggle={this.linksModalToggle} /> : null }
                        {this.state.showEventData ? <SelectedHeaderOptions type={type} subjectType={subjectType} id={id} headerData={this.state.headerData} status={this.state.headerData.status} promoteToggle={this.promoteToggle} permissionsToggle={this.permissionsToggle} entryToggle={this.entryToggle} entitiesToggle={this.entitiesToggle} changeHistoryToggle={this.changeHistoryToggle} viewedByHistoryToggle={this.viewedByHistoryToggle} exportToggle={this.exportToggle} deleteToggle={this.deleteToggle} updated={this.updated} alertSelected={this.state.alertSelected} aIndex={this.state.aIndex} aType={this.state.aType} aStatus={this.state.aStatus} flairToolbarToggle={this.flairToolbarToggle} flairToolbarOff={this.flairToolbarOff} sourceToggle={this.sourceToggle} guideID={this.state.guideID} subjectName={this.state.headerData.subject} fileUploadToggle={this.fileUploadToggle} fileUploadToolbar={this.state.fileUploadToolbar} guideRedirectToAlertListWithFilter={this.guideRedirectToAlertListWithFilter} showSignatureOptionsToggle={this.showSignatureOptionsToggle} markModalToggle={this.markModalToggle} linksModalToggle={this.linksModalToggle} ToggleProcessingMessage={this.ToggleProcessingMessage} errorToggle={this.props.errorToggle} toggleFlair={this.toggleFlair}/> : null}
                        {this.state.permissionsToolbar ? <SelectedPermission updateid={id} id={id} type={type} permissionData={this.state.headerData} permissionsToggle={this.permissionsToggle} updated={this.updated} errorToggle={this.props.errorToggle}/> : null}
                    </div>
                    {this.state.showEventData && type != 'entity' ? <SelectedEntry id={id} type={type} entryToggle={this.entryToggle} updated={this.updated} entryData={this.state.entryData} entityData={this.state.entityData} headerData={this.state.headerData} showEntryData={this.state.showEntryData} showEntityData={this.state.showEntityData} alertSelected={this.alertSelected} summaryUpdate={this.summaryUpdate} flairToolbarToggle={this.flairToolbarToggle} flairToolbarOff={this.flairToolbarOff} linkWarningToggle={this.linkWarningToggle} entryToolbar={this.state.entryToolbar} isAlertSelected={this.state.alertSelected} aType={this.state.aType} aID={this.state.aID} alertPreSelectedId={this.props.alertPreSelectedId} errorToggle={this.props.errorToggle} fileUploadToggle={this.fileUploadToggle} fileUploadToolbar={this.state.fileUploadToolbar} showSignatureOptions={this.state.showSignatureOptions} flairOff={this.state.flairOff} highlightedText={this.state.highlightedText} form={this.props.form}/> : null}
                    {this.state.showEventData && type == 'entity' ? <EntityDetail entityid={id} form={this.props.form} entitytype={'entity'} id={id} type={'entity'} fullScreen={true} errorToggle={this.props.errorToggle} linkWarningToggle={this.linkWarningToggle}/> : null}
                    {this.state.flairToolbar ? <EntityDetail key={this.state.entityDetailKey} form={this.props.form} flairToolbarToggle={this.flairToolbarToggle} flairToolbarOff={this.flairToolbarOff} linkWarningToggle={this.linkWarningToggle} entityid={parseInt(this.state.entityid)} data={this.state.headerData} entityvalue={this.state.entityvalue} entitytype={this.state.entitytype} type={this.props.type} id={this.props.id} errorToggle={this.props.errorToggle} entityoffset={this.state.entityoffset} watcher={this.Watcher} entityobj={this.state.entityobj} linkWarningToggle={this.linkWarningToggle}/> : null}
                </div>
            }
            </div>
        );
    }
} );

let EntryDataUpdated = React.createClass( {
    render: function() {
        let data = this.props.data;
        return (
            <div><ReactTime value={data * 1000} format="MM/DD/YY hh:mm:ss a" /></div>
        );
    }
} );

let EntryDataSubject = React.createClass( {
    getInitialState: function() {
        let keyName = 'subject';
        let value = this.props.data.subject;
        if ( this.props.type == 'signature' ) {
            keyName = 'name';
            value = this.props.data.name;
        } else if ( this.props.type == 'entity' ) {
            keyName = 'value';
            value = this.props.data.value;
        }
        return {
            value:value,
            width:'',
            keyName: keyName,
        };
    },
    handleChange: function( event ) {
        if ( event != null ) {
            let keyName = this.state.keyName;
            let json = {[keyName]:event.target.value};
            let newValue = event.target.value;
            $.ajax( {
                type: 'put',
                url: 'scot/api/v2/' + this.props.type + '/' + this.props.id,
                data: JSON.stringify( json ),
                contentType: 'application/json; charset=UTF-8',
                success: function( data ) {
                    console.log( 'success: ' + data );
                    this.setState( {value:newValue} );
                    this.calculateWidth( newValue );
                }.bind( this ),
                error: function( result ) {
                    this.props.errorToggle( 'error: Failed to update the subject/name', result );
                }.bind( this )
            } );
        }
    },
    componentDidMount: function() {
        this.calculateWidth( this.state.value );
    },
    onChange: function( e ) {
        this.setState({ value: e.target.value });
    },
    handleEnterKey: function( e ) {
        if ( e.key == 'Enter' ) {
            this.handleChange( e );
        }
    },
    calculateWidth: function( input ) {
        let newWidth;
        $( '#invisible' ).html( $( '<span></span>' ).text( input ) );
        newWidth = ( $( '#invisible' ).width() + 25 ) + 'px';
        this.setState( {width:newWidth} );
    },
    componentWillReceiveProps: function ( nextProps ) {
        let value = nextProps.data.subject;
        if ( nextProps.type == 'signature' ) {
            value = nextProps.data.name;
        } else if ( nextProps.type == 'entity' ) {
            value = nextProps.data.value;
        }
        this.setState({ value : value });
        this.calculateWidth( value );
    },

    render: function() {
        //only disable the subject editor on an entity with a non-blank subject as editing it could damage flair.
        let isDisabled = false;
        if ( this.props.type == 'entity' && this.state.value != '' ) {
            isDisabled = true;
        }
        return (
            <div>{this.props.subjectType} {this.props.id}: <input type='text' value={this.state.value} onKeyPress={this.handleEnterKey} onChange={this.onChange} onBlur={this.handleChange} style={{width:this.state.width,lineHeight:'normal'}} className='detail-header-input' disabled={isDisabled} /></div>
        );
    }
} );


module.exports = SelectedHeader;
