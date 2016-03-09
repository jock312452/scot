var React               = require('react');
var ReactTime           = require('react-time');
var SplitButton         = require('react-bootstrap/lib/SplitButton.js');
var DropdownButton      = require('react-bootstrap/lib/DropdownButton.js');
var MenuItem            = require('react-bootstrap/lib/MenuItem.js');
var Button              = require('react-bootstrap/lib/Button.js');
var AddEntryModal       = require('../modal/add_entry.jsx');
var DeleteEntry         = require('../modal/delete.jsx').DeleteEntry;
var Summary             = require('../components/summary.jsx');
var Task                = require('../components/task.jsx');
var SelectedPermission  = require('../components/permission.jsx');
var Frame               = require('react-frame');

var SelectedEntry = React.createClass({
    getInitialState: function() {
        return {
            showEntryData:false,
            entryData:''            
        }
    },
    componentDidMount: function() {
        this.headerRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id + '/entry', function(result) {
            var entryResult = result.records;
            this.setState({showEntryData:true, entryData:entryResult})
        }.bind(this));
    },
    updated: function () {
        this.props.updated();
        this.headerRequest = $.get('scot/api/v2/' + this.props.type + '/' + this.props.id + '/entry', function(result) {
            var entryResult = result.records;
            this.setState({showEntryData:true, entryData:entryResult})
        }.bind(this));
        console.log('Ran update');
    },
    render: function() { 
        var data = this.state.entryData; 
        var type = this.props.type;
        var id = this.props.id;
        return (
            <div className="row-fluid entry-wrapper"> 
                {this.state.showEntryData ? <EntryIterator data={data} type={type} id={id} updated={this.updated} /> : null}
            </div>       
        );
    }
});

var EntryIterator = React.createClass({
    render: function() {
        var rows = [];
        var data = this.props.data;
        var type = this.props.type;
        var id = this.props.id;  
        var updated = this.props.updated;
        data.forEach(function(data) {
            rows.push(<EntryParent key={data.id} items={data} type={type} id={id} updated={updated} />);
        });
        return (
            <div>
                {rows}
            </div>
        )
    }
});

var EntryParent = React.createClass({
    getInitialState: function() {
        return {
            addEntryToolbar:false,   
            editEntryToolbar:false,
            replyEntryToolbar:false,
            deleteToolbar:false,
            permissionsToolbar:false,
        }
    },
    addEntryToggle: function() {
        if (this.state.addEntryToolbar == false) {
            this.setState({addEntryToolbar:true})
        } else {
            this.setState({addEntryToolbar:false})
        } 
    },
    editEntryToggle: function() {
        if (this.state.editEntryToolbar == false) {
            this.setState({editEntryToolbar:true})
        } else {
            this.setState({editEntryToolbar:false})
        }
    },
    replyEntryToggle: function() {
        if (this.state.replyEntryToolbar == false) {
            this.setState({replyEntryToolbar:true})
        } else {
            this.setState({replyEntryToolbar:false})
        }
    },
    deleteToggle: function() {
        if (this.state.deleteToolbar == false) {
            this.setState({deleteToolbar:true})
        } else {
            this.setState({deleteToolbar:false})
        }
    },
    permissionsToggle: function() {
        if (this.state.permissionsToolbar == false) {
            this.setState({permissionsToolbar:true})
        } else {
            this.setState({permissionsToolbar:false})
        }
    },
    render: function() {
        var itemarr = [];
        var subitemarr = [];
        var items = this.props.items;
        var type = this.props.type;
        var id = this.props.id;
        var updated = this.props.updated;
        var summary = items.summary;
        var outerClassName = 'row-fluid entry-outer';
        var innerClassName = 'row-fluid entry-header';
        var taskOwner = '';
        if (summary == 1) {
            outerClassName += ' summary_entry';
        }
        if (items.task.status == 'open' || items.task.status == 'assigned') {
            taskOwner = '-- Task Owner ' + items.task.who + ' ';
            outerClassName += ' todo_open_outer';
            innerClassName += ' todo_open';
        } else if (items.task.status == 'closed' && items.task.who != null ) {
            taskOwner = '-- Task Owner ' + items.task.who + ' ';
            outerClassName += ' todo_completed_outer';
            innerClassName += ' todo_completed';
        } else if (items.task.status == 'closed') {
            outerClassName += ' todo_undefined_outer';
            innerClassName += ' todo_undefined';
        }
        itemarr.push(<EntryData id={items.id} key={items.id} subitem = {items}/>);
        for (var prop in items) {
            function childfunc(prop){
                if (prop == "children") {
                    var childobj = items[prop];
                    items[prop].forEach(function(childobj) {
                        subitemarr.push(new Array(<EntryParent items = {childobj} updated={updated} />));  
                    });
                }
            }
            childfunc(prop);
        };
        itemarr.push(subitemarr);
        var header1 = '[' + items.id + '] ';
        var header2 = ' by ' + items.owner + ' ' + taskOwner + '(updated on '; 
        var header3 = ')'; 
        var createdTime = items.created;
        var updatedTime = items.updated; 
        return (
            <div> 
                <div className={outerClassName} style={{marginLeft: 'auto', marginRight: 'auto', width:'99.3%'}}>
                    <span className="anchor" id={"/"+ type + '/' + id + '/' + items.id}/>
                    <div className={innerClassName}>
                        <div className="entry-header-inner">[<a style={{color:'black'}} href={"#/"+ type + '/' + id + '/' + items.id}>{items.id}</a>] <ReactTime value={items.created * 1000} format="MM/DD/YYYY hh:mm:ss a" /> by {items.owner} {taskOwner}(updated on <ReactTime value={items.updated * 1000} format="MM/DD/YYYY hh:mm:ss a" />)
                            <span className='pull-right' style={{display:'inline-flex'}}>
                                {this.state.permissionsToolbar ? <SelectedPermission id={items.id} type={'entry'} permissionData={items} permissionsToggle={this.permissionsToggle} updated={updated} /> : null}
                                <SplitButton bsSize='xsmall' title="Reply" key={items.id} id={'Reply '+items.id} onClick={this.replyEntryToggle}>
                                    <MenuItem eventKey='1' onClick={this.addEntryToggle}>Move</MenuItem>
                                    <MenuItem eventKey='2' onClick={this.deleteToggle}>Delete</MenuItem>
                                    <MenuItem eventKey='3'><Summary type={type} id={id} entryid={items.id} summary={summary} updated={updated} /></MenuItem>
                                    <MenuItem eventKey='4'><Task type={type} id={id} entryid={items.id} updated={updated}/></MenuItem>
                                    <MenuItem eventKey='5' onClick={this.permissionsToggle}>Permissions</MenuItem>
                                </SplitButton>
                                <Button bsSize='xsmall' onClick={this.editEntryToggle}>Edit</Button>
                            </span>
                        </div>
                    </div>
                {itemarr}
                </div> 
                {this.state.addEntryToolbar ? <AddEntryModal title='Add Entry' header1={header1} header2={header2} header3={header3} createdTime={createdTime} updatedTime={updatedTime} updated={updated} type={type} id={id} entryToggle={this.entryToggle} /> : null}
                {this.state.editEntryToolbar ? <AddEntryModal type = {this.props.type} title='Edit Entry' header1={header1} header2={header2} header3={header3} createdTime={createdTime} updatedTime={updatedTime} targetid = {id} updated={updated} type={type} stage = {'Edit'} id={items.id} entryToggle={this.entryToggle} /> : null}
                {this.state.replyEntryToolbar ? <AddEntryModal title='Reply Entry' stage = {'Reply'} type = {type} header1={header1} header2={header2} header3={header3} createdTime={createdTime} updatedTime={updatedTime} targetid = {id} updated={updated} id={items.id} entryToggle={this.entryToggle} /> : null}
                {this.state.deleteToolbar ? <DeleteEntry type={type} id={id} deleteToggle={this.deleteToggle} entryid={items.id} updated={updated} /> : null}     
            </div>
        );
    }
});

var EntryData = React.createClass({ 
    getInitialState: function() {
        return {
            height:'1px',    
            count:0
        }
    },
    componentDidUpdate: function() {
        if (this.state.count <= 1) {
            setTimeout(function() {
                var newheight; 
                newheight = document.getElementById('iframe_'+this.props.id).contentWindow.document.body.scrollHeight;
                newheight = newheight + 'px';
                this.setState({height:newheight});
                var newcount = this.state.count;
                newcount += 1;
                this.setState({count:newcount});
            }.bind(this),300);
        }
        document.getElementById('iframe_'+this.props.id).contentWindow.location.reload(true);
    },
    componentDidMount: function () {
        this.setState({height:'2px'}); 
    },
    render: function() {
        var rawMarkup = this.props.subitem.body_flair;
        var id = this.props.id;
        /*var spanEntity = $('span').attr('data-entity-type');
        $('span').click(function() {
            var test = spanEntity;
            console.log(test);
        }).bind(this);*/
        return (
            <div className={'row-fluid entry-body'}>
                <div className={'row-fluid entry-body-inner'} style={{marginLeft: 'auto', marginRight: 'auto', width:'99.3%'}}>
                    <Frame frameBorder={'0'} id={'iframe_' + id} onLoad={this.onLoad} sandbox={'allow-popups allow-same-origin'} styleSheets={['/css/sandbox.css']} style={{width:'100%',height:this.state.height}}>
                    <div dangerouslySetInnerHTML={{ __html: rawMarkup}}/>
                    </Frame>
                </div>
            </div>
        )
    }
});

module.exports = SelectedEntry; 
