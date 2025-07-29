import React, { useContext, useEffect, useRef, useState } from 'react'
import "../styles/profile.css"
import { loginTokenContext, proDataContext, profileTokenContext, refreshContext } from '../App';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import app from '../firebase';
import { ToastContainer, toast } from 'react-toastify';
import "../styles/groupChat.css"


const Profile = ({ spinner1 }) => {
  const api = import.meta.env.VITE_API_URL;
  const [loginToken, setLoginToken] = useContext(loginTokenContext)
  const navigate = useNavigate()
  const [profileToken, setProfileToken] = useContext(profileTokenContext)
  const [proData] = useContext(proDataContext)
  const [filter, setFilter] = useState([])
  const [spinner, setSpinner] = useState(false)
  const [fileSpinner, setFileSpinner] = useState(false)
  const [refresh, setRefresh] = useContext(refreshContext)
  const [singlePost, setSinglePost] = useState([])
  const [modal, setModal] = useState(false)
  const [like, setLike] = useState(false)
  const [like1, setLike1] = useState("")
  const [today, setToday] = useState(false)
  const [delSpinn, setDelSpinn] = useState(false)
  const [allDelSpinner, setAllDelSpinner] = useState(false)
  const [privateId, setPrivateId] = useState("")
  const [priSpinn, setPriSpinn] = useState(false)
  const [idCard, setIdCard] = useState(false)
  const [followers, setFollowers] = useState([])
  const [followings, setFollowings] = useState([])
  const [comment, setComment] = useState("")
  const [sendSpin, setSendSpin] = useState(false)
  const [postId, setPostId] = useState("")
  const [postComments, setPostComments] = useState([])
  const goUp = useRef()
  const [commentLoader, setCommentLoader] = useState(false)
  const [commDelSpin, setCommDelSpin] = useState(false)


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

  // retrieving privateId from localstorage 
  useEffect(() => {
    const privateId = localStorage.getItem("privateId")
    if (privateId) {
      setPrivateId(JSON.parse(privateId))
    }

  }, [loginToken, profileToken, privateId])


  // fetching posts data 

  useEffect(() => {
    const userId = proData._id

    const getPostData = async () => {
      setSpinner(true)
      try {

        const response = await axios.get(`${api}/message/get-all-messages`)
        if (response) {
          const data = response.data.allMessages.reverse()

          // filtering post from all posts 
          const filteredData = data.filter((item) => item.profileId === userId)

          setFilter(filteredData)
          setSpinner(false)
        }
      } catch (error) {
        console.log(error);
        setSpinner(false)
      }
    }

    getPostData()


    // uploaded date function 
    const currentDate = new Date().toLocaleDateString("en-GB")
    setToday(currentDate)
  }, [proData])



  // update photo function 

  const updatePhoto = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        setFileSpinner(true)
        const storage = getStorage(app)
        const storageRef = ref(storage, "profile/" + file.name)
        await uploadBytes(storageRef, file);
        const downLoadUrl = await getDownloadURL(storageRef)

        if (downLoadUrl) {

          const update = { user: proData.user, image: downLoadUrl }
          try {
            const response = await axios.put(`${api}/profile/update-photo`, update)
            if (response) {
              setFileSpinner(false)
              setRefresh("image has updated")
              toast.success("profile Photo has updated successfully")
            }
          } catch (error) {
            console.log(error)
            toast.error("Please try again profile Photo has not updated")
            setFileSpinner(false)
          }
        }
      } catch (error) {
        setFileSpinner(false)
        console.log(error)
        alert("Please try again Profile photo not uploaded2 ")
      }
    }
  }


  // delete post function 
  const openPost = (postId) => {
    setModal(true)
    const singlePost = filter.find((item) => item._id === postId)
    setSinglePost(singlePost)

  }

  // like function
  const likeFunc = (likeId) => {
    setLike(!like)
    setLike1(likeId)
  }

  // delete post function 

  const deletePostFunc = async (delId) => {
    try {
      setDelSpinn(true)
      const response = await axios.delete(`${api}/message/delete-message/${delId}`)
      if (response) {
        const remaining = filter.filter((item) => item._id !== delId)
        setFilter(remaining)
        setModal(false)
        setDelSpinn(false)
      }
    } catch (error) {
      console.log(error)
      setDelSpinn(false)
      alert("Please try again post has not deleted")
    }
  }


  // log out function 
  const logOut = () => {
    localStorage.removeItem("profileToken")
    setProfileToken("")
    localStorage.removeItem("loginToken")
    setLoginToken("")

  }




  // next profile delete function 
  const deleteProfile = async () => {
    try {
      setAllDelSpinner(true)
      const response = await axios.delete(`${api}/profile/delete-profile/${proData._id}`)
      if (response) {
        deleteUserAccount()
      }
    } catch (error) {
      console.log(error);
    }
  }

  // delete user account 

  const deleteUserAccount = async () => {
    try {
      const response = await axios.delete(`${api}/user/delete-user/${proData.user}`)
      if (response) {
        localStorage.removeItem("loginToken")
        setLoginToken("")
        localStorage.removeItem("profileToken")
        setProfileToken("")
      }
    } catch (error) {
      console.log(error);
    }
  }



  // share web api function 
  const shareWebsite = async () => {
    try {
      await navigator.share({
        text: "Hello, I am venu check out this ChatHub website connect to the people accross the world!",
        url: "https://chathubb.netlify.app/"
      });

    } catch (error) {
      console.error("Error sharing the website:", error);
    }
  };


  // web api clipboard function 
  const copyProfileId = async () => {
    try {
      await navigator.clipboard.writeText(proData._id)
      toast.success("Profile Id has been copied to clipboard successfully")
      setIdCard(false)
    } catch (error) {
      toast.error("Profile Id has not been copied, please try again")
      console.error(error);

    }
  }

  // set private function 
  const setPrivate = async () => {
    try {
      setPriSpinn(true)
      const response = await axios.post(`${api}/privateaccount/set-private`, { profileId: proData._id })
      if (response) {
        setPrivateId(response.data._id)
        localStorage.setItem("privateId", JSON.stringify(response.data._id))
        toast.success("Your Profile has been changed to private account ")
        setPriSpinn(false)
      }
    } catch (error) {
      toast.error("Profile has not changed to private, please try again")
      console.error(error);
      setPriSpinn(false)

    }
  }

  // set private function 
  const setPublic = async () => {
    try {
      setPriSpinn(true)
      const response = await axios.delete(`${api}/privateaccount/delete-private/${privateId}`)
      if (response) {
        localStorage.removeItem("privateId")
        setPrivateId("")
        toast.success("Your Profile has been changed to public account ")
        setPriSpinn(false)
      }
    } catch (error) {
      toast.error("Profile has not changed to public, please try again")
      console.error(error);
      setPriSpinn(false)

    }
  }
  useEffect(() => {
    //get follower function 
    const getFollowers = async () => {
      try {
        const response = await axios.get(`${api}/follower/get-followers`)
        if (response) {
          const data = response.data
          const filtered = data.filter((item) => item.followerId === proData._id)
          setFollowers(filtered)

        }
      } catch (error) {
        console.error(error);
      }
    }
    getFollowers()
    //get followings function 
    const getFollowings = async () => {
      try {
        const response = await axios.get(`${api}/following/get-followings`)
        if (response) {
          const data = response.data
          const filtered = data.filter((item) => item.followerId === proData._id)
          setFollowings(filtered)
        }
      } catch (error) {
        console.error(error);
      }
    }
    getFollowings()
  }, [proData])

 

  // if token is not available it navigate to login page 
  useEffect(() => {
    if (!loginToken) {
      return navigate("/login")
    }
  }, [loginToken, profileToken, navigate])

  return (
    <>
      <ToastContainer />
      <div className='profile-container'>
        <div className='profile-sub-card'>
          <div className='username-top-card'>
            <h4>{proData.userName}</h4>
            <a
              className="text-white"
              data-bs-toggle="offcanvas"
              href="#offcanvasExample"
              role="button"
              aria-controls="offcanvasExample"
            >
              <span className="material-symbols-outlined" style={{ cursor: "pointer" }}>
                settings
              </span>
            </a>


          </div>
          {/* profile card  */}
          <div className='image-pro-card'>
            {fileSpinner ? <div className="spinner-border pic-in-profile border-2 text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div> : <>{spinner1 ? <img src="image-icon.jpeg" alt="profile-photo" className='pic-in-profile' />
              :
              <label htmlFor='pro-img'>
                <img style={{ cursor: "pointer" }} src={proData.image} alt="profile-photo" className='pic-in-profile' /> </label>}


            </>}


            <input id='pro-img' type='file' name='image' onChange={updatePhoto} className='d-none' />
            <div className='text-center'>
              <h4 className='count-num'>{filter.length}</h4>
              <h5 className='followers-text'>posts</h5>
            </div>
            <Link style={{ textDecoration: "none" }} to={`/id/${proData._id}`} className='text-center text-white'>
              <h4 className='count-num'>{followers.length}</h4>
              <h5 className='followers-text'>followers</h5>
            </Link>
            <Link style={{ textDecoration: "none" }} to={`/profile/${proData._id}`} className='text-center text-white'>
              <h4 className='count-num'>{followings.length}</h4>
              <h5 className='followers-text'>following</h5>
            </Link>
          </div>

          <div className='bio-name-card mt-2'>
            <h5 className='name-in-profile'>{proData.profileName}</h5>
            <p className='bio-in-pro'>{proData.bio}</p>

          </div>

          {/* post images division */}
          <div className='post-img-card-in-pro'>
            {spinner ?

              <>
                <img src="image-icon.jpeg" className='post-img-in-pro' />
                <img src="image-icon.jpeg" className='post-img-in-pro' />
                <img src="image-icon.jpeg" className='post-img-in-pro' />
                <img src="image-icon.jpeg" className='post-img-in-pro' />
                <img src="image-icon.jpeg" className='post-img-in-pro' />
                <img src="image-icon.jpeg" className='post-img-in-pro' />
              </>

              : <> {filter.length !== 0 ? <> {filter.map((item) => (
                <img key={item.id} style={{ cursor: "pointer" }} src={item.postImage} onClick={() => openPost(item._id)} className='post-img-in-pro' />
              ))}</> : <div className='d-flex justify-content-center align-items-center fs-6' style={{ width: "100vw", height: "30vh" }}>No Posts</div>}

              </>}

            {/* post modal  */}
            {modal ? <div className='post-modal-card' >
              <div className='profile-post-card '>
                <div className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center gap-2'> <img src={singlePost.profileImage} className='home-profile-img' />
                    <h5 className=''>{singlePost.userName}</h5></div>

                  <span style={{ cursor: "pointer" }} onClick={() => setModal(false)} className="material-symbols-outlined ">
                    close
                  </span>
                </div>

                <img src={singlePost.postImage} className='profile-post-img ' alt="post image" />

                <div className='like-share-card '>

                  {singlePost._id === like1 ?
                    <svg style={{ cursor: "pointer" }} onClick={() => likeFunc(singlePost._id)} xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-heart-fill heart-icon1" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314" />
                    </svg> :
                    <span style={{ cursor: "pointer", fontSize: "22px", width: "20px" }} onClick={() => likeFunc(singlePost._id)} className="material-symbols-outlined m-0 p-0" >favorite</span>}
                  <span data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight" onClick={() => { getAllComments(singlePost._id); setModal(false); }} style={{ fontSize: "22px", cursor: "pointer" }} className="material-symbols-outlined">
                    mode_comment
                  </span>
                  <span style={{ fontSize: "22px", cursor: "pointer" }} className="material-symbols-outlined">
                    share
                  </span>
                </div>
                <h5 className='img-caption-text-in-profile'>{singlePost.message}</h5>
                <h5 className='uploaded-date d-flex justify-content-between'>{today === singlePost.date ? "Uploaded Today" : `Uploaded on ${singlePost.date}`}
                  <span className='text-danger' onClick={() => deletePostFunc(singlePost._id)} style={{ cursor: "pointer" }} >{delSpinn ? <>

                    <div className="spinner-grow spinner-grow-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="spinner-grow spinner-grow-sm mx-1" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="spinner-grow spinner-grow-sm text-warning" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>

                  </> : "Delete Post"}</span></h5>
              </div>

            </div> : ""}


          </div>
        </div>
      </div>

      {/* large screen offcanvas  */}
      <div
        className="offcanvas offcanvas-end  bg-dark text-white"
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
                      </div></div> : <span onClick={() => deleteComment(item._id)} className="material-symbols-outlined delete-icon-in-chat">
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


      {/* offcanvas  */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex={-1}
        id="offcanvasExample"
        aria-labelledby="offcanvasExampleLabel"

      >
        <div className="offcanvas-header bg-dark text-white">
          <h4 className="offcanvas-title" id="offcanvasExampleLabel">
            Settings
          </h4>
          <button
            type="button"
            className="btn-close bg-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>   <hr className='m-0 ' />

        <div className="offcanvas-body bg-dark text-white">
          <div className='d-flex justify-content-between'>
            <div className='d-flex gap-2'> <span className="material-symbols-outlined">
              Lock
            </span><h5 className='offcanvas-text'>Account Privacy</h5></div>

            {priSpinn ? <><div className='mb-2' style={{ marginTop: "0", paddingTop: "0" }}  >
              <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="spinner-grow spinner-grow-sm mx-1" style={{ height: "10px", width: "10px" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div></div></> : <> {privateId ? <h5 className='offcanvas-text' onClick={setPublic}>Private</h5> : <h5 onClick={setPrivate} className='offcanvas-text'>Public</h5>}</>}

          </div>
          <hr className='hori-in-profile ' />

          <div className='d-flex gap-2'>
            <span className="material-symbols-outlined">
              notifications
            </span><h5 className='offcanvas-text'>Notifications</h5>
          </div>
          <div className='d-flex gap-2 pt-2'>
            <span className="material-symbols-outlined">
              archive
            </span><h5 className='offcanvas-text'>Archive</h5>
          </div>
          <div className='d-flex gap-2 pt-2'>
            <span className="material-symbols-outlined">
              save
            </span><h5 className='offcanvas-text'>Saved</h5>
          </div>
          <hr className='hori-in-profile ' />

          <div className='d-flex gap-2'>
            <span className="material-symbols-outlined">
              chat_bubble
            </span><h5 className='offcanvas-text'>Comments</h5>
          </div>
          <div className='d-flex gap-2 pt-2' data-bs-dismiss="offcanvas"
            aria-label="Close" onClick={() => setIdCard(true)}>
            <span className="material-symbols-outlined">
              id_card
            </span><h5 className='offcanvas-text'>Profile Id</h5>
          </div>
          <Link style={{ textDecoration: "none" }} to="/forgotpassword" className='d-flex gap-2 pt-2'>
            <span className="material-symbols-outlined text-white">
              password
            </span><h5 data-bs-dismiss="offcanvas"
              aria-label="Close" className='offcanvas-text'>Change password</h5>
          </Link>
          <hr className='hori-in-profile ' />
          <div className='d-flex gap-2 ' onClick={shareWebsite}>
            <span className="material-symbols-outlined">
              share
            </span><h5 className='offcanvas-text'>Share website</h5>
          </div>
          <a href="/chathub.apk" download="chathub.apk" className='d-flex gap-2 pt-2' style={{textDecoration:"none"}} >
            <span className="material-symbols-outlined text-white"  >
              download
            </span ><h5 className='offcanvas-text'>Download app</h5>
          </a>
          <hr className='hori-in-profile ' />
          <div onClick={logOut} className='d-flex gap-2 ' data-bs-dismiss="offcanvas"
            aria-label="Close">
            <h5 className='offcanvas-text text-danger'  >Log out</h5>
          </div>
          <div className='d-flex gap-2 pt-2' data-bs-toggle="modal" data-bs-target="#exampleModal">
            <h5 className='offcanvas-text text-danger' >Delete account</h5>
          </div>


        </div>
      </div>

      {/* account delete modal  */}
      <div className="modal fade  " id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog" >
          <div className="modal-content">
            <div className="modal-header bg-dark ">
              <h1 className="modal-title fs-5 " id="exampleModalLabel">Delete Account</h1>
              <button type="button" className="btn-close bg-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body  bg-dark">
              Are you sure want to delete account, your account and profile will be deleted.
            </div>
            <div className="modal-footer bg-dark ">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              {allDelSpinner ? <button className="btn btn-primary" type="button" disabled>
                <span className="spinner-grow spinner-grow-sm" style={{ marginRight: "0.5rem" }} aria-hidden="true"></span>
                <span role="status">Deleting...</span>
              </button> : <button data-bs-dismiss="offcanvas"
                aria-label="Close" onClick={deleteProfile} type="button" className="btn btn-primary">Delete</button>
              }
            </div>
          </div>
        </div>
      </div>

      {idCard ? <div className='id-card-for-id'>
        <div className="card ">
          <div className='bg-success d-flex justify-content-between align-items-center' style={{ borderTopLeftRadius: "5px", borderTopRightRadius: "5px", paddingRight: '12px' }}>
            <h5 className="card-header   text-white">Profile Id</h5>
            <span onClick={() => setIdCard(false)} style={{ cursor: "pointer" }} className="material-symbols-outlined text-white">
              close
            </span>
          </div>

          <div className="card-body pt-0">
            <h6 class="card-text my-3" style={{ lineHeight: "1.5" }}>Copy this unique profile Id and create group with<br /> profile Id : <span className='text-primary'>{proData._id}</span></h6>
            <button onClick={copyProfileId} className="btn btn-primary">Copy</button>
          </div>
        </div>
      </div> : ""}



    </>
  )
}

export default Profile