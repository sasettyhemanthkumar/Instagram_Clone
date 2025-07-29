import React, { useContext, useEffect, useRef, useState } from 'react'
import "../styles/groupChat.css"
import axios from 'axios'
import { loginTokenContext, proDataContext, profileTokenContext } from '../App';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import app from '../firebase';
import { toast, ToastContainer } from 'react-toastify';

const PersonalChat = () => {
    const api = import.meta.env.VITE_API_URL;
    const [data, setData] = useState([])
    const [spinner, setSpinner] = useState(false)
    const [loginToken] = useContext(loginTokenContext)
    const [profileToken] = useContext(profileTokenContext)
    const navigate = useNavigate()
    const [text, setText] = useState("")
    const [proData] = useContext(proDataContext)
    const chatEndRef = useRef(null)
    const [hover, setHover] = useState("")
    const [delSpinner, setDelSpinner] = useState("")
    const { groupId } = useParams()
    const [photo, setPhoto] = useState("")
    const [imgCard, setImgCard] = useState(false)
    const fileRef = useRef(null)

    // mouseover event 

    const mouseOver = (cardId) => {
        setHover(cardId)
    }
    // scrollBottom automatically when new message comes 
    const scrollBottom = () => {
        if (data.length) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }
    useEffect(() => {
        if (data.length) {
            scrollBottom()
        }
    }, [data])

    // this function for focus when user open message it focus on input box 
    useEffect(() => {
        const fileFunc = () => {
            fileRef.current.focus()
        }
        fileFunc()
    }, [])



    // fire base generating image to url 
    const photoFunc = async (e) => {
        const photo = e.target.files[0]
        if (photo) {
            setImgCard(true)
            try {
                const storage = getStorage(app)
                const storageRef = ref(storage, "personal/" + photo.name)
                await uploadBytes(storageRef, photo)
                const downloadUrl = await getDownloadURL(storageRef)
                if (downloadUrl) {
                    setPhoto(downloadUrl)
                    setText(".")
                }
            } catch (error) {
                console.error(error);

            }
        }
    }

    // sending text message function 
    const sendText = async () => {
        try {
            const currentDate = new Date().toLocaleString("en-GB", {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            });

            // sending message object data 
            const chatData = {
                text: text,
                date: currentDate,
                image: proData.image,
                userName: proData.userName,
                userId: proData._id,
                groupId: groupId,
                photo: photo
            }
            setSpinner(true)
            const response = await axios.post(`${api}/personalchat/send-chat`, chatData)

            if (response) {
                setSpinner(false)
                setText("")
                setPhoto("")
                setImgCard(false)
            }
        } catch (error) {
            console.error(error);
            setSpinner(false)
            toast.error("Message has not send try again")
        }

    }


    // delete chat function 
    const deleteChat = async (delId) => {
        setDelSpinner(delId)
        try {
            const response = await axios.delete(`${api}/personalchat/delete-chat/${delId}`)
            if (response) {
                const remainingData = data.filter((item) => item._id !== delId)
                setData(remainingData)
                delSpinner("")
            }
        } catch (error) {
            console.error(error);
            delSpinner("")

        }
    }

    // fetching all messages 

    useEffect(() => {

        const getAllChats = async () => {
            try {
                const response = await axios.get(`${api}/personalchat/get-all-chats`)
                if (response) {
                    setData(response.data)

                }
            } catch (error) {
                console.error(error);
                toast.error("Please wait try again server is down")
            }
        }

        const interval = setInterval(getAllChats, 5000)

        return () => clearInterval(interval)

    }, [])


    // if token is not available it navigate to login page 
    useEffect(() => {
        if (!loginToken || !profileToken) {
            navigate("/login")
        }
    }, [loginToken, navigate, profileToken])

    return (
        <div className='chat-container'>
            <ToastContainer />
            {/* chat inpu box  */}
            <div className='chat-input-card fixed-bottom' >
                <div className='chat-sub-card'>
                    <label htmlFor='photo-input' className='camera-icon-in-chat' style={{ borderRadius: "0px" }}>
                        <span className="material-symbols-outlined" >
                            photo_camera
                        </span>
                        <input onChange={photoFunc} type='file' id='photo-input' className='d-none' />
                    </label>
                    <textarea style={{ borderRadius: "0px" }} ref={fileRef} value={text} onChange={(e) => setText(e.target.value)} type='text' className='input-box-in-chat' placeholder='Message...'></textarea>
                    {spinner ? <button style={{ borderRadius: "0px" }} className="chat-send-bt text-white" type="button" disabled>
                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        <span className="visually-hidden" role="status">Loading...</span>
                    </button> : <>{text ? <button style={{ borderRadius: "0px" }} className='chat-send-bt' onClick={sendText}>Send</button> : ""}</>}


                </div>
            </div>


            {/* image card  */}
            {imgCard ? <>

                {photo ? <><div className="photo-card-in-personal">
                    <img src={photo} className='photo-in-personal' />

                </div></> : <div className='photo-card-in-personal gap-2'>
                    <h5>Loading Photo</h5>
                    <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="spinner-grow spinner-grow-sm mx-1" style={{ height: "10px", width: "10px" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>}
            </> : ""}





            {/* Messages card  */}
            <div className='message-main-card'>
                {/* spinner  */}
                {data.length === 0 ? <><div className="d-flex justify-content-center align-items-center" id='spinner-in-chat'>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div></> :
                    // map function 
                    <>  {data.map((item) => (
                        <div className={proData._id === item.userId ? 'chat-user-card-right' : ""} onMouseOver={() => mouseOver(item._id)}>
                            <div key={item._id} className={item.groupId === groupId ? "chat-text-main-card" : "d-none"} id={proData._id === item.userId ? "chat-text-main-card1" : ""}>
                                <div className='chat-img-user-card'>
                                    <Link to={`/${item.userId}`} style={{ textDecoration: "none" }} className='d-flex align-items-center gap-2' >
                                        <img src={item.image} className='chat-user-img' alt={item.userName} />
                                        <h5 className="user-name-in-chat" >{item.userName}</h5>
                                    </Link>
                                    {delSpinner === item._id ? <div className='mb-2' style={{ marginTop: "0", paddingTop: "0" }}  >
                                        <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <div className="spinner-grow spinner-grow-sm mx-1" style={{ height: "10px", width: "10px" }} role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <div className="spinner-grow spinner-grow-sm text-white" style={{ height: "10px", width: "10px" }} role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div></div> : <>  {hover === item._id ? <> {proData._id === item.userId ? <span onClick={() => deleteChat(item._id)} className="material-symbols-outlined delete-icon-in-chat">
                                            delete
                                        </span> : ""}</> : ""}</>}
                                </div>
                                <div className='text-card'>
                                    <img src={item.photo} className={item.photo === "" ? "d-none" : "photo-in-personal-chat"} />
                                    <h5 className='chat-text'>{item.text}</h5>

                                    <span className='date-in-chat'>{item.date}</span>
                                </div>
                            </div>

                        </div>

                    ))}
                        <div ref={chatEndRef}></div>

                    </>}


            </div>



        </div>
    )
}

export default PersonalChat