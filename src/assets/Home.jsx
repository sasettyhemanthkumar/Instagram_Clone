import axios from 'axios'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { loginTokenContext, proDataContext, profileTokenContext } from '../App';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/groupChat.css"
import { toast } from 'react-toastify';
import ProgressSpinner from './ProgressSpinner';
import {format} from 'timeago.js'


const Home = () => {
  const api = import.meta.env.VITE_API_URL;
  const [loginToken] = useContext(loginTokenContext)
  const [data, setData] = useState([])
  const [like, setLike] = useState(false)
  const [like1, setLike1] = useState("")
  const [loader, setLoader] = useState(false)
  const [today, setToday] = useState(false)
  const navigate = useNavigate()
  const [profileToken] = useContext(profileTokenContext)
  const [proData] = useContext(proDataContext)
  const [likesCount, setLikesCount] = useState({});
  const [comment, setComment] = useState("")
  const [sendSpin, setSendSpin] = useState(false)
  const [postId, setPostId] = useState("")
  const [postComments, setPostComments] = useState([])
  const goUp = useRef()
  const [commentLoader, setCommentLoader] = useState(false)
  const [commDelSpin, setCommDelSpin] = useState(false)



  // fetching all messages from database 
  useEffect(() => {
    setLoader(true)
    const getData = async () => {

      try {
        const response = await axios.get(`${api}/message/get-all-messages`)
        const fetchedData = response.data.allMessages
        setData(fetchedData.reverse())
        setLoader(false)
      } catch (error) {
        console.log(error)
      }
    }
    getData()

    // uploaded date function 
    const currentDate = new Date().toLocaleDateString("en-GB")
    setToday(currentDate)

    getAllLikes()

  }, [])

  // post like function 
  const likePostFunc = async (postId) => {
    setLike(!like)
    setLike1(postId)
    try {
      const response = await axios.post(`${api}/like/like-post`, {
        userName: proData.userName,
        profileId: proData._id,
        postId: postId,
        profilePic: proData.image
      })
      if (response) {
        getAllLikes()
      }
    } catch (error) {
      console.log(error)
    }

  }

  // get all likes function 
  const getAllLikes = async () => {
    try {
      const response = await axios.get(`${api}/like/get-likes`)
      if (response) {
        const likesCountMap = response.data.reduce((acc, like) => {
          acc[like.postId] = (acc[like.postId] || 0) + 1;
          return acc;
        }, {});
        setLikesCount(likesCountMap);
      }
    } catch (error) {
      console.log(error)
    }

  }

  useEffect(() => {
    getAllLikes()
  }, [like1])

  // share web api function 
  const shareImage = async (image) => {
    const url = "https://chathubb.netlify.app/"
    try {
      await navigator.share({
        text:
          `Hello, check this image link from ChatHub your friend shared to you : ${image} and Connect to the people across the world, welcome to ChatHub : ${url}`

      });

    } catch (error) {
      console.error("Error sharing the website:", error);
    }
  };


  // if token is not available it navigate to login page 
  useEffect(() => {
    if (!loginToken) {
      navigate("/login")
    } else if (!profileToken) {
      navigate("/createprofile")
    }
  }, [loginToken, navigate, profileToken])


  // send comment function 

  const sendCommentFunc = async () => {
    setSendSpin(true)
    try {
      const currentDate = new Date().toLocaleDateString("en-GB");
      // sending message object data 
      const commentData = {
        comment: comment,
        date: currentDate,
        profileImage: proData.image,
        userName: proData.userName,
        profileId: proData._id,
        postId: postId,
      }
      const response = await axios.post(`${api}/comment/send-comment`, commentData)
      if (response) {
        setSendSpin(false)
        setComment("")
        getAllComments(postId)
      }
    } catch (error) {
      console.error("Error sharing the website:", error);
      toast.error("comment has not sent try again")
      setSendSpin(false)
    }
  }

  // get all comments function 
  const getAllComments = async (postId) => {
    setPostId(postId)
    setCommentLoader(true)
    try {
      const response = await axios.get(`${api}/comment/get-all-comments`)
      if (response) {
        const data = response.data
        const filteredComments = data.filter((item) => item.postId === postId)
        setPostComments(filteredComments.reverse())
        setCommentLoader(false)
      }

      if (postComments.length) {
        goUp.current.scrollIntoView({ behavior: "smooth" })
      }
    } catch (error) {
      console.error("Error sharing the website:", error);
      setSendSpin(false)
      setCommentLoader(false)
    }
  }
  // deleting comments 
  const deleteComment = async (commentId) => {
    setCommDelSpin(commentId)
    try {
      const response = await axios.delete(`${api}/comment/delete-comment/${commentId}`)
      if (response) {
        const remainingComments = postComments.filter((item) => item._id !== commentId)
        setPostComments(remainingComments)
        setCommDelSpin(false)
      }
    } catch (error) {
      console.error("Error sharing the website:", error);
      toast.error("please try again comment has not deleted")
      setCommDelSpin(false)
    }
  }

  return (
    <>
      <div className='home-container'>

        {/*bootstrap spinner code  */}
        {loader ? <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
           <ProgressSpinner/>
        </div>
          : ""}

        {/* map function  */}
        {data.map((item) => (
          <div key={item._id} className='home-post-card'>
            <Link to={`/${item.profileId}`} className='d-flex align-items-center gap-2 text-white' style={{ textDecoration: "none" }}>
              <img src={item.profileImage} className='home-profile-img' />
              <h5 className=''>{item.userName}</h5>
            </Link>

            <img src={item.postImage} className='home-post-img ' alt="post image" />

            <div className='like-share-card' style={{ marginBottom: "0.5rem" }}>

              {item._id === like1 ?
                <svg style={{ cursor: "pointer" }} xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-heart-fill heart-icon1" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314" />
                </svg> :
                <span style={{ cursor: "pointer", fontSize: "22px", width: "20px" }} onClick={() => likePostFunc(item._id)} className="material-symbols-outlined m-0 p-0" >favorite</span>}
              <span onClick={() => getAllComments(item._id)} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom" style={{ fontSize: "22px", cursor: "pointer" }} className="material-symbols-outlined d-block d-md-none" >
                mode_comment
              </span>
              <span onClick={() => getAllComments(item._id)} type="button" style={{ fontSize: "22px", cursor: "pointer" }} className="material-symbols-outlined d-none d-md-block" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
                mode_comment
              </span>

              <span onClick={() => shareImage(item.postImage)} style={{ fontSize: "22px", cursor: "pointer" }} className="material-symbols-outlined">
                share
              </span>
            </div>

            <h5 className='uploaded-date mt-0 text-white'>{likesCount[item._id] || 0} Likes</h5>
            <h5 className='img-caption-text'>{item.message}</h5>
            <h5 type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom" className='uploaded-date mt-2 d-block d-md-none' onClick={() => getAllComments(item._id)}>View all comments</h5>
            <h5 type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight" className='uploaded-date mt-2 d-none d-md-block' onClick={() => getAllComments(item._id)}>View all comments</h5>
            <h5 className='uploaded-date mt-2'>{today === item.date ?   "Uploaded Today" : `Uploaded on ${item.date}`}</h5>
          </div>

        ))}
      </div>


      {/* offcanvas for comments  */}
      <div className="offcanvas offcanvas-bottom  bg-dark text-white" style={{ height: "80vh" }} tabIndex="-1" id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel">
        <div className="offcanvas-header py-3">
          <h5 className="offcanvas-title" id="offcanvasBottomLabel">Comments</h5>
          <button type="button" className="btn-close bg-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div><hr className='p-0 m-0' />
        <div className="offcanvas-body small">

          {/* comment box card  */}
          <div className='chat-input-card fixed-bottom' >
            <div className='chat-sub-card'>
              <div className='camera-icon-in-chat' style={{ borderRadius: "0px" }}>
                <img src={proData.image} className='home-profile-img ' style={{ width: "30px", height: "30px" }} />
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} type='text' className='input-box-in-chat' placeholder='Add a comment...'></textarea>
              {sendSpin ? <button style={{ borderRadius: "0px" }} className="chat-send-bt text-white" type="button" disabled>
                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span className="visually-hidden" role="status">Loading...</span>
              </button> : <>{comment ? <span className='material-symbols-outlined camera-icon-in-chat' style={{ fontSize: "27px", borderRadius: "0px", color: "white" }} onClick={sendCommentFunc}>send</span> : ""}</>}
            </div>
          </div>

          {/* map function card  */}


          {commentLoader ? <div className="d-flex justify-content-center align-items-center" style={{ height: "80%" }}>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div> : <>
            {postComments.length ? <> <div className='message-main-card pb-2'>
              <div ref={goUp}>
              </div>
              {postComments.map((item) => (
                <div key={item._id} className="chat-text-main-card " style={{ width: "100%", marginBottom: "1rem" }}>
                  <div className='chat-img-user-card '>
                    <Link to={`/${item.profileId}`} style={{ textDecoration: "none" }} className='d-flex align-items-center gap-2' >
                      <img src={item.profileImage} className='chat-user-img' alt={item.userName} />
                      <h5 className="user-name-in-chat" >{item.userName.substring(0, 16)}</h5>
                      <span className='date-in-chat text-white' style={{ marginBottom: "0.4rem" }}>{item.date}</span>
                    </Link>

                    {commDelSpin === item._id ? <div className='mb-2' style={{ marginTop: "0", paddingTop: "0" }}  >
                      <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <div className="spinner-grow spinner-grow-sm mx-1" style={{ height: "10px", width: "10px" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div></div> : <span onClick={() => deleteComment(item._id)} className={item.profileId === proData._id ? "material-symbols-outlined delete-icon-in-chat" : "d-none"}>
                      delete
                    </span>}
                  </div>
                  <div className='text-card pt-2 mt-0' >
                    <h5 className='chat-text mb-0 '>{item.comment}</h5>
                  </div>
                </div>
              ))}
            </div></> : <div className='fw-bold fs-5 d-flex justify-content-center align-items-center ' style={{ height: "85%", width: "100%" }}>No comments yet</div>}
          </>}

        </div>
      </div>


      {/* large screen offcanvas  */}
      <div
        className="offcanvas offcanvas-end d-none d-md-block bg-dark text-white"
        tabIndex={-1}
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasRightLabel">
            Comments
          </h5>
          <button
            type="button"
            className="btn-close bg-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <hr className='p-0 m-0' />
        <div className="offcanvas-body">

          {/* comment box card  */}
          <div style={{ width: "100%" }}>
            <div className='d-flex align-items-center' style={{ width: "100%" }}>
              <div className='camera-icon-in-chat' style={{ borderRadius: "0px" }}>
                <img src={proData.image} className='home-profile-img ' style={{ width: "30px", height: "30px" }} />
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} type='text' className='input-box-in-chat' placeholder='Add a comment...'></textarea>
              {sendSpin ? <button style={{ borderRadius: "0px" }} className="chat-send-bt text-white" type="button" disabled>
                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span className="visually-hidden" role="status">Loading...</span>
              </button> : <>{comment ? <span className='material-symbols-outlined camera-icon-in-chat' style={{ fontSize: "27px", borderRadius: "0px", color: "white" }} onClick={sendCommentFunc}>send</span> : ""}</>}
            </div>
          </div>


          {/* map function card  */}
          {commentLoader ? <div className="d-flex justify-content-center align-items-center" style={{ height: "75vh" }}>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div> : <>
            {postComments.length ? <> <div className='pt-4 large-screen-comments-card' >
              <div ref={goUp}>
              </div>
              {postComments.map((item) => (
                <div key={item._id} className="chat-text-main-card " style={{ width: "100%", marginBottom: "1rem" }}>
                  <div className='chat-img-user-card '>
                    <Link to={`/${item.profileId}`} style={{ textDecoration: "none" }} className='d-flex align-items-center gap-2' >
                      <img src={item.profileImage} className='chat-user-img' alt={item.userName} />
                      <h5 className="user-name-in-chat" >{item.userName.substring(0, 16)}</h5>
                      <span className='date-in-chat text-white' style={{ marginBottom: "0.3rem" }}>{item.date}</span>
                    </Link>
                    {commDelSpin === item._id ? <div className='mb-2' style={{ marginTop: "0", paddingTop: "0" }}  >
                      <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <div className="spinner-grow spinner-grow-sm mx-1" style={{ height: "10px", width: "10px" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div></div> : <span onClick={() => deleteComment(item._id)} className={item.profileId === proData._id ? "material-symbols-outlined delete-icon-in-chat" : "d-none"}>
                      delete
                    </span>}

                  </div>
                  <div className='text-card pt-2 mt-0'>
                    <h5 className='chat-text mb-0 '>{item.comment}</h5>
                  </div>

                </div>

              ))}


            </div></> : <div className='fw-bold fs-5 d-flex justify-content-center align-items-center ' style={{ height: "75vh" }}>No comments yet</div>}
          </>}



        </div>
      </div>

    </>

  )
}

export default Home