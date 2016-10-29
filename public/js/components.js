var Comment = React.createClass({
  getInitialState: function() {
    return {id: ''};
  },
  handleDelete: function(e){
    e.preventDefault();

    var r = confirm("Are you sure want to delete?");
    if (r == true) {
      $.ajax({
        url: '/api/comments',
        dataType: 'json',
        type: 'DELETE',
        data: {
          'id': this.props.dataid
        },
        success: function(data){
        }
      });
    }
  },
  rawMarkup: function(){
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return {__html: rawMarkup};
  },
  render: function(){
    return(
      <li className="comment">
      <div className="row">
      <div className="col-xs-1 text-center">
      <a className="btn btn-action" onClick={this.handleDelete}>
      <span className="glyphicon glyphicon-minus-sign" aria-hidden="true"></span>
      </a>
      </div>
      <div className="col-xs-11 text-left">
        <div className="well">
          <h2 className="commentAuthor">
          {this.props.author}
          </h2>
          <span dangerouslySetInnerHTML={this.rawMarkup()} />
        </div>
      </div>
      </div>
      </li>
    );
  }
});

var CommentList = React.createClass({
  render: function(){
    var commentNodes = this.props.data.map(function(comment){
      return(
        <Comment author={comment.author} key={comment.id} dataid={comment.id}>
        {comment.text}
        </Comment>
      )
    });
    return(
      <ul className="commentList">
      {commentNodes}
      </ul>
    )
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e){
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e){
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e){
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if(!text || !author){
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    this.setState({author: '', text: ''});
  },
  render: function(){
    return(
      <ul>
        <li>
          <div className="row">
            <div className="col-xs-1 text-center">
              <a className="btn btn-action">
                <span className="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>
                </a>
            </div>
            <div className="col-xs-11 text-left">
              <div className="well">
              <form className="CommentForm" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input
                type="text"
                className="form-control"
                placeholder="your name"
                value={this.state.author}
                onChange={this.handleAuthorChange} />
              </div>
              <div className="form-group">
                <input
                type="text"
                className="form-control"
                placeholder="Say something..."
                value={this.state.text}
                onChange={this.handleTextChange} />
              </div>
              <input type="submit" value="Post" className="btn btn-primary addcomment" />
              </form>
              </div>
            </div>
          </div>
        </li>
      </ul>
    )
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function(){
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment){
    var comments = this.state.data;
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data){
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err){
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function(){
    return {data: []};
  },
  componentDidMount: function(){
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.polInterval);
  },
  render: function(){
    return(
      <div className="commentBox container">
      <div className="panel panel-info"> <div className="panel-heading"> <h3 className="panel-title"><h1>Hacktiv8 Comments Apps</h1></h3> </div> <div className="panel-body">   <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} /> </div> </div>


      </div>
    )
  }
});

ReactDOM.render(
  <CommentBox url="/api/comments" pollInterval={2000} />,
  document.getElementById('content')
);
