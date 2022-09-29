import type { NextPage } from "next";
import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Paper, Typography } from "@mui/material";

interface IPostResponse {
  body: string;
  id: number;
  title: string;
  userId: number;
}

interface ICommentResponse {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

interface IPost {
  body: string;
  id: number;
  title: string;
  userId: number;
  comments: ICommentResponse[];
}

interface FeedProps {
  data: IPost[];
  commentToggles: boolean[];
  onToggle: any;
}

interface PostCardProps {
  post: IPost;
  showComments: boolean;
  onToggle: any;
}

const FEED_URL = 'https://jsonplaceholder.typicode.com/posts';

const getCommentUrl = (id: number) => `${FEED_URL}/${id}/comments`; 

const getFeed = async () => {
  try {   
    const response = await axios.get(FEED_URL);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

const getComments = async (id: number) => {
  try {   
    const url = getCommentUrl(id);
    // console.log('GET COMMENTS ', url);
    const response = await axios.get(url);
    return Promise.resolve(response.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

const PostCard:React.FC<PostCardProps> = ({post, onToggle, showComments}) => {
  return <Paper sx={{
    marginY:2,
    padding:2,
  }}
  
  key={post.id}>
    <div>ID : {post.id}</div>
    <div>Title : {post.title}</div>
    {post.comments.length > 0 && 
      <div 
        style={{cursor: 'pointer'}}
        onClick={() => onToggle(post.id)}>
          {post.comments.length} Comments {showComments ? 'HIDE' : 'SHOW'}
      </div>}
    {showComments && <>
      <ul>
      {post.comments.map((comment) => <li key={comment.id}>
        <div>{comment.postId} | {comment.id}</div>
        <div>{comment.name} | {comment.email}</div>
        <div>{comment.body}</div>
      </li>)}
      </ul>
    </>}
  </Paper>
};

const Feed:React.FC<FeedProps> = ({data, onToggle, commentToggles}) => {
  return (<>
    {data.map((post) => 
      <PostCard key={post.id} post={post} onToggle={onToggle} showComments={commentToggles[post.id-1]}
      />)}
  </>);
}; 

const FeedPage: NextPage = () => {
  const [feed, setFeed] = useState<IPost[]>();
  const [toggleState, setToggleState] = useState<boolean[]>([]);

  useEffect(() => {
    getFeed()
      .then((response) => {
        const commentRequests = [] as Array<Promise<any>>;
        const feedData = [] as Array<IPost>;
        const toggleData = [];

        response.forEach((post: IPostResponse) => {
          const {id, body, title, userId } = post;
          feedData.push({id, body, title, userId, comments: []});
          toggleData.push(false);
          
          commentRequests.push(getComments(post.id));
        });

        Promise.all(commentRequests)
          .then(postComments => {

            // Add the comments to the feedData list... 

            postComments.forEach((commentBlock) => {
              // Go through each block of comments and add them to the correct entry in the feed data list...
              commentBlock.forEach((comment) => {
                const {postId} = comment;

                // This is safe because the ID's of the posts are in sequential order - if they weren't then this would need to 
                // find the matching post THEN push the comment into the comment list.
                const originalPost = feedData[postId-1];
                originalPost.comments.push(comment);
              });
            });

            setFeed(feedData);
            setToggleState(toggleData);

            console.log('LOADING ALL DONE!!!');
          })
          .catch((error) => {
            console.error(error);
            setFeed(undefined);
          });
      })
      .catch(
      (error) => {
        console.error(error);
        setFeed(undefined);
      }
    ); 
  }, []);

  return <>
    <Container sx={{maxWidth: "75%"}}>
      <Typography variant="h4" component="h2" marginBottom={3} marginTop={5}>
        Feed
      </Typography>
      {feed ? <Feed data={feed} commentToggles={toggleState} onToggle={(index) => {

        console.log('HOISTED TOGGLE ', index);
        const actualPost = index-1;

        const newToggleData = [...toggleState];
        newToggleData[actualPost] = !toggleState[actualPost];
        setToggleState(newToggleData);
      }} /> :
      <Typography variant="h4" component="h2" marginBottom={3} marginTop={5}>
        Loading
      </Typography>
      }
    </Container>
  </>
};

export default FeedPage;
