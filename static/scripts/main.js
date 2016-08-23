/*
  User Login Interface
*/
var UserLogin=React.createClass({
  //Hanlder for login event
  handleSubmitLogin:function(e){
    e.preventDefault();
    if(this.checkInput(this.refs.username.value)&&this.checkInput(this.refs.password.value)){
      this.props.handleLogin(this.refs.username.value, this.refs.password.value);
    }
  },

  //Hanlder for login event
  handleLogout:function(e){
    this.props.getLogout();
  },

  //Input check up for username or password
  checkInput:function(input){
    if(input === "") {
      alert("Error: Username or Password cannot be blank!");
      return false;
    }
    var re = /^\w+$/ ;
    if(!re.test(input)){
      alert("Error: Username or Password must only be letters, numbers and underscores!");
      return false;
    }
    return true;
  },
  render:function(){
    var loginView;
    if(this.props.login===''){
      loginView= <form className="loginForm" onSubmit={this.handleSubmitLogin}>
                    <label>Username:</label>
                    <input type="text" ref="username" maxLength="20"/>
                    <label>Password:</label>
                    <input type="password" ref="password" maxLength="20"/>
                    <button type="submit" >
                      Login
                    </button>
                  </form>
    }
    else{
      var loginInfo=this.props.login.split(': ');
      loginView=  <div>
                    <img className="barImg lattice" src="img/profile.png" />
                    <label className="lattice">User: {loginInfo[0]}</label>
                    <a className="hoverStyle lattice" onClick={this.handleLogout}>Logout</a>
                  </div>
    }
    return(
      <div className="col-md-3 col-sm-3 col-xs-5">{loginView}</div>
    )
  }
});

/*
Search Bar Component, search the user typed text from the selected doc
*/
var SearchBar=React.createClass({
  getInitialState:function(){
    return {
      index:-1, //the index number of a single searching string within searching results
      search:'' //user typed searching text showing in search box
    };
  },

  //If searched results are not empty, initialize index preparing for navigating through all searching results
  //update the showing searching text from the current searching text
  componentWillReceiveProps:function(newProps){
    if(newProps.selected>=0){
      this.setState({index:-1});
    }
    if(newProps.searchText!==this.state.search){
      this.setState({search:newProps.searchText});
    }
  },

  //Start searching
  handleSearch:function(e){
    e.preventDefault();
    this.props.getSearchText(this.state.search);
  },

  //Handle user type and show it synchronizely in the search input box
  handleChange:function(e){
    e.preventDefault();
    this.setState({search:e.target.value.trim()});
    if(e.target.value.trim().length===0){
      this.props.getSearchText('');
    }
  },

  //Scroll to the previous found result
  handleSearchPrev:function(e){
    e.preventDefault();
    if(this.props.insearch>0&&this.state.index>0){
      var index= this.state.index;
      var nodes= document.getElementsByTagName('mark');
      nodes[index].classList.remove("focusStyle");
      nodes[index-1].className="focusStyle";
      nodes[index-1].scrollIntoView(true);
      this.setState({index:index-1});
    }
  },

  //Scroll to the next found result
  handleSearchNext:function(e){
    e.preventDefault();
    if(this.props.insearch>0&&this.state.index<this.props.insearch-1){
      var index= this.state.index;
      var nodes= document.getElementsByTagName('mark');
      if(index>=0){
        nodes[index].classList.remove("focusStyle");
      }
      nodes[index+1].className="focusStyle";
      nodes[index+1].scrollIntoView(true);
      this.setState({index:index+1});
    }
  },
  render:function(){
    var searchResult='no results'
    var prevImg=null;
    var nextImg=null;
    if(this.props.insearch>0){
      if(this.state.index>=0){
        searchResult=<p>{this.state.index+1} of {this.props.insearch}</p>
      }
      else{
        searchResult=<p>{this.props.insearch} found</p>
      }
      prevImg=<img className="fileImg lattice hoverStyle" src="img/arrow-prev.png" onClick={this.handleSearchPrev}/>;
      nextImg=<img className="fileImg lattice hoverStyle" src="img/arrow-next.png" onClick={this.handleSearchNext}/>
    }
    return(
      <form className="col-md-5 col-sm-6 col-xs-6 flexColumn searchBox" onSubmit={this.handleSearch}>
          <input type="text" style={{borderWidth:'0'}} ref="search" maxLength={"20"} placeholder="Text Search"
              value={this.state.search} onChange={this.handleChange} />
          <div className="searchResult" >{searchResult}</div>
          <input type="submit" value="Search"/>
          <span title="Prev Search">{prevImg}</span>
          <span title="Next Search">{nextImg}</span>
      </form>
    )
  }
});

/*
Text View Component,displaying a scrollable list of doc tabs and text content
*/
var TextView=React.createClass({
  getInitialState:function(){
    return {
      tabList:[], //a list of tabs of docs selected by users
      scroll:false //automatically scroll or not to the specific tab
    };
  },

  //Remarkable is a third party library, used to mark strings with special symbols
  rawMarkup: function(text) {
    var md = new Remarkable();
    md.inline.ruler.enable([
      'mark'
    ]);
    var rawMarkup = md.render(text);
    return { __html: rawMarkup };
  },

  //Updating tab list if there is newly seleted doc
  componentWillReceiveProps:function(newProp){
    var activeId=newProp.selected;
    if(activeId<0){
      this.setState({tabList:[]});
    }
    else{
      if(this.state.tabList.indexOf(activeId)<0){
        this.state.tabList.push(activeId);
        this.setState({tabList:this.state.tabList});
      }
      this.setState({scroll:true});
    }
  },

  //Scroll to the selected tab conditionally
  componentDidUpdate:function(){
    if(this.state.tabList.length>0&&this.props.selected>=0&&this.state.scroll){
      this.scrollTo(this.props.selected);
    }
  },

  handleSelectTab:function(e){
    this.props.getFileText(parseInt(e.target.id));
  },

  //Close a tab
  handleCloseTab:function(e){
    e.stopPropagation();
    var id=parseInt(e.target.id);
    var tabList=this.state.tabList;
    var pos=tabList.indexOf(id);

    tabList.splice(pos,1);
    this.setState({tabList:tabList});

    if(id===this.props.selected){
      if(tabList.length===0) {
        this.props.getFileText(-1);
      }
      else if(pos===tabList.length) {
        this.props.getFileText(tabList[pos-1]);
      }
      else if(pos>=0) {
        this.props.getFileText(tabList[pos]);
      }
    }
    else{
      this.setState({scroll:false});
    }
  },

  //Scrolling function: scroll to left with certain distance
  scrollToLeft:function(e){
    var tablist=this.state.tabList;
    if(tablist.length>0){
      var leftTab=$('.tabRow #'+tablist[0].toString());
      var leftBorder=leftTab.offset().left;
      var scrollerLeft=$('#scroller-left').offset().left+$('#scroller-left').width();
      if((scrollerLeft-500)>=leftBorder){
        this.scrollerAnimation(-500);
      }
      else if(scrollerLeft>leftBorder){
        this.scrollerAnimation(leftBorder-scrollerLeft);
      }
    }
  },

  //Scrolling function: scroll to right with certain distance
  scrollToRight:function(e){
    var tablist=this.state.tabList;
    if(tablist.length>0){
      var rightTab=$('.tabRow #'+tablist[tablist.length-1].toString());
      var rightBorder=rightTab.offset().left+rightTab.width();
      var scrollerRight=$('#scroller-right').offset().left;
      if((scrollerRight+500)<=rightBorder){
        this.scrollerAnimation(500);
      }
      else if(scrollerRight<rightBorder){
        this.scrollerAnimation(rightBorder-scrollerRight);
        }
    }
  },

  //Scrolling function:
  //According to a doc Id, scroll to the corresponding doc tab so that it is in view
  scrollTo:function(id){
    if(id>=0){
      var scrollerRight=$('#scroller-right').offset().left;
      var scrollerLeft=$('#scroller-left').offset().left+$('#scroller-left').width();
      var left=$('.tabRow #'+id.toString()).offset().left;
      var right=left+$('.tabRow #'+id.toString()).width();
      if(left<scrollerLeft){
        this.scrollerAnimation(left-scrollerLeft);
        return;
      }
      if(right>scrollerRight){
        this.scrollerAnimation(right-scrollerRight);
        return;
      }
    }
  },

  // Scrolling animation function
  scrollerAnimation:function(value){
    var baseOffset=$(".tabWrapper").offset().left;
    var offset=$('.tabRow').offset().left-baseOffset;
    $('.tabWrapper').animate({
      scrollLeft: value-offset
    },500);
  },
  render:function(){
    var text;
    if(this.props.insearch>0){
      text=<span dangerouslySetInnerHTML={this.rawMarkup(this.props.text)}/>
    }
    else {
      text=<p>{this.props.text}</p>
    }

    var scrollerLeft,scrollerRight;
    if(this.state.tabList.length>0){
      scrollerLeft=<span id="scroller-left" className="scroller-left" title="Scroll to Left"><button onClick={this.scrollToLeft}>&lt;</button></span>;
    }
    if(this.state.tabList.length>0){
      scrollerRight=<span id="scroller-right" className="scroller-right" title="Scroll to Right"><button onClick={this.scrollToRight}>&gt;</button></span>;
    }

    var tabs=[];
    this.state.tabList.forEach(function(value,index){
      var fileList=this.props.list[value];
      var fileName=fileList.name;
      if(fileName.length>30){
        fileName=fileName.substring(0,30);
      }
      if(value===this.props.selected){
        tabs.push(<li id={fileList.id} role="presentation" className="active tabLi" key={fileList.id}>
                    <a id={fileList.id} className="tabText" onClick={this.handleSelectTab}>
                      <button id={fileList.id} className="close" onClick={this.handleCloseTab}>&times;</button>
                      {fileName}
                    </a>
                  </li>);
      }
      else {
        tabs.push(<li id={fileList.id} className="tabLi" role="presentation" key={fileList.id}>
                    <a id={fileList.id} className="tabText" onClick={this.handleSelectTab}>
                      <button id={fileList.id} className="close" onClick={this.handleCloseTab}>&times;</button>
                      {fileName}
                    </a>
                  </li>);
      }
    }.bind(this))

    return(
      <div className="col-md-8 col-sm-8 col-xs-6 Right panel panel-default">
        <div>
          {scrollerLeft}
          {scrollerRight}
          <div className="tabWrapper">
            <ul className="nav nav-tabs tabRow">
              {tabs}
            </ul>
          </div>
        </div>
        {text}
      </div>
    )
  }
});

/*
Item Component for Doc List, renders whether item is selected or not
*/
var ListItem=React.createClass({
  handleSelectItem:function(){
    this.props.handleSelect(this.props.item.id);
  },
  render:function(){
    var selectStyle={
      backgroundColor: '#ffffff'
    };
    if(this.props.selected){
      selectStyle={
        backgroundColor: '#d9d9d9'
      }
    }
    return(
      <tr style={selectStyle}>
        <td><img className="fileImg" src={"img/doc.png"} /></td>
        <td><a className="hoverStyle" onClick={this.handleSelectItem}>{this.props.item.name}</a></td>
      </tr>
    )
  }
})

/*
Doc List Component, listing the list of docs retrieved from server
*/
var ListView=React.createClass({
  handleSelect:function(id){
    this.props.getFileText(id);
  },
  handleReload:function(){
    this.props.reloadList();
  },
  render:function(){
    var allList=[];
    if(this.props.list.length>0){
      this.props.list.forEach(function(item,index){
        if(typeof item !== 'undefined'&&item.name!==''){
          if(index===this.props.selected){
            allList.push(<ListItem key={item.id} item={item} handleSelect={this.handleSelect} selected={true}/>);
          }
          else{
            allList.push(<ListItem key={item.id} item={item} handleSelect={this.handleSelect} selected={false}/>);
          }
        }
      }.bind(this));
    }
    return(
      <div className="col-md-4 col-sm-4 col-xs-6 Left panel panel-default">
        <table>
          <thead>
            <tr>
              <th><img className="fileImg" src={"img/folder.png"} alt="File List" /></th>
              <th><h5><span className="hoverStyle" title="Reload File List" onClick={this.handleReload}>File List</span></h5></th>
            </tr>
          </thead>
          <tbody>
            {allList}
          </tbody>
        </table>
      </div>
    )
  }
});

/*
The main component as an interface to server and a dispatcher to child components
*/
var FileBrowser=React.createClass({
  getInitialState:function(){
    var login = localStorage.getItem("login");
    if (typeof(Storage)=== "undefined"||login===null) {
      login='';
    }
    return {
      login:login, //login info used to request from server
      fileList:[], //a list of docs retrieved from server
      originalText:'', //the original text content from the selected doc
      text:'Please Open File List', //the showing text content for Text View Component
      selected:-1, //currently selected active doc Id
      insearch:0, //how many strings are found by searching
      searchText:'' //the user typed searching text
    };
  },

  //Handler for logining, sotores session if successfuly logged in
  //@params 'username': login username, 'password': login password
  handleLogin:function(username,password){
    var link="/login";
    $.ajax({
      url: link,
      dataType: 'json',
      type: 'POST',
      data: {"username":username,"password":password},
      success: function(data) {
        if(data.hasOwnProperty('token')){
          this.setState({
            login: username+": "+data.token,
            text:'Select One File To Read Text'
          });
          localStorage.setItem("login", this.state.login);
          this.getFileList();
        }
        else{
          alert("No token is given by server!");
        }
      }.bind(this),
      error: function(xhr, status, err) {
        this.handleError(link, xhr, status, err);
      }.bind(this)
    });
  },

  //Handler for loging out, resets all states to initial states
  getLogout:function(){
    this.setState({
      login:'',
      text:'',
      selected:-1,
      fileList:[],
      insearch:0,
      searchText:''
    });
    localStorage.removeItem("login");
  },

  //Handler for retrieving a list of docs from server
  //stores doc list to state 'fileList'
  getFileList:function(){
    var link="/documents";
    $.ajax({
      url: link,
      dataType: 'json',
      type: 'GET',
      headers: {"Authorization":this.state.login},
      success: function(data) {
        this.setState({
          fileList:data
        });
      }.bind(this),
      error: function(xhr, status, err) {
        this.handleError(link, xhr, status, err);
      }.bind(this)
    });
  },

  //Handler for requesting the text content from the selected doc from server
  //stores text data and selected doc Id into local states 'text' and 'selected'
  //@params 'id': the Id of the selected doc
  getFileText:function(id){
    if(id<0){
      this.setState({
        text:'Select One File To Read Text',
        selected:-1,
        insearch:0,
        searchText:'',
      });
    }
    else{
      var link="/document/"+id+"/text";
      $.ajax({
        url: link,
        dataType: 'json',
        type: 'GET',
        headers: {"Authorization":this.state.login},
        success: function(data) {
          this.setState({
            originalText:data,
            text:data,
            selected:id
          });
          if(this.state.searchText!==''){
            this.getSearchText(this.state.searchText);
          }
        }.bind(this),
        error: function(xhr, status, err) {
          this.handleError(link, xhr, status, err);
        }.bind(this)
      });
    }
  },

  //Handler for requesting searching result from the selected doc from server
  //continue to highlight the searched result from the selected doc, if found results
  //otherwise set state 'insearch' to no results found
  //@params 'search': a user typed in search text
  getSearchText:function(search){
    this.setState({searchText:search});
    if(this.state.selected>=0){
      if(search===''){
        this.setState({
          text:this.state.originalText,
          insearch:0
        });
      }
      else{
        var link="/document/"+this.state.selected+"/text";
        $.ajax({
          url: link,
          dataType: 'json',
          type: 'GET',
          headers: {"Authorization":this.state.login},
          data:{"search":search},
          success: function(data) {
            if(data.length>0){
              this.highLightSearch(data);
            }
            else{
              this.setState({
                insearch:0
              });
            }
          }.bind(this),
          error: function(xhr, status, err) {
            this.handleError(link, xhr, status, err);
          }.bind(this)
        });
      }
    }
    else if(this.state.login===''){
      alert("Login First!");
    }
    else {
      alert("Select One File First!");
    }
  },

  //Given the searched results from server and mark the text data
  //@params 'arr' searched results (locations inside string) from server
  highLightSearch:function(arr){
    var text=this.state.originalText;
    var newtext='';
    var begin=0;
    var end;
    for(var i=0;i<arr.length;i++){
      if(i<(arr.length-1)){
          end=arr[i+1][0];
      }
      else {
        end=text.length-1;
      }
      newtext+=text.substring(begin,arr[i][0])+"=="+text.substring(arr[i][0],arr[i][1])
                +"=="+text.substring(arr[i][1],end);
      begin=end;
    }
    this.setState({
      text:newtext,insearch:arr.length
    });
  },

  //Error Handler
  //@params 'link':which http link received error, 'xhr' an XML response from server
  //'status':server status, 'err' error from server
  handleError:function(link,xhr,status,err){
    var message=JSON.parse(xhr.responseText).message;
    if(message==='Signature has expired'){
      this.getLogout();
    }
    alert(message);
    console.error(link, status, err.toString());
  },
  render:function(){
    var view;
    if(this.state.login===''){
      view=<div className="centerParent">
              <div className="panel panel-default center">
                <div className="panel-heading">Login</div>
                <div className="panel-body"> <UserLogin handleLogin={this.handleLogin} login={this.state.login}/> </div>
              </div>
            </div>;
    }
    else{
      view=  <div>
                <div className="row Top">
                  <div className="col-md-4 col-sm-3 col-xs-1"></div>
                  <SearchBar getSearchText={this.getSearchText} insearch={this.state.insearch}
                      selected={this.state.selected} searchText={this.state.searchText}/>
                  <UserLogin handleLogin={this.handleLogin} login={this.state.login} getLogout={this.getLogout}/>
                </div>
                <div className="row Frame">
                  <ListView list={this.state.fileList} getFileText={this.getFileText}
                      reloadList={this.getFileList} selected={this.state.selected}/>
                  <TextView text={this.state.text} insearch={this.state.insearch}
                      selected={this.state.selected} list={this.state.fileList}
                      getFileText={this.getFileText}/>
                </div>
              </div>;
    }
    return(
      <div>
        {view}
      </div>
    )
  }
});

ReactDOM.render(
  <FileBrowser />,
  document.getElementById('container')
)
