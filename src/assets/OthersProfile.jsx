import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import "../styles/profile.css"
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { proDataContext } from '../App';
import "../styles/groupChat.css"


const OthersProfile = () => {
    const api = import.meta.env.VITE_API_URL;
    const [proData, setProData] = useState([])
    const [profileData, setProfileData] = useContext(proDataContext)
    const [filter, setFilter] = useState([])
    const [spinner, setSpinner] = useState(false)
    const [spinner1, setSpinner1] = useState(false)
    const [modal, setModal] = useState(false)
    const [like, setLike] = useState(false)
    const [like1, setLike1] = useState("")
    const [today, setToday] = useState(false)
    const [singlePost, setSinglePost] = useState([])
    const { id } = useParams()
    const [preview, setPreview] = useState(false)
    const [toggle, setToggle] = useState(false)
    const [idCard, setIdCard] = useState(false)
    const [followers, setFollowers] = useState([])
    const [showF, setShowF] = useState(false)
    const [followSpin, setFollowSpin] = useState(false)
    const [followings, setFollowings] = useState([])
    const [follow, setFollow] = useState(false)
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
                profileImage: profileData.image,
                userName: profileData.userName,
                profileId: profileData._id,
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


    // fetching other's profile 
    useEffect(() => {

        const getProfile = async () => {
            try {

                setSpinner1(true)
                const response = await axios.get(`${api}/profile/get-profile/${id}`)
                if (response) {
                    setProData(response.data)
                    setSpinner1(false)
                }
            } catch (error) {
                console.log(error);
                setSpinner1(false)
                if (error.response) {
                    if (error.response.status === 404) {
                        alert("This user account not existed")
                    }
                }
            }
        }
        getProfile()
    }, [id])

    // fetching all post data 
    useEffect(() => {
        const getPostData = async () => {
            setSpinner(true)
            try {
                const response = await axios.get(`${api}/message/get-all-messages`)
                if (response) {
                    const data = response.data.allMessages.reverse()
                    const userId = proData._id
                    // filtering post from all posts 
                    const filteredData = data.filter((item) => item.profileId === userId)
                    setFilter(filteredData)
                    setSpinner(false)
                    getAllAccounts()
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


    // like function
    const likeFunc = (likeId) => {
        setLike(!like)
        setLike1(likeId)
    }

    // delete post function 
    const openPost = (postId) => {
        setModal(true)
        const singlePost = filter.find((item) => item._id === postId)
        setSinglePost(singlePost)
    }

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

    // fetching all accounts 
    const getAllAccounts = async () => {
        try {
            if (proData) {
                const response = await axios.get(`${api}/privateaccount/get-all-accounts`)
                if (response.data) {
                    const data = response.data
                    const isItAvailable = data.some((item) => item.profileId === proData._id)
                    setIdCard(false)
                    setToggle(!isItAvailable)
                    setIdCard(false)
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }


    // following function 

    const followingFunction = async () => {
        setFollowSpin(true)
        try {
            const followingData = {
                profileId: proData._id,
                userName: proData.userName,
                userId: profileData.user,
                followerId: profileData._id,
                profilePic: proData.image
            }
            const response = await axios.post(`${api}/following/following`, followingData)
            if (response) {
                followerFunction()
            }
        } catch (error) {
            console.error(error);
        }
    }

    // follower function 
    const followerFunction = async () => {
        try {
            const followerData = {
                profileId: profileData._id,
                userName: profileData.userName,
                userId: profileData.user,
                followerId: proData._id,
                profilePic: profileData.image
            }
            const response = await axios.post(`${api}/follower/follower`, followerData)
            if (response) {
                setFollow(true)
            }
        } catch (error) {
            console.error(error);
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


    }, [proData, follow])


    useEffect(() => {
        const isItAvail = followers.some((item) => item.profileId === profileData._id)
        setShowF(isItAvail)
        setFollowSpin(false)
    }, [followers])

    return (
        <div className='profile-container'>

            <ToastContainer />
            {/* image preview  */}
            {preview ? <div onClick={() => setPreview(false)} className='image-preview-card'>
                <img src={proData.image} alt={proData.profileName} className='preview-img' />
            </div> : ""}

            <div className='profile-sub-card'>
                <div className='username-top-card'>
                    <h4>{proData.userName}</h4>

                    {toggle ? <div onClick={() => setIdCard(true)} style={{ display: "flex", columnGap: "5px", paddingTop: "5px", cursor: "pointer", userSelect: "none" }}>
                        <span className="material-symbols-outlined">
                            id_card
                        </span>
                        <h5 className=''>Profile Id</h5>
                    </div> : ""}

                    {idCard && toggle ? <div className='id-card-for-id'>
                        <div className="card ">
                            <div className='bg-success d-flex justify-content-between align-items-center' style={{ borderTopLeftRadius: "5px", borderTopRightRadius: "5px", paddingRight: '12px' }}>
                                <h5 className="card-header   text-white">Profile Id</h5>
                                <span onClick={() => setIdCard(false)} style={{ cursor: "pointer" }} className="material-symbols-outlined text-white">
                                    close
                                </span>
                            </div>

                            <div className="card-body pt-0">
                                <h6 class="card-text my-3" style={{ lineHeight: "1.5" }}>Copy this unique profile Id and create group with profile Id : <span className='text-primary'>{proData._id}</span></h6>
                                <button onClick={copyProfileId} className="btn btn-primary">Copy</button>
                            </div>
                        </div>
                    </div> : ""}

                </div>
                {/* profile card  */}
                <div className='image-pro-card'>
                    {spinner1 ? <div className="spinner-border pic-in-profile border-2 text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                        :
                        <img style={{ cursor: "pointer" }} src={proData.image} alt="profile-photo" onClick={() => setPreview(true)} className='pic-in-profile' />}

                    <div className='text-center'>
                        <h4 className='count-num'>{filter.length}</h4>
                        <h5 className='followers-text'>posts</h5>
                    </div>
                    <Link style={{ textDecoration: "none" }} to={`/id/${proData._id}`} className='text-center text-white'>
                        <h4 className='count-num'>{followers.length}</h4>
                        <h5 className='followers-text'>followers</h5>
                    </Link>

                    {followSpin ? <button className="follow-btn" type="button" disabled>
                        <span className="spinner-border spinner-border-sm" aria-hidden="true" style={{ marginTop: "0.3rem" }}></span>
                        <span className="visually-hidden" role="status">Loading...</span>
                    </button> : <> {showF ? <Link style={{ textDecoration: "none" }} to={`/profile/${proData._id}`} className='text-center text-white'>
                        <h4 className='count-num'>{followings.length}</h4>
                        <h5 className='followers-text'>following</h5>
                    </Link> : <button onClick={followingFunction} className=' follow-btn'>Follow</button>}
                    </>}



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
                            </h5>
                        </div>

                    </div> : ""}

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
                                        <img src={profileData.image} className='home-profile-img ' style={{ width: "30px", height: "30px" }} />
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
                                                    </div></div> : <span onClick={() => deleteComment(item._id)} className={item.profileId === profileData._id ? "material-symbols-outlined delete-icon-in-chat" : "d-none"}>
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
                </div>
            </div>
        </div>
    )
}

export default OthersProfile